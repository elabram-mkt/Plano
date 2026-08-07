import type { DbClient, SocialAccount, SocialAccountPublic } from "./types";

const PUBLIC_COLUMNS =
  "id, workspace_id, provider, platform, account_name, external_id, token_expires_at, status, connected_by, created_at";

export async function getChannels(
  supabase: DbClient,
  workspaceId: string
): Promise<SocialAccountPublic[]> {
  const { data, error } = await supabase
    .from("social_accounts")
    .select(PUBLIC_COLUMNS)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as unknown as SocialAccountPublic[];
}

// Tokens are encrypted before they ever reach this layer — callers encrypt
// with TOKEN_ENCRYPTION_KEY server-side and pass the ciphertext in. Requires
// owner/admin per "admins manage socials".
export async function connectChannel(
  supabase: DbClient,
  input: {
    workspaceId: string;
    platform: string;
    accountName?: string;
    externalId?: string;
    accessTokenEnc: string;
    refreshTokenEnc?: string;
    tokenExpiresAt?: string;
    connectedBy: string;
  }
): Promise<SocialAccountPublic> {
  const { data, error } = await supabase
    .from("social_accounts")
    .insert({
      workspace_id: input.workspaceId,
      platform: input.platform,
      account_name: input.accountName,
      external_id: input.externalId,
      access_token_enc: input.accessTokenEnc,
      refresh_token_enc: input.refreshTokenEnc,
      token_expires_at: input.tokenExpiresAt,
      connected_by: input.connectedBy,
    })
    .select(PUBLIC_COLUMNS)
    .single();

  if (error) throw error;
  return data as unknown as SocialAccountPublic;
}

export async function disconnectChannel(
  supabase: DbClient,
  socialAccountId: string
): Promise<void> {
  const { error } = await supabase
    .from("social_accounts")
    .update({ status: "disconnected" })
    .eq("id", socialAccountId);

  if (error) throw error;
}

// Server-only: returns the encrypted token columns, needed by the publish
// worker to decrypt and call out to Ayrshare. Never expose this to a client
// component or serialize the result back to the browser.
export async function getChannelWithTokens(
  supabase: DbClient,
  socialAccountId: string
): Promise<SocialAccount | null> {
  const { data, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("id", socialAccountId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
