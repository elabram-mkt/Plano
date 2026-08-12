import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPost } from "@/lib/db/posts";
import { publishToFacebook } from "@/lib/publishing/meta";

interface TargetResult {
  postTargetId: string;
  platform: string;
  status: "published" | "failed";
  externalPostId?: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // Reads/writes below use the service-role client — post_targets and posts
    // only have SELECT policies for the acting user, and this route is the
    // "publish scheduler" case admin.ts calls out as needing it.
    const admin = createAdminClient();

    const post = await getPost(admin, postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", post.workspace_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "Not a member of this workspace." }, { status: 403 });
    }

    const facebookTargets = post.post_targets.filter((t) => t.platform === "facebook");
    const results: TargetResult[] = [];

    for (const target of facebookTargets) {
      if (target.publish_status === "published") {
        results.push({
          postTargetId: target.id,
          platform: target.platform,
          status: "published",
          externalPostId: target.external_post_id ?? undefined,
        });
        continue;
      }

      const result = await publishToFacebook(admin, postId, post.workspace_id);

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

    const allSucceeded = facebookTargets.length > 0 && results.every((r) => r.status === "published");

    if (allSucceeded) {
      const { error: postUpdateError } = await admin
        .from("posts")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", postId);

      if (postUpdateError) {
        console.error("[publish route] failed to update post status", postUpdateError.message);
      }
    }

    return NextResponse.json({ postId, results });
  } catch (err) {
    console.error("[publish route] uncaught error", err instanceof Error ? err.message : String(err));
    // debugMessage is temporary for debugging — remove before this route is
    // used in production, since it can leak internal error details to the client.
    return NextResponse.json(
      {
        error: "Internal server error while publishing.",
        debugMessage: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
