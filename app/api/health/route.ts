import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Simple health check - try to query the database
    const { error } = await supabase.from("products").select("id").limit(1)

    if (error) {
      return NextResponse.json({ status: "unhealthy", error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function HEAD() {
  // For simple connectivity checks
  return new Response(null, { status: 200 })
}
