import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto/tokens";
import { connectChannel } from "@/lib/db/channels";

const THREADS_GRAPH_API_URL = "https://graph.threads.net";

function redirectTo(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.nextUrl.origin));
  response.cookies.delete("threads_oauth_nonce");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return redirectTo(request, "/channels?error=threads_denied");
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

  const storedNonce = request.cookies.get("threads_oauth_nonce")?.value;
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

  const redirectUri = new URL("/api/oauth/threads/callback", request.nextUrl.origin).toString();

  try {
    const shortLivedBody = new URLSearchParams();
    shortLivedBody.set("client_id", process.env.THREADS_APP_ID!);
    shortLivedBody.set("client_secret", process.env.THREADS_APP_SECRET!);
    shortLivedBody.set("grant_type", "authorization_code");
    shortLivedBody.set("redirect_uri", redirectUri);
    shortLivedBody.set("code", code);

    const shortLivedRes = await fetch(`${THREADS_GRAPH_API_URL}/oauth/access_token`, {
      method: "POST",
      body: shortLivedBody,
    });
    if (!shortLivedRes.ok) {
      console.error("[threads oauth] short-lived token exchange failed", shortLivedRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const shortLivedData = await shortLivedRes.json();
    console.log("[threads oauth] short-lived token exchange succeeded");

    const longLivedUrl = new URL(`${THREADS_GRAPH_API_URL}/access_token`);
    longLivedUrl.searchParams.set("grant_type", "th_exchange_token");
    longLivedUrl.searchParams.set("client_secret", process.env.THREADS_APP_SECRET!);
    longLivedUrl.searchParams.set("access_token", shortLivedData.access_token);

    const longLivedRes = await fetch(longLivedUrl);
    if (!longLivedRes.ok) {
      console.error("[threads oauth] long-lived token exchange failed", longLivedRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const longLivedData = await longLivedRes.json();
    console.log("[threads oauth] long-lived token exchange succeeded");

    const meUrl = new URL(`${THREADS_GRAPH_API_URL}/v1.0/me`);
    meUrl.searchParams.set("fields", "id,username");
    meUrl.searchParams.set("access_token", longLivedData.access_token);

    const meRes = await fetch(meUrl);
    if (!meRes.ok) {
      console.error("[threads oauth] fetching threads profile failed", meRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const meData = await meRes.json();
    console.log("[threads oauth] fetched threads profile");

    const accessTokenEnc = encryptToken(longLivedData.access_token);

    await connectChannel(supabase, {
      workspaceId,
      platform: "threads",
      externalId: meData.id,
      accountName: meData.username,
      accessTokenEnc,
      connectedBy: user.id,
    });
    console.log("[threads oauth] connected threads channel");

    return redirectTo(request, "/channels?connected=threads");
  } catch (err) {
    console.error(
      "[threads oauth] connection flow failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return redirectTo(request, "/channels?error=connection_failed");
  }
}
