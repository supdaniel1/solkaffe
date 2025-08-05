import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * GET /api/products - Fallback implementation with mock data
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/products] Starting product fetch...")

    // Check environment variables
    const supabaseUrl =
      process.env.SUPABASE_PROJECT_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("🔧 Environment check:")
    console.log("- SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
    console.log("- SERVICE_KEY:", serviceKey ? "✅ Set" : "❌ Missing")

    // If no valid Supabase credentials, return mock data
    if (!supabaseUrl || !serviceKey || supabaseUrl.includes("xyzcompany") || serviceKey.includes("demo")) {
      console.log("⚠️ Using mock data due to missing/invalid Supabase credentials")
      return NextResponse.json(
        {
          data: getMockProducts(),
          source: "mock",
          message: "Using mock data - configure Supabase for live data",
        },
        { headers, status: 200 },
      )
    }

    // Try to create Supabase client
    let supabase
    try {
      const { createClient } = await import("@supabase/supabase-js")
      supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      })
    } catch (importError) {
      console.error("❌ Failed to import Supabase client:", importError)
      return NextResponse.json(
        {
          data: getMockProducts(),
          source: "mock",
          error: "Supabase client import failed",
        },
        { headers, status: 200 },
      )
    }

    // Test connection with timeout
    console.log("🔍 Testing Supabase connection...")

    const connectionPromise = supabase.from("products").select("id").limit(1)

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000))

    try {
      const { data: testData, error: testError } = (await Promise.race([connectionPromise, timeoutPromise])) as any

      if (testError) {
        console.error("❌ Supabase connection test failed:", testError)
        throw new Error(`Database error: ${testError.message}`)
      }

      console.log("✅ Supabase connection successful")

      // Fetch actual products
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
        console.error("❌ Products query failed:", error)
        throw new Error(`Query error: ${error.message}`)
      }

      console.log(`✅ Successfully fetched ${products?.length || 0} products from database`)

      return NextResponse.json(
        {
          data: products || [],
          source: "database",
          count: products?.length || 0,
        },
        { headers, status: 200 },
      )
    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError)
      console.log("⚠️ Falling back to mock data")

      return NextResponse.json(
        {
          data: getMockProducts(),
          source: "mock",
          error: dbError instanceof Error ? dbError.message : "Database connection failed",
          fallback: true,
        },
        { headers, status: 200 },
      )
    }
  } catch (err) {
    console.error("❌ [/api/products] Unexpected exception:", err)

    return NextResponse.json(
      {
        data: getMockProducts(),
        source: "mock",
        error: err instanceof Error ? err.message : "Unknown error",
        fallback: true,
      },
      { headers, status: 200 },
    )
  }
}

/**
 * Mock products for fallback when database is unavailable
 */
function getMockProducts() {
  return [
    {
      id: "1",
      name: "Espresso",
      description: "Rich and bold espresso shot",
      price: 89,
      category: "ESPRESSO",
      image_url: "/menu-espresso-updated.jpg",
      is_active: true,
      rating: 4.8,
      prep_time: 2,
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Latte",
      description: "Espresso with steamed milk",
      price: 109,
      category: "ESPRESSO",
      image_url: "/menu-espresso-updated.jpg",
      is_active: true,
      rating: 4.7,
      prep_time: 3,
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Frappuccino",
      description: "Blended coffee drink with ice",
      price: 129,
      category: "COLD_DRINKS",
      image_url: "/menu-frappucino-updated.jpg",
      is_active: true,
      rating: 4.6,
      prep_time: 4,
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Matcha Latte",
      description: "Premium matcha with steamed milk",
      price: 119,
      category: "TEA",
      image_url: "/menu-matcha-updated.jpg",
      is_active: true,
      rating: 4.5,
      prep_time: 3,
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}
