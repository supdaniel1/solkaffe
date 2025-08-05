import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Mock products store
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
    variations: ["1", "4"], // Small, Hot
    add_ons: ["1", "2"], // Extra Shot, Vanilla Syrup
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
    variations: ["1", "2", "3", "4", "5"], // All sizes and temperatures
    add_ons: ["1", "2", "3", "5"], // Extra Shot, Vanilla, Caramel, Oat Milk
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
    variations: ["2", "3"], // Medium, Large
    add_ons: ["2", "3", "4"], // Vanilla, Caramel, Extra Foam
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
    variations: ["2", "4", "5"], // Medium, Hot, Iced
    add_ons: ["2", "5"], // Vanilla Syrup, Oat Milk
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/**
 * GET /api/admin/products
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/admin/products] Returning mock products")

    return NextResponse.json(
      {
        data: mockProducts,
        count: mockProducts.length,
        source: "mock",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error("❌ [/api/admin/products] Error:", err)
    return NextResponse.json(
      {
        data: [],
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { headers, status: 500 },
    )
  }
}

/**
 * POST /api/admin/products
 */
export async function POST(request: Request) {
  const headers = { "Content-Type": "application/json" }

  try {
    const body = await request.json()
    console.log("🔍 [/api/admin/products] Creating product:", body)

    const newProduct = {
      id: (mockProducts.length + 1).toString(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockProducts.push(newProduct)

    return NextResponse.json(
      {
        data: newProduct,
        message: "Product created successfully",
      },
      { headers, status: 201 },
    )
  } catch (err) {
    console.error("❌ [/api/admin/products] Create error:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to create product",
      },
      { headers, status: 500 },
    )
  }
}
