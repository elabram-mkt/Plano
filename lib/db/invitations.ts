import type { DbClient, Invitation, MemberRole } from "./types";

// public.invitations has RLS *enabled* but zero policies defined in the
// current schema — with RLS on and no policy, every role except service_role
// is denied by default. Until a migration adds explicit policies (e.g. an
// "admins manage invitations" policy scoped by member_role(), and a narrow
// select for the invitee matched on token/email), every function in this
// file must be called with the service-role client (lib/supabase/admin.ts)
// from a Server Action / Route Handler — never from the browser.

export async function createInvitation(
  supabaseAdmin: DbClient,
  input: { workspaceId: string; email: string; role?: MemberRole }
): Promise<Invitation> {
  const { data, error } = await supabaseAdmin
    .from("invitations")
    .insert({
      workspace_id: input.workspaceId,
      email: input.email,
      role: input.role ?? "editor",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInvitations(
  supabaseAdmin: DbClient,
  workspaceId: string
): Promise<Invitation[]> {
  const { data, error } = await supabaseAdmin
    .from("invitations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInvitationByToken(
  supabaseAdmin: DbClient,
  token: string
): Promise<Invitation | null> {
  const { data, error } = await supabaseAdmin
    .from("invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function revokeInvitation(
  supabaseAdmin: DbClient,
  invitationId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("invitations")
    .delete()
    .eq("id", invitationId);

  if (error) throw error;
}

// Validates the token + expiry, adds the caller as a workspace member, then
// deletes the invitation. Caller is responsible for confirming `userEmail`
// matches invitation.email (and that the signed-in user is who they claim to
// be) before calling this — this function itself doesn't check identity.
export async function acceptInvitation(
  supabaseAdmin: DbClient,
  token: string,
  userId: string
): Promise<Invitation> {
  const invitation = await getInvitationByToken(supabaseAdmin, token);

  if (!invitation) {
    throw new Error("Invitation not found");
  }
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error("Invitation has expired");
  }

  const { error: memberError } = await supabaseAdmin
    .from("workspace_members")
    .insert({
      workspace_id: invitation.workspace_id,
      user_id: userId,
      role: invitation.role,
    });

  if (memberError) throw memberError;

  const { error: deleteError } = await supabaseAdmin
    .from("invitations")
    .delete()
    .eq("id", invitation.id);

  if (deleteError) throw deleteError;

  return invitation;
}
