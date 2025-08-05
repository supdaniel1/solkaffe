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
    const categoryId = params.id
    const supabase = createServerSupabaseClient()

    const { data: category, error } = await supabase
      .from("categories")
      .update({
        name: body.name,
        description: body.description || "",
        sort_order: Number.parseInt(body.sort_order) || 0,
        is_active: body.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .select()
      .single()

    if (error) {
      console.error("Error updating category:", error)
      return NextResponse.json({ error: "Failed to update category", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: category })
  } catch (err) {
    console.error("Exception updating category:", err)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const categoryId = params.id
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Error deleting category:", error)
      return NextResponse.json({ error: "Failed to delete category", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully" })
  } catch (err) {
    console.error("Exception deleting category:", err)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
