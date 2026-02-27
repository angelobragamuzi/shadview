import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const SupabaseClientService = {
  browser: createBrowserSupabaseClient,
  server: createServerSupabaseClient,
};
