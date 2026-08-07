import type { DbClient, MemberRole, WorkspaceMemberWithProfile } from "./types";

export async function getMembers(
  supabase: DbClient,
  workspaceId: string
): Promise<WorkspaceMemberWithProfile[]> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("*, profile:profiles(*)")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data as unknown as WorkspaceMemberWithProfile[];
}

// Requires the caller to already be owner/admin — enforced by the
// "admins manage members" RLS policy.
export async function updateMemberRole(
  supabase: DbClient,
  workspaceId: string,
  userId: string,
  role: MemberRole
): Promise<void> {
  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function removeMember(
  supabase: DbClient,
  workspaceId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) throw error;
}
