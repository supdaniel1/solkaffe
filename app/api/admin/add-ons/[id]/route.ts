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
    const addOnId = params.id
    const supabase = createServerSupabaseClient()

    const { data: addOn, error } = await supabase
      .from("add_ons")
      .update({
        name: body.name,
        description: body.description || "",
        price: Number.parseFloat(body.price) || 0,
        max_quantity: Number.parseInt(body.max_quantity) || 1,
        category: body.category || "other",
        is_active: body.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addOnId)
      .select()
      .single()

    if (error) {
      console.error("Error updating add-on:", error)
      return NextResponse.json({ error: "Failed to update add-on", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: addOn })
  } catch (err) {
    console.error("Exception updating add-on:", err)
    return NextResponse.json({ error: "Failed to update add-on" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const addOnId = params.id
    const supabase = createServerSupabaseClient()

    // Delete related product_add_ons first
    await supabase.from("product_add_ons").delete().eq("add_on_id", addOnId)

    const { error } = await supabase.from("add_ons").delete().eq("id", addOnId)

    if (error) {
      console.error("Error deleting add-on:", error)
      return NextResponse.json({ error: "Failed to delete add-on", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Add-on deleted successfully" })
  } catch (err) {
    console.error("Exception deleting add-on:", err)
    return NextResponse.json({ error: "Failed to delete add-on" }, { status: 500 })
  }
}
