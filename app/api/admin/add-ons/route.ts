import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Mock add-ons
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
    updated_at: new Date().toISOString(),
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
    updated_at: new Date().toISOString(),
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
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Extra Foam",
    description: "Additional milk foam",
    price: 5,
    category: "milk",
    max_quantity: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Oat Milk",
    description: "Plant-based milk alternative",
    price: 12,
    category: "milk",
    max_quantity: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/**
 * GET /api/admin/add-ons
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/admin/add-ons] Returning mock add-ons")

    return NextResponse.json(
      {
        data: mockAddOns,
        count: mockAddOns.length,
        source: "mock",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error("❌ [/api/admin/add-ons] Error:", err)
    return NextResponse.json(
      {
        data: [],
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { headers, status: 500 },
    )
  }
}
