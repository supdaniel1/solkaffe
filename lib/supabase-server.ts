/**
 * Server-side Supabase client with enhanced error handling
 */

import { createClient } from "@supabase/supabase-js"

// Get environment variables with multiple fallbacks
function getSupabaseCredentials() {
  const supabaseUrl =
    process.env.SUPABASE_PROJECT_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL

  const serviceKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  console.log("🔧 Supabase Server Configuration:")
  console.log("- URL:", supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "❌ MISSING")
  console.log("- Service Key:", serviceKey ? `${serviceKey.substring(0, 20)}...` : "❌ MISSING")

  return { supabaseUrl, serviceKey }
}

const { supabaseUrl, serviceKey } = getSupabaseCredentials()

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase environment variables!")
  console.error("Required variables:")
  console.error("- SUPABASE_PROJECT_URL or SUPABASE_URL")
  console.error("- SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY")
  throw new Error("Missing Supabase environment variables. Check your .env.local file.")
}

// Create the server client
export const supabaseServer = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "User-Agent": "cafe-ordering-system/1.0",
    },
  },
})

/** Helper function for consistent server client creation */
export function createServerSupabaseClient() {
  return supabaseServer
}

/** Test database connection */
export async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...")

    const { data, error } = await supabaseServer.from("products").select("count").limit(1)

    if (error) {
      console.error("❌ Database connection test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Database connection successful")
    return { success: true, data }
  } catch (error) {
    console.error("❌ Database connection test exception:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
