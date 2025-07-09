import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const runtime = "nodejs" // ensure we can use the server client

/**
 * GET /api/products
 *
 * Returns: { data: Product[] }
 * Always replies with HTTP 200 so UI hooks don't break on errors.
 */
export async function GET() {
  const headers = { "Content-Type": "application/json" }
  const supabase = createServerSupabaseClient()

  try {
    // Simple query first – re-add joins later once the base call works
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[/api/products] Supabase error:", error.message)
      return NextResponse.json({ data: [], supabaseError: error.message }, { headers, status: 200 })
    }

    return NextResponse.json({ data: products ?? [] }, { headers, status: 200 })
  } catch (err) {
    console.error("[/api/products] Unexpected exception:", err)
    return NextResponse.json(
      {
        data: [],
        internalError: err instanceof Error ? err.message : "unknown error",
      },
      { headers, status: 200 },
    )
  }
}
