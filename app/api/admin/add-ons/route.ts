import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

const ADMIN_API_KEY = "8frugfboO2fU0C_cEQLMtPXI3FmijRTYgLVvG-nmMrc"

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key")
  return apiKey === ADMIN_API_KEY
}

export async function GET(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data: addOns, error } = await supabase.from("add_ons").select("*").order("category", { ascending: true })

    if (error) {
      console.error("Error fetching add-ons:", error)
      return NextResponse.json({ error: "Failed to fetch add-ons", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: addOns || [] })
  } catch (err) {
    console.error("Exception fetching add-ons:", err)
    return NextResponse.json({ error: "Failed to fetch add-ons" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerSupabaseClient()

    const { data: addOn, error } = await supabase
      .from("add_ons")
      .insert({
        name: body.name,
        description: body.description || "",
        price: Number.parseFloat(body.price) || 0,
        max_quantity: Number.parseInt(body.max_quantity) || 1,
        category: body.category || "other",
        is_active: body.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating add-on:", error)
      return NextResponse.json({ error: "Failed to create add-on", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: addOn })
  } catch (err) {
    console.error("Exception creating add-on:", err)
    return NextResponse.json({ error: "Failed to create add-on" }, { status: 500 })
  }
}
