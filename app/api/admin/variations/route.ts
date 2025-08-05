import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Mock variations
const mockVariations = [
  {
    id: "1",
    name: "Small",
    type: "size",
    price_modifier: -10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Medium",
    type: "size",
    price_modifier: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Large",
    type: "size",
    price_modifier: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Hot",
    type: "temperature",
    price_modifier: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Iced",
    type: "temperature",
    price_modifier: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/**
 * GET /api/admin/variations
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    console.log("🔍 [/api/admin/variations] Returning mock variations")

    return NextResponse.json(
      {
        data: mockVariations,
        count: mockVariations.length,
        source: "mock",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error("❌ [/api/admin/variations] Error:", err)
    return NextResponse.json(
      {
        data: [],
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { headers, status: 500 },
    )
  }
}
