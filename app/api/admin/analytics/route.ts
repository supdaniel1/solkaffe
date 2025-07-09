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

    // Fetch all orders
    const { data: orders, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    // Calculate analytics
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const completedOrders = orders.filter((order) => order.status === "completed")
    const todayOrders = completedOrders.filter((order) => new Date(order.created_at) >= today)
    const weeklyOrders = completedOrders.filter((order) => new Date(order.created_at) >= weekAgo)

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.total, 0)

    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

    // Calculate top products
    const productStats: { [key: string]: { quantity: number; revenue: number } } = {}

    completedOrders.forEach((order) => {
      order.items.forEach((item: any) => {
        if (!productStats[item.name]) {
          productStats[item.name] = { quantity: 0, revenue: 0 }
        }
        productStats[item.name].quantity += item.quantity
        productStats[item.name].revenue += item.total || item.price * item.quantity
      })
    })

    const topProducts = Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    const analytics = {
      totalRevenue,
      totalOrders: completedOrders.length,
      averageOrderValue,
      todayRevenue,
      todayOrders: todayOrders.length,
      weeklyRevenue,
      weeklyOrders: weeklyOrders.length,
      topProducts,
      recentOrders: orders.slice(0, 20),
    }

    return NextResponse.json({ data: analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
