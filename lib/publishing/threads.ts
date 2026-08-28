import "server-only";
import type { DbClient } from "@/lib/db/types";
import { getChannels, getChannelWithTokens } from "@/lib/db/channels";
import { getPost } from "@/lib/db/posts";
import { decryptToken } from "@/lib/crypto/tokens";
import type { PublishResult } from "@/lib/publishing/meta";

const GRAPH_API_URL = "https://graph.threads.net/v1.0";
const STATUS_POLL_INTERVAL_MS = 2000;
const STATUS_POLL_MAX_ATTEMPTS = 10;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Server-only: handles the decrypted Threads access token in memory.
// Publishes a single post to a workspace's connected Threads account.
// Doesn't touch post_targets — the caller is responsible for recording
// the result.
export async function publishToThreads(
  supabase: DbClient,
  postId: string,
  workspaceId: string
): Promise<PublishResult> {
  try {
    const channels = await getChannels(supabase, workspaceId);
    const threadsChannel = channels.find(
      (c) => c.platform === "threads" && c.status === "active"
    );

    if (!threadsChannel) {
      return { success: false, error: "No active Threads connection found for this workspace." };
    }

    const channelWithTokens = await getChannelWithTokens(supabase, threadsChannel.id);
    if (!channelWithTokens?.access_token_enc || !channelWithTokens.external_id) {
      return { success: false, error: "Threads connection is missing its access token." };
    }

    let accessToken: string;
    try {
      accessToken = decryptToken(channelWithTokens.access_token_enc);
    } catch {
      console.error("[publishToThreads] token decryption failed");
      return { success: false, error: "Failed to decrypt Threads access token." };
    }

    const post = await getPost(supabase, postId);
    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const platformCaptions = (post.platform_captions as Record<string, string> | null) ?? {};
    const text = platformCaptions.threads || post.caption || "";
    const mediaUrl = post.post_media[0]?.storage_path;

    const threadsUserId = channelWithTokens.external_id;

    const createBody = new URLSearchParams();
    createBody.set("access_token", accessToken);
    createBody.set("text", text);
    if (mediaUrl) {
      createBody.set("media_type", "IMAGE");
      createBody.set("image_url", mediaUrl);
    } else {
      createBody.set("media_type", "TEXT");
    }

    const createResponse = await fetch(`${GRAPH_API_URL}/${threadsUserId}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: createBody,
    });
    console.log("[publishToThreads] media container request completed", {
      ok: createResponse.ok,
      status: createResponse.status,
    });

    if (!createResponse.ok) {
      return {
        success: false,
        error: `Threads API returned status ${createResponse.status} while creating the media container.`,
      };
    }

    const createData = await createResponse.json();
    const creationId = createData?.id as string | undefined;
    if (!creationId) {
      console.error("[publishToThreads] response missing creation id");
      return { success: false, error: "Threads API response did not include a media container id." };
    }

    let status: string | undefined;
    for (let attempt = 0; attempt < STATUS_POLL_MAX_ATTEMPTS; attempt++) {
      await sleep(STATUS_POLL_INTERVAL_MS);

      const statusUrl = new URL(`${GRAPH_API_URL}/${creationId}`);
      statusUrl.searchParams.set("fields", "status");
      statusUrl.searchParams.set("access_token", accessToken);

      const statusResponse = await fetch(statusUrl);
      if (!statusResponse.ok) {
        console.error("[publishToThreads] status poll request failed", statusResponse.status);
        continue;
      }

      const statusData = await statusResponse.json();
      status = statusData?.status;

      if (status === "FINISHED") break;
      if (status === "ERROR") {
        return { success: false, error: "Threads failed to process the media container." };
      }
    }

    if (status !== "FINISHED") {
      return { success: false, error: "Timed out waiting for Threads to process the media container." };
    }

    const publishBody = new URLSearchParams();
    publishBody.set("creation_id", creationId);
    publishBody.set("access_token", accessToken);

    const publishResponse = await fetch(`${GRAPH_API_URL}/${threadsUserId}/threads_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: publishBody,
    });
    console.log("[publishToThreads] publish request completed", {
      ok: publishResponse.ok,
      status: publishResponse.status,
    });

    if (!publishResponse.ok) {
      return {
        success: false,
        error: `Threads API returned status ${publishResponse.status} while publishing.`,
      };
    }

    const publishData = await publishResponse.json();
    if (!publishData?.id) {
      console.error("[publishToThreads] publish response missing post id");
      return { success: false, error: "Threads API response did not include a post id." };
    }

    return { success: true, externalPostId: publishData.id as string };
  } catch (err) {
    console.error(
      "[publishToThreads] publish failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return { success: false, error: "Unexpected error while publishing to Threads." };
  }
}
