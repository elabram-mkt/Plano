import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Works with either the RLS-scoped client (lib/supabase/client.ts,
// lib/supabase/server.ts) or the service-role client (lib/supabase/admin.ts)
// — callers decide which to pass in, functions here don't care.
export type DbClient = SupabaseClient<Database>;

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceInsert =
  Database["public"]["Tables"]["workspaces"]["Insert"];

export type WorkspaceMember =
  Database["public"]["Tables"]["workspace_members"]["Row"];
export type WorkspaceMemberWithProfile = WorkspaceMember & {
  profile: Profile;
};

export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];

export type SocialAccount =
  Database["public"]["Tables"]["social_accounts"]["Row"];
// Safe subset for anything rendered client-side — never select the raw
// row (access_token_enc / refresh_token_enc) outside trusted server code.
export type SocialAccountPublic = Omit<
  SocialAccount,
  "access_token_enc" | "refresh_token_enc"
>;

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export type PostTarget = Database["public"]["Tables"]["post_targets"]["Row"];
export type PostMedia = Database["public"]["Tables"]["post_media"]["Row"];

export type PostWithRelations = Post & {
  post_targets: PostTarget[];
  post_media: PostMedia[];
};

export type Subscription =
  Database["public"]["Tables"]["subscriptions"]["Row"];

// Mirror the literal sets baked into the RLS policies / trigger defaults.
// Not enforced by a DB CHECK constraint — treat as an app-level contract.
export type MemberRole = "owner" | "admin" | "editor";
export type PostStatus =
  | "draft"
  | "scheduled"
  | "pending_review"
  | "approved"
  | "published";

export interface PostFilters {
  status?: PostStatus | PostStatus[];
  platform?: string;
  authorId?: string;
  scheduledFrom?: string; // ISO timestamp, inclusive
  scheduledTo?: string; // ISO timestamp, inclusive
}

export interface CreatePostInput {
  caption?: string;
  platformCaptions?: Record<string, string>;
  status?: PostStatus;
  scheduledAt?: string | null;
  repeatInterval?: number | null;
  briefJson?: Post["brief_json"];
  visualPrompts?: Post["visual_prompts"];
  targets?: { platform: string; socialAccountId?: string | null }[];
}

export interface UpdatePostInput {
  caption?: string | null;
  platformCaptions?: Record<string, string>;
  status?: PostStatus;
  approvalComment?: string | null;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  repeatInterval?: number | null;
  briefJson?: Post["brief_json"];
  visualPrompts?: Post["visual_prompts"];
}
