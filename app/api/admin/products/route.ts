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

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: products || [] })
  } catch (err) {
    console.error("Exception fetching products:", err)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServerSupabaseClient()

    console.log("Creating product:", body)

    // Find category ID by name if category is provided
    let categoryId = body.category_id
    if (body.category && !categoryId) {
      const { data: category } = await supabase.from("categories").select("id").eq("name", body.category).single()
      categoryId = category?.id
    }

    // Build insert object with only the fields that exist in the current schema
    const insertData: any = {
      name: body.name,
      description: body.description || "",
      price: Number.parseFloat(body.price),
      is_active: body.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Only add category if we have a valid category_id
    if (categoryId) {
      insertData.category_id = categoryId
    } else if (body.category) {
      // If category is provided as a string, use it directly
      insertData.category = body.category
    }

    // Add optional fields only if they exist in the request
    if (body.image_url !== undefined) {
      insertData.image_url = body.image_url || "/placeholder.svg?height=300&width=200"
    }

    if (body.stock_quantity !== undefined) {
      insertData.stock_quantity = Number.parseInt(body.stock_quantity) || 0
    }

    if (body.tags !== undefined) {
      insertData.tags = body.tags || []
    }

    const { data: product, error } = await supabase.from("products").insert(insertData).select().single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: "Failed to create product", details: error.message }, { status: 500 })
    }

    // Add variations if provided
    if (body.variations && body.variations.length > 0) {
      try {
        const variationInserts = body.variations.map((varId: string) => ({
          product_id: product.id,
          variation_id: varId,
        }))

        await supabase.from("product_variations").insert(variationInserts)
      } catch (error) {
        console.log("product_variations table might not exist:", error)
      }
    }

    // Add add-ons if provided
    if (body.add_ons && body.add_ons.length > 0) {
      try {
        const addOnInserts = body.add_ons.map((addOnId: string) => ({
          product_id: product.id,
          add_on_id: addOnId,
        }))

        await supabase.from("product_add_ons").insert(addOnInserts)
      } catch (error) {
        console.log("product_add_ons table might not exist:", error)
      }
    }

    console.log("Product created successfully:", product.id)
    return NextResponse.json({ data: product })
  } catch (err) {
    console.error("Exception creating product:", err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
