import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto/tokens";
import { connectChannel } from "@/lib/db/channels";

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

function redirectTo(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.nextUrl.origin));
  response.cookies.delete("linkedin_oauth_nonce");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return redirectTo(request, "/channels?error=linkedin_denied");
  }

  if (!code || !state) {
    return redirectTo(request, "/channels?error=invalid_state");
  }

  let workspaceId: string;
  let nonce: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    workspaceId = decoded.workspaceId;
    nonce = decoded.nonce;
    if (!workspaceId || !nonce) throw new Error("Missing workspaceId/nonce in state");
  } catch {
    return redirectTo(request, "/channels?error=invalid_state");
  }

  const storedNonce = request.cookies.get("linkedin_oauth_nonce")?.value;
  if (!storedNonce || storedNonce !== nonce) {
    return redirectTo(request, "/channels?error=invalid_state");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, "/channels?error=unauthorized");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return redirectTo(request, "/channels?error=unauthorized");
  }

  const redirectUri = new URL("/api/oauth/linkedin/callback", request.nextUrl.origin).toString();

  try {
    const tokenBody = new URLSearchParams();
    tokenBody.set("grant_type", "authorization_code");
    tokenBody.set("code", code);
    tokenBody.set("redirect_uri", redirectUri);
    tokenBody.set("client_id", process.env.LINKEDIN_CLIENT_ID!);
    tokenBody.set("client_secret", process.env.LINKEDIN_CLIENT_SECRET!);

    const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody,
    });
    if (!tokenRes.ok) {
      console.error("[linkedin oauth] token exchange failed", tokenRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const tokenData = await tokenRes.json();
    console.log("[linkedin oauth] token exchange succeeded");

    const userinfoRes = await fetch(LINKEDIN_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userinfoRes.ok) {
      console.error("[linkedin oauth] fetching userinfo failed", userinfoRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const userinfoData = await userinfoRes.json();
    console.log("[linkedin oauth] fetched userinfo");

    const accessTokenEnc = encryptToken(tokenData.access_token);

    await connectChannel(supabase, {
      workspaceId,
      platform: "linkedin",
      externalId: userinfoData.sub,
      accountName: userinfoData.name,
      accessTokenEnc,
      connectedBy: user.id,
    });
    console.log("[linkedin oauth] connected linkedin channel");

    return redirectTo(request, "/channels?connected=linkedin");
  } catch (err) {
    console.error(
      "[linkedin oauth] connection flow failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return redirectTo(request, "/channels?error=connection_failed");
  }
}
