import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Get client IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const visitData = {
      ip_address: ip,
      user_agent: userAgent,
      page_url: body.page_url || "/",
      visited_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("visitor_logs").insert([visitData])

    if (error) {
      console.error("Error logging visit:", error)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in visit tracking:", error)
    return NextResponse.json({ success: false })
  }
}
