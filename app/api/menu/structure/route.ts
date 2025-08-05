import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * GET /api/menu/structure - Get complete menu structure with categories and products
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/menu/structure] Fetching menu structure...")

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
      return NextResponse.json(getMockMenuStructure(), { headers, status: 200 })
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
      return NextResponse.json(getMockMenuStructure(), { headers, status: 200 })
    }

    // Test connection with timeout
    console.log("🔍 Testing Supabase connection...")

    const connectionPromise = supabase.from("main_categories").select("id").limit(1)
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000))

    try {
      const { data: testData, error: testError } = (await Promise.race([connectionPromise, timeoutPromise])) as any

      if (testError) {
        console.error("❌ Supabase connection test failed:", testError)
        throw new Error(`Database error: ${testError.message}`)
      }

      console.log("✅ Supabase connection successful")

      // Try to fetch actual data
      const { data: mainCategories, error: mainCategoriesError } = await supabase
        .from("main_categories")
        .select(`
          *,
          subcategories (
            *,
            products (
              id,
              name,
              description,
              price,
              image_url,
              is_active,
              is_featured,
              rating,
              prep_time,
              stock_quantity,
              tags
            )
          )
        `)
        .eq("is_active", true)
        .order("display_order")

      if (mainCategoriesError) {
        console.error("❌ Main categories query failed:", mainCategoriesError)
        throw new Error(`Query error: ${mainCategoriesError.message}`)
      }

      // Get featured products
      const { data: featuredProducts, error: featuredError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6)

      if (featuredError) {
        console.error("❌ Featured products query failed:", featuredError)
      }

      // Count total products
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      const response = {
        main_categories: mainCategories || [],
        featured_products: featuredProducts || [],
        total_products: totalProducts || 0,
        source: "database",
      }

      console.log(`✅ Successfully fetched menu structure from database`)
      return NextResponse.json(response, { headers, status: 200 })
    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError)
      console.log("⚠️ Falling back to mock data")
      return NextResponse.json(getMockMenuStructure(), { headers, status: 200 })
    }
  } catch (err) {
    console.error("❌ [/api/menu/structure] Unexpected exception:", err)
    return NextResponse.json(getMockMenuStructure(), { headers, status: 200 })
  }
}

/**
 * Mock menu structure for fallback when database is unavailable
 */
