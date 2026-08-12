import "server-only";
import type { DbClient } from "@/lib/db/types";
import { getChannels, getChannelWithTokens } from "@/lib/db/channels";
import { getPost } from "@/lib/db/posts";
import { decryptToken } from "@/lib/crypto/tokens";

const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  error?: string;
}

// Server-only: handles the decrypted Facebook Page access token in memory.
// Publishes a single post to a workspace's connected Facebook Page. Doesn't
// touch post_targets — the caller is responsible for recording the result.
export async function publishToFacebook(
  supabase: DbClient,
  postId: string,
  workspaceId: string
): Promise<PublishResult> {
  try {
    const channels = await getChannels(supabase, workspaceId);
    const facebookChannel = channels.find(
      (c) => c.platform === "facebook" && c.status === "active"
    );

    if (!facebookChannel) {
      return { success: false, error: "No active Facebook connection found for this workspace." };
    }

    const channelWithTokens = await getChannelWithTokens(supabase, facebookChannel.id);
    if (!channelWithTokens?.access_token_enc || !channelWithTokens.external_id) {
      return { success: false, error: "Facebook connection is missing its access token." };
    }

    let accessToken: string;
    try {
      accessToken = decryptToken(channelWithTokens.access_token_enc);
    } catch {
      console.error("[publishToFacebook] token decryption failed");
      return { success: false, error: "Failed to decrypt Facebook access token." };
    }

    const post = await getPost(supabase, postId);
    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const platformCaptions = (post.platform_captions as Record<string, string> | null) ?? {};
    const message = platformCaptions.facebook || post.caption || "";

    const body = new URLSearchParams();
    body.set("message", message);
    body.set("access_token", accessToken);

    const response = await fetch(`${GRAPH_API_URL}/${channelWithTokens.external_id}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    console.log("[publishToFacebook] feed post request completed", {
      ok: response.ok,
      status: response.status,
    });

    if (!response.ok) {
      return { success: false, error: `Facebook API returned status ${response.status}.` };
    }

    const data = await response.json();
    if (!data?.id) {
      console.error("[publishToFacebook] response missing post id");
      return { success: false, error: "Facebook API response did not include a post id." };
    }

    return { success: true, externalPostId: data.id as string };
  } catch (err) {
    console.error(
      "[publishToFacebook] publish failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return { success: false, error: "Unexpected error while publishing to Facebook." };
  }
}
