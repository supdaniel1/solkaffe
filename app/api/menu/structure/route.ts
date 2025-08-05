import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export const runtime = "nodejs"

/**
 * GET /api/menu/structure - Get complete menu structure with categories and products
 */
export async function GET(request: NextRequest) {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/menu/structure] Fetching menu structure...")

    const supabase = createClient()

    // Get main categories with subcategories
    const { data: mainCategories, error: mainCategoriesError } = await supabase
      .from("main_categories")
      .select(`
        *,
        subcategories (
          *,
          products (
            id,
            name,
            price,
            image_url,
            is_active,
            is_featured,
            rating,
            prep_time,
            stock_quantity
          )
        )
      `)
      .eq("is_active", true)
      .order("display_order")

    if (mainCategoriesError) {
      console.error("Error fetching main categories:", mainCategoriesError)
      return NextResponse.json({ error: "Failed to fetch menu structure" }, { status: 500 })
    }

    // Get featured products across all categories
    const { data: featuredProducts, error: featuredError } = await supabase
      .from("products")
      .select(`
        *,
        main_category:main_categories(*),
        subcategory:subcategories(*)
      `)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (featuredError) {
      console.error("Error fetching featured products:", featuredError)
    }

    // Count total active products
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    const response = {
      main_categories: mainCategories || [],
      featured_products: featuredProducts || [],
      total_products: totalProducts || 0,
    }

    console.log("✅ Successfully returning menu structure")

    return NextResponse.json(response, { headers, status: 200 })
  } catch (error) {
    console.error("Menu structure API error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { headers, status: 500 },
    )
  }
}