function getMockMenuStructure() {
  return {
    main_categories: [
      {
        id: "1",
        name: "Beverages",
        description: "All drink items including coffee, tea, and specialty beverages",
        display_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subcategories: [
          {
            id: "1",
            main_category_id: "1",
            name: "Espresso",
            description: "Classic espresso-based drinks",
            display_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            products: [
              {
                id: "1",
                name: "Classic Espresso",
                description: "Rich, bold espresso shot with perfect crema",
                price: 89,
                main_category_id: "1",
                subcategory_id: "1",
                image_url: "/menu-espresso-updated.jpg",
                is_active: true,
                is_featured: true,
                rating: 4.8,
                prep_time: 2,
                stock_quantity: 100,
                tags: ["coffee", "espresso", "hot"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "2",
                name: "Americano",
                description: "Espresso with hot water for a clean, strong taste",
                price: 95,
                main_category_id: "1",
                subcategory_id: "1",
                image_url: "/menu-espresso-updated.jpg",
                is_active: true,
                is_featured: false,
                rating: 4.6,
                prep_time: 2,
                stock_quantity: 100,
                tags: ["coffee", "espresso", "hot"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "3",
                name: "Cappuccino",
                description: "Espresso with steamed milk and thick foam",
                price: 115,
                main_category_id: "1",
                subcategory_id: "1",
                image_url: "/menu-espresso-updated.jpg",
                is_active: true,
                is_featured: true,
                rating: 4.7,
                prep_time: 3,
                stock_quantity: 100,
                tags: ["coffee", "espresso", "milk", "hot"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "4",
                name: "Latte",
                description: "Smooth espresso with steamed milk",
                price: 125,
                main_category_id: "1",
                subcategory_id: "1",
                image_url: "/menu-espresso-updated.jpg",
                is_active: true,
                is_featured: true,
                rating: 4.8,
                prep_time: 3,
                stock_quantity: 100,
                tags: ["coffee", "espresso", "milk", "hot"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          },
          {
            id: "2",
            main_category_id: "1",
            name: "Signature",
            description: "House specialty beverages",
            display_order: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            products: [
              {
                id: "5",
                name: "Sol Signature Blend",
                description: "Our house special coffee blend",
                price: 135,
                main_category_id: "1",
                subcategory_id: "2",
                image_url: "/menu-espresso-updated.jpg",
                is_active: true,
                is_featured: true,
                rating: 4.9,
                prep_time: 4,
                stock_quantity: 100,
                tags: ["coffee", "signature", "hot"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "6",
                name: "Caramel Macchiato",
                description: "Espresso with vanilla and caramel",
                price: 145,
                main_category_id: "1",
                subcategory_id: "2",
                image_url: "/menu-espresso-updated.jpg",
                is_active: true,
                is_featured: true,
                rating: 4.7,
                prep_time: 4,
                stock_quantity: 100,
                tags: ["coffee", "caramel", "sweet", "hot"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          },
          {
            id: "3",
            main_category_id: "1",
            name: "Matcha",
            description: "Matcha-based drinks and lattes",
            display_order: 3,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            products: [
              {
                id: "7",
                name: "Matcha Latte",
                description: "Premium matcha with steamed milk",
                price: 135,
                main_category_id: "1",
                subcategory_id: "3",
                image_url: "/menu-matcha-updated.jpg",
                is_active: true,
                is_featured: true,
                rating: 4.6,
                prep_time: 3,
                stock_quantity: 100,
                tags: ["matcha", "tea", "milk", "hot"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "8",
                name: "Iced Matcha",
                description: "Refreshing cold matcha drink",
                price: 125,
                main_category_id: "1",
                subcategory_id: "3",
                image_url: "/menu-matcha-updated.jpg",
                is_active: true,
                is_featured: false,
                rating: 4.5,
                prep_time: 2,
                stock_quantity: 100,
                tags: ["matcha", "tea", "cold", "iced"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          },
          {
            id: "6",
            main_category_id: "1",
            name: "Coffee Frappe",
            description: "Coffee-based blended drinks",
            display_order: 6,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            products: [
              {
                id: "9",
                name: "Classic Coffee Frappe",
                description: "Blended coffee with ice and cream",
                price: 155,
                main_category_id: "1",
                subcategory_id: "6",
                image_url: "/menu-frappucino-updated.jpg",
                is_active: true,
                is_featured: true,
                rating: 4.8,
                prep_time: 5,
                stock_quantity: 100,
                tags: ["coffee", "frappe", "cold", "blended"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "10",
                name: "Mocha Frappe",
                description: "Chocolate coffee frappe with whipped cream",
                price: 165,
                main_category_id: "1",
                subcategory_id: "6",
                image_url: "/menu-frappucino-updated.jpg",
                is_active: true,
                is_featured: true,
                rating: 4.7,
                prep_time: 5,
                stock_quantity: 100,
                tags: ["coffee", "chocolate", "frappe", "cold"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "Food",
        description: "Food items including waffles, burgers, and other meals",
        display_order: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subcategories: [
          {
            id: "7",
            main_category_id: "2",
            name: "Waffle",
            description: "Belgian waffles and waffle-based dishes",
            display_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            products: [
              {
                id: "11",
                name: "Classic Belgian Waffle",
                description: "Crispy waffle with butter and syrup",
                price: 185,
                main_category_id: "2",
                subcategory_id: "7",
                image_url: "/placeholder.svg?height=300&width=200&text=Waffle",
                is_active: true,
                is_featured: true,
                rating: 4.6,
                prep_time: 8,
                stock_quantity: 50,
                tags: ["waffle", "breakfast", "sweet"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "12",
                name: "Chocolate Waffle",
                description: "Waffle with chocolate chips and sauce",
                price: 215,
                main_category_id: "2",
                subcategory_id: "7",
                image_url: "/placeholder.svg?height=300&width=200&text=Choco+Waffle",
                is_active: true,
                is_featured: true,
                rating: 4.7,
                prep_time: 8,
                stock_quantity: 50,
                tags: ["waffle", "chocolate", "sweet"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          },
          {
            id: "10",
            main_category_id: "2",
            name: "Burger",
            description: "Gourmet burgers and sandwiches",
            display_order: 4,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            products: [
              {
                id: "13",
                name: "Sol Beef Burger",
                description: "Juicy beef patty with fresh vegetables",
                price: 285,
                main_category_id: "2",
                subcategory_id: "10",
                image_url: "/placeholder.svg?height=300&width=200&text=Burger",
                is_active: true,
                is_featured: true,
                rating: 4.8,
                prep_time: 12,
                stock_quantity: 30,
                tags: ["burger", "beef", "lunch"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: "14",
                name: "Chicken Burger",
                description: "Grilled chicken breast with special sauce",
                price: 265,
                main_category_id: "2",
                subcategory_id: "10",
                image_url: "/placeholder.svg?height=300&width=200&text=Chicken+Burger",
                is_active: true,
                is_featured: false,
                rating: 4.6,
                prep_time: 12,
                stock_quantity: 30,
                tags: ["burger", "chicken", "lunch"],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          },
        ],
      },
    ],
    featured_products: [
      {
        id: "1",
        name: "Classic Espresso",
        description: "Rich, bold espresso shot with perfect crema",
        price: 89,
        main_category_id: "1",
        subcategory_id: "1",
        image_url: "/menu-espresso-updated.jpg",
        is_active: true,
        is_featured: true,
        rating: 4.8,
        prep_time: 2,
        stock_quantity: 100,
        tags: ["coffee", "espresso", "hot"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Cappuccino",
        description: "Espresso with steamed milk and thick foam",
        price: 115,
        main_category_id: "1",
        subcategory_id: "1",
        image_url: "/menu-espresso-updated.jpg",
        is_active: true,
        is_featured: true,
        rating: 4.7,
        prep_time: 3,
        stock_quantity: 100,
        tags: ["coffee", "espresso", "milk", "hot"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Latte",
        description: "Smooth espresso with steamed milk",
        price: 125,
        main_category_id: "1",
        subcategory_id: "1",
        image_url: "/menu-espresso-updated.jpg",
        is_active: true,
        is_featured: true,
        rating: 4.8,
        prep_time: 3,
        stock_quantity: 100,
        tags: ["coffee", "espresso", "milk", "hot"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "5",
        name: "Sol Signature Blend",
        description: "Our house special coffee blend",
        price: 135,
        main_category_id: "1",
        subcategory_id: "2",
        image_url: "/menu-espresso-updated.jpg",
        is_active: true,
        is_featured: true,
        rating: 4.9,
        prep_time: 4,
        stock_quantity: 100,
        tags: ["coffee", "signature", "hot"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    total_products: 14,
    source: "mock",
    message: "Using mock data - configure Supabase for live data",
  }
}
