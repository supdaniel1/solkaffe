import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const runtime = "nodejs"

/**
 * GET /api/menu/structure - Get complete menu structure with categories and products
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/menu/structure] Fetching menu structure...")

    // Try to connect to Supabase
    const supabase = createServerSupabaseClient()

    // Test connection first
    const { data: testData, error: testError } = await supabase.from("products").select("count").limit(1)

    if (testError) {
      console.log("⚠️ Database connection failed, returning mock data:", testError.message)
      return NextResponse.json(getMockMenuStructure(), { headers, status: 200 })
    }

    // Try to fetch real data
    const { data: products, error: productsError } = await supabase
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
        tags,
        created_at,
        updated_at
      `)
      .eq("is_active", true)
      .order("name")

    if (productsError) {
      console.log("⚠️ Error fetching products, returning mock data:", productsError.message)
      return NextResponse.json(getMockMenuStructure(), { headers, status: 200 })
    }

    // Transform products into hierarchical structure
    const menuStructure = transformProductsToMenuStructure(products || [])

    console.log("✅ Successfully returning menu structure with", products?.length || 0, "products")

    return NextResponse.json(menuStructure, { headers, status: 200 })
  } catch (error) {
    console.error("❌ [/api/menu/structure] Error:", error)

    // Always return mock data on error to prevent app crashes
    return NextResponse.json(getMockMenuStructure(), { headers, status: 200 })
  }
}

function transformProductsToMenuStructure(products: any[]) {
  // Group products by category
  const categoryGroups: { [key: string]: any[] } = {}

  products.forEach((product) => {
    const category = product.category || "Other"
    if (!categoryGroups[category]) {
      categoryGroups[category] = []
    }
    categoryGroups[category].push({
      ...product,
      is_featured: product.rating >= 4.5 || false,
    })
  })

  // Create main categories structure
  const main_categories = Object.entries(categoryGroups).map(([categoryName, categoryProducts], index) => ({
    id: (index + 1).toString(),
    name: categoryName,
    description: `${categoryName} items`,
    display_order: index + 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subcategories: [
      {
        id: (index + 1).toString(),
        name: categoryName,
        description: `${categoryName} items`,
        main_category_id: (index + 1).toString(),
        display_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        products: categoryProducts,
      },
    ],
  }))

  const featured_products = products.filter((p) => p.rating >= 4.5).slice(0, 6)

  return {
    main_categories,
    featured_products,
    total_products: products.length,
    variations: getMockVariations(),
    add_ons: getMockAddOns(),
  }
}

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
            name: "Espresso",
            description: "Classic espresso-based drinks",
            main_category_id: "1",
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
                image_url: "/menu-espresso-updated.jpg",
                main_category_id: "1",
                subcategory_id: "1",
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
                image_url: "/menu-espresso-updated.jpg",
                main_category_id: "1",
                subcategory_id: "1",
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
                image_url: "/menu-espresso-updated.jpg",
                main_category_id: "1",
                subcategory_id: "1",
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
                image_url: "/menu-espresso-updated.jpg",
                main_category_id: "1",
                subcategory_id: "1",
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
            name: "Signature",
            description: "House specialty beverages",
            main_category_id: "1",
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
                image_url: "/menu-espresso-updated.jpg",
                main_category_id: "1",
                subcategory_id: "2",
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
                image_url: "/menu-espresso-updated.jpg",
                main_category_id: "1",
                subcategory_id: "2",
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
            name: "Matcha",
            description: "Matcha-based drinks and lattes",
            main_category_id: "1",
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
                image_url: "/menu-matcha-updated.jpg",
                main_category_id: "1",
                subcategory_id: "3",
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
                image_url: "/menu-matcha-updated.jpg",
                main_category_id: "1",
                subcategory_id: "3",
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
            name: "Coffee Frappe",
            description: "Coffee-based blended drinks",
            main_category_id: "1",
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
                image_url: "/menu-frappucino-updated.jpg",
                main_category_id: "1",
                subcategory_id: "6",
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
                image_url: "/menu-frappucino-updated.jpg",
                main_category_id: "1",
                subcategory_id: "6",
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
            name: "Waffle",
            description: "Belgian waffles and waffle-based dishes",
            main_category_id: "2",
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
                image_url: "/placeholder.svg?height=300&width=200&text=Waffle",
                main_category_id: "2",
                subcategory_id: "7",
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
                image_url: "/placeholder.svg?height=300&width=200&text=Choco+Waffle",
                main_category_id: "2",
                subcategory_id: "7",
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
            name: "Burger",
            description: "Gourmet burgers and sandwiches",
            main_category_id: "2",
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
                image_url: "/placeholder.svg?height=300&width=200&text=Burger",
                main_category_id: "2",
                subcategory_id: "10",
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
                image_url: "/placeholder.svg?height=300&width=200&text=Chicken+Burger",
                main_category_id: "2",
                subcategory_id: "10",
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
        image_url: "/menu-espresso-updated.jpg",
        main_category_id: "1",
        subcategory_id: "1",
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
        id: "5",
        name: "Sol Signature Blend",
        description: "Our house special coffee blend",
        price: 135,
        image_url: "/menu-espresso-updated.jpg",
        main_category_id: "1",
        subcategory_id: "2",
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
    variations: getMockVariations(),
    add_ons: getMockAddOns(),
  }
}

function getMockVariations() {
  return [
    {
      id: "1",
      name: "Small",
      type: "size",
      price_modifier: -15,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    { id: "2", name: "Medium", type: "size", price_modifier: 0, is_active: true, created_at: new Date().toISOString() },
    { id: "3", name: "Large", type: "size", price_modifier: 20, is_active: true, created_at: new Date().toISOString() },
    {
      id: "4",
      name: "Hot",
      type: "temperature",
      price_modifier: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "5",
      name: "Iced",
      type: "temperature",
      price_modifier: 5,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]
}

function getMockAddOns() {
  return [
    {
      id: "1",
      name: "Extra Shot",
      description: "Additional espresso shot",
      price: 15,
      category: "coffee",
      max_quantity: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Vanilla Syrup",
      description: "Sweet vanilla flavoring",
      price: 10,
      category: "syrup",
      max_quantity: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Caramel Syrup",
      description: "Rich caramel flavoring",
      price: 10,
      category: "syrup",
      max_quantity: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Oat Milk",
      description: "Plant-based oat milk",
      price: 15,
      category: "milk",
      max_quantity: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "5",
      name: "Whipped Cream",
      description: "Fresh whipped cream topping",
      price: 15,
      category: "topping",
      max_quantity: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ]
}
