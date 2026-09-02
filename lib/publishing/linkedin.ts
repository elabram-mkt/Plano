import "server-only";
import type { DbClient } from "@/lib/db/types";
import { getChannels, getChannelWithTokens } from "@/lib/db/channels";
import { getPost } from "@/lib/db/posts";
import { decryptToken } from "@/lib/crypto/tokens";
import type { PublishResult } from "@/lib/publishing/meta";

const LINKEDIN_API_URL = "https://api.linkedin.com/rest";
const LINKEDIN_VERSION = "202401";

function linkedinHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": LINKEDIN_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };
}

// Server-only: handles the decrypted LinkedIn access token in memory.
// Publishes a single post to a workspace's connected LinkedIn account.
// Doesn't touch post_targets — the caller is responsible for recording the
// result.
export async function publishToLinkedIn(
  supabase: DbClient,
  postId: string,
  workspaceId: string
): Promise<PublishResult> {
  try {
    const channels = await getChannels(supabase, workspaceId);
    const linkedinChannel = channels.find(
      (c) => c.platform === "linkedin" && c.status === "active"
    );

    if (!linkedinChannel) {
      return { success: false, error: "No active LinkedIn connection found for this workspace." };
    }

    const channelWithTokens = await getChannelWithTokens(supabase, linkedinChannel.id);
    if (!channelWithTokens?.access_token_enc || !channelWithTokens.external_id) {
      return { success: false, error: "LinkedIn connection is missing its access token." };
    }

    let accessToken: string;
    try {
      accessToken = decryptToken(channelWithTokens.access_token_enc);
    } catch {
      console.error("[publishToLinkedIn] token decryption failed");
      return { success: false, error: "Failed to decrypt LinkedIn access token." };
    }

    const post = await getPost(supabase, postId);
    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const platformCaptions = (post.platform_captions as Record<string, string> | null) ?? {};
    const text = platformCaptions.linkedin || post.caption || "";
    const mediaUrl = post.post_media[0]?.storage_path;

    const authorUrn = `urn:li:person:${channelWithTokens.external_id}`;

    let imageUrn: string | undefined;
    if (mediaUrl) {
      const initRes = await fetch(`${LINKEDIN_API_URL}/images?action=initializeUpload`, {
        method: "POST",
        headers: linkedinHeaders(accessToken),
        body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
      });
      console.log("[publishToLinkedIn] image upload initialization completed", {
        ok: initRes.ok,
        status: initRes.status,
      });

      if (!initRes.ok) {
        return {
          success: false,
          error: `LinkedIn API returned status ${initRes.status} while initializing the image upload.`,
        };
      }

      const initData = await initRes.json();
      const uploadUrl = initData?.value?.uploadUrl as string | undefined;
      imageUrn = initData?.value?.image as string | undefined;

      if (!uploadUrl || !imageUrn) {
        console.error("[publishToLinkedIn] initialize upload response missing uploadUrl/image");
        return { success: false, error: "LinkedIn API response did not include an upload URL or image URN." };
      }

      const mediaRes = await fetch(mediaUrl);
      if (!mediaRes.ok) {
        console.error("[publishToLinkedIn] fetching post media failed", mediaRes.status);
        return { success: false, error: "Failed to fetch the post's media for upload." };
      }
      const mediaBytes = await mediaRes.arrayBuffer();

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: mediaBytes,
      });
      console.log("[publishToLinkedIn] image upload completed", {
        ok: putRes.ok,
        status: putRes.status,
      });

      if (!putRes.ok) {
        return {
          success: false,
          error: `LinkedIn API returned status ${putRes.status} while uploading the image.`,
        };
      }
    }

    const postBody: Record<string, unknown> = {
      author: authorUrn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    if (imageUrn) {
      postBody.content = { media: { id: imageUrn } };
    }

    const postRes = await fetch(`${LINKEDIN_API_URL}/posts`, {
      method: "POST",
      headers: linkedinHeaders(accessToken),
      body: JSON.stringify(postBody),
    });
    console.log("[publishToLinkedIn] create post request completed", {
      ok: postRes.ok,
      status: postRes.status,
    });

    if (postRes.status !== 201) {
      return { success: false, error: `LinkedIn API returned status ${postRes.status} while publishing.` };
    }

    const externalPostId = postRes.headers.get("x-restli-id");
    if (!externalPostId) {
      console.error("[publishToLinkedIn] response missing x-restli-id header");
      return { success: false, error: "LinkedIn API response did not include a post id." };
    }

    return { success: true, externalPostId };
  } catch (err) {
    console.error(
      "[publishToLinkedIn] publish failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return { success: false, error: "Unexpected error while publishing to LinkedIn." };
  }
}
