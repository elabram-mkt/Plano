import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const META_OAUTH_URL = "https://www.facebook.com/v21.0/dialog/oauth";
const META_SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json(
      { error: "Missing workspaceId query parameter." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (!membership) {
    return NextResponse.json(
      { error: "Not a member of this workspace." },
      { status: 403 }
    );
  }

  const redirectUri = new URL("/api/oauth/meta/callback", request.nextUrl.origin).toString();

  const state = Buffer.from(
    JSON.stringify({ workspaceId, nonce: crypto.randomUUID() })
  ).toString("base64url");

  const authorizeUrl = new URL(META_OAUTH_URL);
  authorizeUrl.searchParams.set("client_id", process.env.META_APP_ID!);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", META_SCOPES);
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl);
}
