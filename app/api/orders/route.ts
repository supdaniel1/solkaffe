import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: orders || [] })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  // Set proper headers to ensure JSON response
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  }

  try {
    console.log("🔄 Creating new order...")

    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Validate required fields
    if (!body.customer_name || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Missing required fields: customer_name and items" }, { status: 400 })
    }

    // Calculate total if not provided
    const calculatedTotal = body.items.reduce((sum: number, item: any) => {
      return sum + (item.total || item.price * item.quantity)
    }, 0)

    const orderData = {
      customer_name: body.customer_name,
      customer_phone: body.customer_phone || null,
      customer_email: body.customer_email || null,
      items: body.items,
      total: body.total || calculatedTotal,
      payment_method: body.payment_method || "Cash",
      payment_status: body.payment_status || "completed",
      status: body.status || "pending",
      notes: body.notes || null,
    }

    const { data: order, error } = await supabase.from("orders").insert([orderData]).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
    }

    console.log(`✅ Successfully created order: ${order.id}`)

    return NextResponse.json({ data: order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
