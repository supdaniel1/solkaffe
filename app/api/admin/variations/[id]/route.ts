import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const ADMIN_API_KEY = "8frugfboO2fU0C_cEQLMtPXI3FmijRTYgLVvG-nmMrc"

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key")
  return apiKey === ADMIN_API_KEY
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()
    const variationId = params.id
    const supabase = createServerSupabaseClient()

    const { data: variation, error } = await supabase
      .from("variations")
      .update({
        name: body.name,
        type: body.type || "option",
        price_modifier: Number.parseFloat(body.price_modifier) || 0,
        is_active: body.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", variationId)
      .select()
      .single()

    if (error) {
      console.error("Error updating variation:", error)
      return NextResponse.json({ error: "Failed to update variation", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: variation })
  } catch (err) {
    console.error("Exception updating variation:", err)
    return NextResponse.json({ error: "Failed to update variation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const variationId = params.id
    const supabase = createServerSupabaseClient()

    // Delete related product_variations first
    await supabase.from("product_variations").delete().eq("variation_id", variationId)

    const { error } = await supabase.from("variations").delete().eq("id", variationId)

    if (error) {
      console.error("Error deleting variation:", error)
      return NextResponse.json({ error: "Failed to delete variation", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Variation deleted successfully" })
  } catch (err) {
    console.error("Exception deleting variation:", err)
    return NextResponse.json({ error: "Failed to delete variation" }, { status: 500 })
  }
}
