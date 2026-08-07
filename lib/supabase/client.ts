import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Dev-only console debugging aid: `window.supabase.auth.getUser()` etc.
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    (window as unknown as { supabase: typeof client }).supabase = client;
  }

  return client;
}
