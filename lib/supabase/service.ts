import { createClient } from "@supabase/supabase-js";

// Bypasses RLS — only use in server-side code (API routes, server components)
export const createServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
