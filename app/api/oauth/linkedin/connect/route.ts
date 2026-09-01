import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LINKEDIN_OAUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_SCOPES = ["openid", "profile", "email", "w_member_social"].join(" ");

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

  const redirectUri = new URL(
    "/api/oauth/linkedin/callback",
    request.nextUrl.origin
  ).toString();

  const nonce = crypto.randomUUID();
  const state = Buffer.from(
    JSON.stringify({ workspaceId, nonce })
  ).toString("base64url");

  const authorizeUrl = new URL(LINKEDIN_OAUTH_URL);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", process.env.LINKEDIN_CLIENT_ID!);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", LINKEDIN_SCOPES);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("linkedin_oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 5,
    path: "/",
  });

  return response;
}
