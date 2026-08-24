import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPost } from "@/lib/db/posts";
import { publishPost } from "@/lib/publishing/publishPost";

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

    const response = await publishPost(admin, postId);

    return NextResponse.json(response);
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
