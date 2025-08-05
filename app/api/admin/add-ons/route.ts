import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * GET /api/admin/add-ons - Get all add-ons
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    // Return mock add-ons data
    const mockAddOns = [
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

    return NextResponse.json(
      {
        success: true,
        data: mockAddOns,
        source: "mock",
      },
      { headers, status: 200 },
    )
  } catch (error) {
    console.error("❌ Add-ons API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { headers, status: 500 },
    )
  }
}
