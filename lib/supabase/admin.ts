import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Service-role client — bypasses RLS entirely. `import "server-only"` makes
// any accidental client-component import fail the build instead of leaking
// SUPABASE_SERVICE_ROLE_KEY to the browser.
//
// Reach for this only where the schema has no policy for the authenticated
// role, e.g.:
//   - public.invitations (RLS enabled, zero policies defined)
//   - public.post_targets / public.post_media writes (select-only policies;
//     inserts/updates are meant to happen server-side per the schema comment)
//   - webhooks and the publish scheduler
// Never call createAdminClient() from a Client Component or expose its
// result across a request boundary.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
