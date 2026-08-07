import type { DbClient, Workspace } from "./types";

export async function getWorkspaces(supabase: DbClient): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getWorkspace(
  supabase: DbClient,
  workspaceId: string
): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getWorkspaceBySlug(
  supabase: DbClient,
  slug: string
): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// public.create_workspace(ws_name, ws_slug) is a security-definer RPC that
// inserts the workspace and its owner's workspace_members row together
// (owner comes from auth.uid() server-side). That sidesteps the same
// bootstrapping gap handle_new_user works around for the signup workspace:
// the "admins manage members" policy checks member_role(workspace_id),
// which returns null before any membership row exists, so a brand-new
// workspace's owner couldn't otherwise self-insert into workspace_members
// under RLS. Runs fine with the regular RLS-scoped client — no service role
// needed here.
export async function createWorkspace(
  supabase: DbClient,
  input: { name: string; slug: string }
): Promise<Workspace> {
  const { data, error } = await supabase.rpc("create_workspace", {
    ws_name: input.name,
    ws_slug: input.slug,
  });
  if (error) throw error;

  const workspace = await getWorkspace(supabase, data);
  if (!workspace) throw new Error("Workspace not found after creation");
  return workspace;
}

export async function updateWorkspace(
  supabase: DbClient,
  workspaceId: string,
  patch: Partial<Pick<Workspace, "name" | "slug" | "plan" | "profile_key">>
): Promise<Workspace> {
  const { data, error } = await supabase
    .from("workspaces")
    .update(patch)
    .eq("id", workspaceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
