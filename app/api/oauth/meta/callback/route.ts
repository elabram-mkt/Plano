import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto/tokens";
import { connectChannel } from "@/lib/db/channels";

const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

function redirectTo(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.nextUrl.origin));
  response.cookies.delete("meta_oauth_nonce");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return redirectTo(request, "/channels?error=meta_denied");
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

  const storedNonce = request.cookies.get("meta_oauth_nonce")?.value;
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

  const redirectUri = new URL("/api/oauth/meta/callback", request.nextUrl.origin).toString();

  try {
    const shortLivedUrl = new URL(`${GRAPH_API_URL}/oauth/access_token`);
    shortLivedUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    shortLivedUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    shortLivedUrl.searchParams.set("redirect_uri", redirectUri);
    shortLivedUrl.searchParams.set("code", code);

    const shortLivedRes = await fetch(shortLivedUrl);
    if (!shortLivedRes.ok) {
      console.error("[meta oauth] short-lived token exchange failed", shortLivedRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const shortLivedData = await shortLivedRes.json();
    console.log("[meta oauth] short-lived token exchange succeeded");

    const longLivedUrl = new URL(`${GRAPH_API_URL}/oauth/access_token`);
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedData.access_token);

    const longLivedRes = await fetch(longLivedUrl);
    if (!longLivedRes.ok) {
      console.error("[meta oauth] long-lived token exchange failed", longLivedRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const longLivedData = await longLivedRes.json();
    console.log("[meta oauth] long-lived token exchange succeeded");

    const pagesUrl = new URL(`${GRAPH_API_URL}/me/accounts`);
    pagesUrl.searchParams.set("fields", "id,name,access_token");
    pagesUrl.searchParams.set("access_token", longLivedData.access_token);

    const pagesRes = await fetch(pagesUrl);
    if (!pagesRes.ok) {
      console.error("[meta oauth] fetching pages failed", pagesRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const pagesData = await pagesRes.json();
    console.log("[meta oauth] fetched pages", { count: pagesData?.data?.length ?? 0 });

    const page = pagesData?.data?.[0];
    if (!page) {
      console.error("[meta oauth] no pages returned for this user");
      return redirectTo(request, "/channels?error=connection_failed");
    }

    const igUrl = new URL(`${GRAPH_API_URL}/${page.id}`);
    igUrl.searchParams.set("fields", "instagram_business_account{id,username}");
    igUrl.searchParams.set("access_token", page.access_token);

    const igRes = await fetch(igUrl);
    if (!igRes.ok) {
      console.error("[meta oauth] fetching linked instagram account failed", igRes.status);
      return redirectTo(request, "/channels?error=connection_failed");
    }
    const igData = await igRes.json();
    const igAccount = igData?.instagram_business_account;
    console.log("[meta oauth] fetched instagram account", { found: Boolean(igAccount) });

    const pageTokenEnc = encryptToken(page.access_token);

    await connectChannel(supabase, {
      workspaceId,
      platform: "facebook",
      externalId: page.id,
      accountName: page.name,
      accessTokenEnc: pageTokenEnc,
      connectedBy: user.id,
    });
    console.log("[meta oauth] connected facebook channel");

    if (igAccount) {
      await connectChannel(supabase, {
        workspaceId,
        platform: "instagram",
        externalId: igAccount.id,
        accountName: igAccount.username,
        accessTokenEnc: pageTokenEnc,
        connectedBy: user.id,
      });
      console.log("[meta oauth] connected instagram channel");
      return redirectTo(request, "/channels?connected=facebook,instagram");
    }

    return redirectTo(request, "/channels?connected=facebook");
  } catch (err) {
    console.error(
      "[meta oauth] connection flow failed",
      err instanceof Error ? err.message : "unknown error"
    );
    return redirectTo(request, "/channels?error=connection_failed");
  }
}
