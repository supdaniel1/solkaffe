import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Mock categories
const mockCategories = [
  {
    id: "1",
    name: "ESPRESSO",
    description: "Espresso-based coffee drinks",
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "COLD_DRINKS",
    description: "Refreshing cold beverages",
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "TEA",
    description: "Tea-based beverages",
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "PASTRIES",
    description: "Fresh baked goods and pastries",
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/**
 * GET /api/admin/categories
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/admin/categories] Returning mock categories")

    return NextResponse.json(
      {
        data: mockCategories,
        count: mockCategories.length,
        source: "mock",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error("❌ [/api/admin/categories] Error:", err)
    return NextResponse.json(
      {
        data: [],
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { headers, status: 500 },
    )
  }
}
