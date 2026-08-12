import "server-only";
import type { DbClient } from "@/lib/db/types";
import { getChannels, getChannelWithTokens } from "@/lib/db/channels";
import { getPost } from "@/lib/db/posts";
import { decryptToken } from "@/lib/crypto/tokens";
import type { PublishResult } from "@/lib/publishing/meta";

const GRAPH_API_URL = "https://graph.facebook.com/v21.0";
const STATUS_POLL_INTERVAL_MS = 2000;
const STATUS_POLL_MAX_ATTEMPTS = 10;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Server-only: handles the decrypted Instagram (Facebook Page) access token
// in memory. Publishes a single post to a workspace's connected Instagram
// business account. Doesn't touch post_targets — the caller is responsible
// for recording the result.
export async function publishToInstagram(
  supabase: DbClient,
  postId: string,
  workspaceId: string
): Promise<PublishResult> {
  try {
    const channels = await getChannels(supabase, workspaceId);
    const instagramChannel = channels.find(
      (c) => c.platform === "instagram" && c.status === "active"
    );

    if (!instagramChannel) {
      return { success: false, error: "No active Instagram connection found for this workspace." };
    }

    const channelWithTokens = await getChannelWithTokens(supabase, instagramChannel.id);
    if (!channelWithTokens?.access_token_enc || !channelWithTokens.external_id) {
      return { success: false, error: "Instagram connection is missing its access token." };
    }

    let accessToken: string;
    try {
      accessToken = decryptToken(channelWithTokens.access_token_enc);
    } catch {
      console.error("[publishToInstagram] token decryption failed");
      return { success: false, error: "Failed to decrypt Instagram access token." };
    }

    const post = await getPost(supabase, postId);
    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const platformCaptions = (post.platform_captions as Record<string, string> | null) ?? {};
    const caption = platformCaptions.instagram || post.caption || "";
    const mediaUrl = post.post_media[0]?.storage_path;

    if (!mediaUrl) {
      return { success: false, error: "Instagram requires an image or video." };
    }

    const igUserId = channelWithTokens.external_id;

    const createBody = new URLSearchParams();
    createBody.set("image_url", mediaUrl);
    createBody.set("caption", caption);
    createBody.set("access_token", accessToken);

    const createResponse = await fetch(`${GRAPH_API_URL}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: createBody,
    });
    console.log("[publishToInstagram] media container request completed", {
      ok: createResponse.ok,
      status: createResponse.status,
    });

    if (!createResponse.ok) {
      return {
        success: false,
        error: `Instagram API returned status ${createResponse.status} while creating the media container.`,
      };
    }

    const createData = await createResponse.json();
    const creationId = createData?.id as string | undefined;
    if (!creationId) {
      console.error("[publishToInstagram] response missing creation id");
      return { success: false, error: "Instagram API response did not include a media container id." };
    }

    let statusCode: string | undefined;
    for (let attempt = 0; attempt < STATUS_POLL_MAX_ATTEMPTS; attempt++) {
      await sleep(STATUS_POLL_INTERVAL_MS);

      const statusUrl = new URL(`${GRAPH_API_URL}/${creationId}`);
      statusUrl.searchParams.set("fields", "status_code");
      statusUrl.searchParams.set("access_token", accessToken);

      const statusResponse = await fetch(statusUrl);
      if (!statusResponse.ok) {
        console.error("[publishToInstagram] status poll request failed", statusResponse.status);
        continue;
      }

      const statusData = await statusResponse.json();
      statusCode = statusData?.status_code;

      if (statusCode === "FINISHED") break;
      if (statusCode === "ERROR") {
        return { success: false, error: "Instagram failed to process the media container." };
      }
    }

    if (statusCode !== "FINISHED") {
      return { success: false, error: "Timed out waiting for Instagram to process the media container." };
    }

    const publishBody = new URLSearchParams();
    publishBody.set("creation_id", creationId);
    publishBody.set("access_token", accessToken);

    const publishResponse = await fetch(`${GRAPH_API_URL}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: publishBody,
    });
    console.log("[publishToInstagram] media publish request completed", {
      ok: publishResponse.ok,
      status: publishResponse.status,
    });

    if (!publishResponse.ok) {
      return {
        success: false,
        error: `Instagram API returned status ${publishResponse.status} while publishing.`,
      };
    }

    const publishData = await publishResponse.json();
    if (!publishData?.id) {
      console.error("[publishToInstagram] publish response missing post id");
      return { success: false, error: "Instagram API response did not include a post id." };
    }

    return { success: true, externalPostId: publishData.id as string };
  } catch (err) {
    console.error(
      "[publishToInstagram] publish failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return { success: false, error: "Unexpected error while publishing to Instagram." };
  }
}
