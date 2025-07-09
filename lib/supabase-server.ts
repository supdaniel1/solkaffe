/**
 * Server-side Supabase client
 *
 * IMPORTANT:
 * – Uses the Service Role key so it can read all tables.
 * – NEVER expose that key on the client.
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_PROJECT_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing Supabase env vars. Make sure SUPABASE_PROJECT_URL and SUPABASE_SECRET_KEY are set.")
}

export const supabaseServer = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})

/** Helper identical to the pattern used by `@supabase/auth-helpers-nextjs` */
export function createServerSupabaseClient() {
  return supabaseServer
}
