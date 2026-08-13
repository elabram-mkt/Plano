import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishPost } from "@/lib/publishing/publishPost";

interface CronResult {
  postId: string;
  success: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: duePosts, error } = await admin
    .from("posts")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("[cron publish] failed to query due posts", error.message);
    return NextResponse.json({ error: "Internal server error while querying due posts." }, { status: 500 });
  }

  console.log(`[cron publish] found ${duePosts?.length ?? 0} due posts`);

  const results: CronResult[] = [];

  if (duePosts && duePosts.length > 0) {
    // Atomic claim: only rows still `scheduled` at the moment of this update
    // are actually claimed by this invocation, so concurrent runs can't both
    // publish the same post.
    const { data: claimedPosts, error: claimError } = await admin
      .from("posts")
      .update({ status: "processing" })
      .eq("status", "scheduled")
      .in(
        "id",
        duePosts.map((p) => p.id)
      )
      .select("id");

    if (claimError) {
      console.error("[cron publish] failed to claim due posts", claimError.message);
      return NextResponse.json({ error: "Internal server error while claiming due posts." }, { status: 500 });
    }

    for (const post of claimedPosts ?? []) {
      try {
        await publishPost(admin, post.id);
        results.push({ postId: post.id, success: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[cron publish] failed to publish post", post.id, message);

        const { error: revertError } = await admin
          .from("posts")
          .update({ status: "scheduled" })
          .eq("id", post.id);

        if (revertError) {
          console.error("[cron publish] failed to revert post status to scheduled", post.id, revertError.message);
        }

        results.push({ postId: post.id, success: false, error: message });
      }
    }
  }

  console.log(`[cron publish] processed ${results.length} posts`);

  return NextResponse.json({ processed: results.length, results });
}
