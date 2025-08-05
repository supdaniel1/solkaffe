import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * GET /api/products - Returns mock data to avoid Supabase JSON parsing errors
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/products] Returning mock data to avoid Supabase errors")

    // Return mock products directly without trying Supabase
    const mockProducts = [
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
      {
        id: "5",
        name: "Americano",
        description: "Espresso with hot water",
        price: 95,
        category: "ESPRESSO",
        image_url: "/menu-espresso-updated.jpg",
        is_active: true,
        rating: 4.4,
        prep_time: 2,
        stock_quantity: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "6",
        name: "Cappuccino",
        description: "Espresso with steamed milk and foam",
        price: 115,
        category: "ESPRESSO",
        image_url: "/menu-espresso-updated.jpg",
        is_active: true,
        rating: 4.6,
        prep_time: 3,
        stock_quantity: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    console.log(`✅ Successfully returning ${mockProducts.length} mock products`)

    return NextResponse.json(
      {
        data: mockProducts,
        source: "mock",
        count: mockProducts.length,
        message: "Using mock data - Supabase connection bypassed",
        timestamp: new Date().toISOString(),
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error("❌ [/api/products] Unexpected exception:", err)

    return NextResponse.json(
      {
        data: [],
        error: err instanceof Error ? err.message : "Unknown error",
        source: "error",
        timestamp: new Date().toISOString(),
      },
      { headers, status: 200 },
    )
  }
}
