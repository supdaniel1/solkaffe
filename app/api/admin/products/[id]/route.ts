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
    const productId = params.id
    const supabase = createServerSupabaseClient()

    console.log("Updating product:", productId, body)

    // Find category ID by name if category is provided
    let categoryId = body.category_id
    if (body.category && !categoryId) {
      const { data: category } = await supabase.from("categories").select("id").eq("name", body.category).single()
      categoryId = category?.id
    }

    // Build update object with only the fields that exist in the current schema
    const updateData: any = {
      name: body.name,
      description: body.description || "",
      price: Number.parseFloat(body.price),
      is_active: body.is_active !== false,
      updated_at: new Date().toISOString(),
    }

    // Only add category if we have a valid category_id
    if (categoryId) {
      updateData.category_id = categoryId
    } else if (body.category) {
      // If category is provided as a string, use it directly
      updateData.category = body.category
    }

    // Add optional fields only if they exist in the request
    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url || "/placeholder.svg?height=300&width=200"
    }

    if (body.stock_quantity !== undefined) {
      updateData.stock_quantity = Number.parseInt(body.stock_quantity) || 0
    }

    if (body.tags !== undefined) {
      updateData.tags = body.tags || []
    }

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: "Failed to update product", details: error.message }, { status: 500 })
    }

    // Update variations if provided
    if (body.variations !== undefined) {
      // Delete existing variations
      await supabase.from("product_variations").delete().eq("product_id", productId)

      // Add new variations
      if (body.variations.length > 0) {
        const variationInserts = body.variations.map((varId: string) => ({
          product_id: productId,
          variation_id: varId,
        }))

        await supabase.from("product_variations").insert(variationInserts)
      }
    }

    // Update add-ons if provided
    if (body.add_ons !== undefined) {
      // Delete existing add-ons
      await supabase.from("product_add_ons").delete().eq("product_id", productId)

      // Add new add-ons
      if (body.add_ons.length > 0) {
        const addOnInserts = body.add_ons.map((addOnId: string) => ({
          product_id: productId,
          add_on_id: addOnId,
        }))

        await supabase.from("product_add_ons").insert(addOnInserts)
      }
    }

    console.log("Product updated successfully:", productId)
    return NextResponse.json({ data: product })
  } catch (err) {
    console.error("Exception updating product:", err)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized", details: "Invalid API key" }, { status: 401 })
    }

    const productId = params.id
    const supabase = createServerSupabaseClient()

    console.log("Deleting product:", productId)

    // Delete related records first (only if tables exist)
    try {
      await supabase.from("product_variations").delete().eq("product_id", productId)
    } catch (error) {
      console.log("product_variations table might not exist:", error)
    }

    try {
      await supabase.from("product_add_ons").delete().eq("product_id", productId)
    } catch (error) {
      console.log("product_add_ons table might not exist:", error)
    }

    // Delete the product
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: "Failed to delete product", details: error.message }, { status: 500 })
    }

    console.log("Product deleted successfully:", productId)
    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (err) {
    console.error("Exception deleting product:", err)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
