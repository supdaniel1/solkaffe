import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * GET /api/admin/variations - Get all variations
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }

  try {
    // Return mock variations data
    const mockVariations = [
      {
        id: "1",
        name: "Small",
        type: "size",
        price_modifier: -15,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Medium",
        type: "size",
        price_modifier: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Large",
        type: "size",
        price_modifier: 20,
        is_active: true,
        created_at: new Date().toISOString(),
      },
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

    return NextResponse.json(
      {
        success: true,
        data: mockVariations,
        source: "mock",
      },
      { headers, status: 200 },
    )
  } catch (error) {
    console.error("❌ Variations API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { headers, status: 500 },
    )
  }
}
