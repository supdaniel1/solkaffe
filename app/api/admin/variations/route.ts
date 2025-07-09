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

    const { data: variations, error } = await supabase.from("variations").select("*").order("type", { ascending: true })

    if (error) {
      console.error("Error fetching variations:", error)
      return NextResponse.json({ error: "Failed to fetch variations", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: variations || [] })
  } catch (err) {
    console.error("Exception fetching variations:", err)
    return NextResponse.json({ error: "Failed to fetch variations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerSupabaseClient()

    const { data: variation, error } = await supabase
      .from("variations")
      .insert({
        name: body.name,
        type: body.type || "option",
        price_modifier: Number.parseFloat(body.price_modifier) || 0,
        is_active: body.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating variation:", error)
      return NextResponse.json({ error: "Failed to create variation", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: variation })
  } catch (err) {
    console.error("Exception creating variation:", err)
    return NextResponse.json({ error: "Failed to create variation" }, { status: 500 })
  }
}
