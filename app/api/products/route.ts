import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const runtime = "nodejs"

/**
 * Safe JSON parser that handles HTML error pages
 */
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    // If it's not JSON, it might be an HTML error page
    if (text.includes("<html") || text.includes("<!DOCTYPE")) {
      return { error: "Received HTML response instead of JSON", htmlContent: text.substring(0, 200) }
    }
    return { error: "Invalid JSON response", content: text.substring(0, 200) }
  }
}

/**
 * GET /api/products
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/products] Starting product fetch...")

    // Test environment variables
    const supabaseUrl = process.env.SUPABASE_PROJECT_URL || process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("🔧 Environment check:")
    console.log("- SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
    console.log("- SERVICE_KEY:", serviceKey ? "✅ Set" : "❌ Missing")

    if (!supabaseUrl || !serviceKey) {
      console.error("❌ Missing Supabase credentials")
      return NextResponse.json(
        {
          data: [],
          error: "Missing Supabase credentials",
          debug: {
            hasUrl: !!supabaseUrl,
            hasKey: !!serviceKey,
          },
        },
        { headers, status: 200 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Test basic connection first
    console.log("🔍 Testing Supabase connection...")
    const { data: testData, error: testError } = await supabase.from("products").select("count").limit(1)

    if (testError) {
      console.error("❌ Supabase connection test failed:", testError)
      return NextResponse.json(
        {
          data: [],
          error: "Database connection failed",
          supabaseError: testError.message,
          details: testError,
        },
        { headers, status: 200 },
      )
    }

    console.log("✅ Supabase connection successful")

    // Fetch products with error handling
    console.log("🔍 Fetching products...")
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        category,
        image_url,
        is_active,
        rating,
        prep_time,
        stock_quantity,
        created_at,
        updated_at
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ [/api/products] Supabase query error:", error)
      return NextResponse.json(
        {
          data: [],
          error: "Failed to fetch products",
          supabaseError: error.message,
          details: error,
        },
        { headers, status: 200 },
      )
    }

    console.log(`✅ Successfully fetched ${products?.length || 0} products`)

    // Ensure we return an array
    const safeProducts = Array.isArray(products) ? products : []

    return NextResponse.json(
      {
        data: safeProducts,
        count: safeProducts.length,
        timestamp: new Date().toISOString(),
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error("❌ [/api/products] Unexpected exception:", err)

    // Handle different error types
    let errorMessage = "Unknown error occurred"
    let errorDetails = {}

    if (err instanceof Error) {
      errorMessage = err.message
      errorDetails = {
        name: err.name,
        stack: err.stack?.substring(0, 500),
      }
    }

    return NextResponse.json(
      {
        data: [],
        error: errorMessage,
        type: "exception",
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { headers, status: 200 },
    )
  }
}
