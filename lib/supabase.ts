import { createClient } from "@supabase/supabase-js"

// Environment variable detection with fallbacks
function getSupabaseCredentials() {
  // Check multiple possible environment variable names
  const possibleUrls = [
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_PROJECT_URL,
  ]

  const possibleAnonKeys = [
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_PUBLIC_KEY,
  ]

  const possibleServiceKeys = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_KEY,
    process.env.SUPABASE_SECRET_KEY,
  ]

  // Filter out undefined, empty, or placeholder values
  const cleanValue = (val: string | undefined) => {
    if (!val || val.trim() === "" || val === "undefined" || val.startsWith("your_")) {
      return null
    }
    return val.trim()
  }

  const supabaseUrl = possibleUrls.find(cleanValue) || "https://xyzcompany.supabase.co"
  const supabaseAnonKey =
    possibleAnonKeys.find(cleanValue) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTU2NzI0MCwiZXhwIjoxOTYxMTQzMjQwfQ.1BqRi0KejFBrPZKinDaXBk9Q1dv3ep_SuxUpWc4kcHY"
  const supabaseServiceKey =
    possibleServiceKeys.find(cleanValue) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1NTY3MjQwLCJleHAiOjE5NjExNDMyNDB9.V7t0UVRc9Bk9QM8sLyCACEvVMzIMa0fVDy503Mvua_0"

  console.log("🔧 Supabase Configuration:")
  console.log("- URL:", supabaseUrl)
  console.log("- Anon Key:", supabaseAnonKey.substring(0, 20) + "...")
  console.log("- Service Key:", supabaseServiceKey.substring(0, 20) + "...")

  return {
    supabaseUrl: cleanValue(supabaseUrl) || "https://xyzcompany.supabase.co",
    supabaseAnonKey: cleanValue(supabaseAnonKey) || "demo-anon-key",
    supabaseServiceKey: cleanValue(supabaseServiceKey) || "demo-service-key",
  }
}

const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = getSupabaseCredentials()

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Server-side Supabase client
export function createServerSupabaseClient() {
  // A simple server-side client using the Service Role key.
  // If you later need cookie-based auth, switch to
  // `@supabase/auth-helpers-nextjs`.
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Database types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_active: boolean
  rating?: number
  prep_time?: number
  stock_quantity?: number
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Variation {
  id: string
  name: string
  type: string
  price_modifier: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AddOn {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  max_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_name?: string
  total: number
  status: "pending" | "completed" | "cancelled"
  payment_method: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  name: string
  price: number
  quantity: number
  variations?: { name: string; price_modifier: number }[]
  add_ons?: { name: string; price: number; quantity: number }[]
  total: number
}

export interface VisitorLog {
  id: string
  ip_address?: string
  user_agent?: string
  page_url: string
  visited_at: string
}

export interface ProductWithRelations extends Product {
  variations?: Variation[]
  add_ons?: AddOn[]
}

// Database helper functions
export async function testDatabaseConnection() {
  try {
    const client = createServerSupabaseClient()
    const { data, error } = await client.from("products").select("count").limit(1)

    if (error) {
      console.error("Database connection test failed:", error)
      return false
    }

    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("Database connection test error:", error)
    return false
  }
}
