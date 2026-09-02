import { getPost } from "@/lib/db/posts";
import { publishToFacebook, type PublishResult } from "@/lib/publishing/meta";
import { publishToInstagram } from "@/lib/publishing/instagram";
import { publishToLinkedIn } from "@/lib/publishing/linkedin";
import type { DbClient } from "@/lib/db/types";

export interface TargetResult {
  postTargetId: string;
  platform: string;
  status: "published" | "failed";
  externalPostId?: string;
  error?: string;
}

type PublishFn = (supabase: DbClient, postId: string, workspaceId: string) => Promise<PublishResult>;

// Add a new platform by adding one entry here — the loop below looks up the
// right publish function per target instead of branching on platform.
const PUBLISHERS: Record<string, PublishFn> = {
  facebook: publishToFacebook,
  instagram: publishToInstagram,
  linkedin: publishToLinkedIn,
};

export async function publishPost(
  admin: DbClient,
  postId: string
): Promise<{ postId: string; results: TargetResult[] }> {
  const post = await getPost(admin, postId);
  if (!post) {
    throw new Error("Post not found.");
  }

  const publishableTargets = post.post_targets.filter((t) => t.platform in PUBLISHERS);
  const results: TargetResult[] = [];

  for (const target of publishableTargets) {
    if (target.publish_status === "published") {
      results.push({
        postTargetId: target.id,
        platform: target.platform,
        status: "published",
        externalPostId: target.external_post_id ?? undefined,
      });
      continue;
    }

    const publish = PUBLISHERS[target.platform];
    const result = await publish(admin, postId, post.workspace_id);

    if (result.success) {
      const { error: updateError } = await admin
        .from("post_targets")
        .update({
          publish_status: "published",
          external_post_id: result.externalPostId ?? null,
          error_message: null,
        })
        .eq("id", target.id);

      if (updateError) {
        console.error("[publish route] failed to record post_targets success", updateError.message);
      }

      results.push({
        postTargetId: target.id,
        platform: target.platform,
        status: "published",
        externalPostId: result.externalPostId,
      });
    } else {
      const { error: updateError } = await admin
        .from("post_targets")
        .update({
          publish_status: "failed",
          error_message: result.error ?? "Unknown error",
        })
        .eq("id", target.id);

      if (updateError) {
        console.error("[publish route] failed to record post_targets failure", updateError.message);
      }

      results.push({
        postTargetId: target.id,
        platform: target.platform,
        status: "failed",
        error: result.error,
      });
    }
  }

  const allSucceeded = publishableTargets.length > 0 && results.every((r) => r.status === "published");

  if (allSucceeded) {
    const { error: postUpdateError } = await admin
      .from("posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", postId);

    if (postUpdateError) {
      console.error("[publish route] failed to update post status", postUpdateError.message);
    }
  }

  return { postId, results };
}
