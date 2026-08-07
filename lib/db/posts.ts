import type {
  CreatePostInput,
  DbClient,
  Post,
  PostFilters,
  PostWithRelations,
  UpdatePostInput,
} from "./types";

export async function getPosts(
  supabase: DbClient,
  workspaceId: string,
  filters: PostFilters = {}
): Promise<PostWithRelations[]> {
  // `!inner` turns the post_targets embed into a join, so `.eq("post_targets.platform", …)`
  // actually filters which posts come back instead of just shaping the nested payload.
  const select = filters.platform
    ? "*, post_targets!inner(*), post_media(*)"
    : "*, post_targets(*), post_media(*)";

  let query = supabase
    .from("posts")
    .select(select)
    .eq("workspace_id", workspaceId)
    .order("scheduled_at", { ascending: true, nullsFirst: false });

  if (filters.platform) {
    query = query.eq("post_targets.platform", filters.platform);
  }
  if (filters.status) {
    query = Array.isArray(filters.status)
      ? query.in("status", filters.status)
      : query.eq("status", filters.status);
  }
  if (filters.authorId) {
    query = query.eq("author_id", filters.authorId);
  }
  if (filters.scheduledFrom) {
    query = query.gte("scheduled_at", filters.scheduledFrom);
  }
  if (filters.scheduledTo) {
    query = query.lte("scheduled_at", filters.scheduledTo);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PostWithRelations[];
}

export async function getPost(
  supabase: DbClient,
  postId: string
): Promise<PostWithRelations | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, post_targets(*), post_media(*)")
    .eq("id", postId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as PostWithRelations | null;
}

export async function createPost(
  supabase: DbClient,
  workspaceId: string,
  input: CreatePostInput
): Promise<Post> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      workspace_id: workspaceId,
      author_id: user.id,
      caption: input.caption ?? null,
      platform_captions: input.platformCaptions ?? {},
      status: input.status ?? "draft",
      scheduled_at: input.scheduledAt ?? null,
      repeat_interval: input.repeatInterval ?? null,
      brief_json: input.briefJson ?? null,
      visual_prompts: input.visualPrompts ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  // post_targets only has a SELECT policy for members ("members read
  // targets") — there's no INSERT policy for owner/admin/editor, so this
  // step needs either a service-role client (lib/supabase/admin.ts) or a
  // new policy such as:
  //   create policy "editors write targets" on public.post_targets
  //     for insert with check (exists (
  //       select 1 from public.posts p where p.id = post_id
  //       and public.member_role(p.workspace_id) in ('owner','admin','editor')
  //     ));
  if (input.targets?.length) {
    const { error: targetsError } = await supabase.from("post_targets").insert(
      input.targets.map((t) => ({
        post_id: post.id,
        platform: t.platform,
        social_account_id: t.socialAccountId ?? null,
      }))
    );
    if (targetsError) throw targetsError;
  }

  return post;
}

export async function updatePost(
  supabase: DbClient,
  postId: string,
  patch: UpdatePostInput
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({
      ...(patch.caption !== undefined && { caption: patch.caption }),
      ...(patch.platformCaptions !== undefined && {
        platform_captions: patch.platformCaptions,
      }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.approvalComment !== undefined && {
        approval_comment: patch.approvalComment,
      }),
      ...(patch.scheduledAt !== undefined && {
        scheduled_at: patch.scheduledAt,
      }),
      ...(patch.publishedAt !== undefined && {
        published_at: patch.publishedAt,
      }),
      ...(patch.repeatInterval !== undefined && {
        repeat_interval: patch.repeatInterval,
      }),
      ...(patch.briefJson !== undefined && { brief_json: patch.briefJson }),
      ...(patch.visualPrompts !== undefined && {
        visual_prompts: patch.visualPrompts,
      }),
      // No update trigger on this table — updated_at only has a default for
      // INSERT, so we stamp it here on every write.
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Enforced by "admins delete posts" — owner/admin only, editors will get a
// permission-denied error from Postgres.
export async function deletePost(
  supabase: DbClient,
  postId: string
): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}
