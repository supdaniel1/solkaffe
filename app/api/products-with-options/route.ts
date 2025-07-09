import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    console.log("Fetching products with options...")

    // Get products with their categories, variations, and add-ons
    const { data: products, error } = await supabaseServer
      .from("products")
      .select(`
        *,
        category:categories(id, name, color),
        product_variations(
          id,
          variation:variations(id, name, type, price_modifier, options)
        ),
        product_add_ons(
          id,
          add_on:add_ons(id, name, price, category, max_quantity)
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products with options:", error)
      return NextResponse.json([])
    }

    // Transform the data for easier frontend consumption
    const transformedProducts =
      products?.map((product) => ({
        ...product,
        variations: product.product_variations?.map((pv) => pv.variation) || [],
        add_ons: product.product_add_ons?.map((pa) => pa.add_on) || [],
      })) || []

    console.log(`Found ${transformedProducts.length} products with options`)
    return NextResponse.json(transformedProducts)
  } catch (err) {
    console.error("Exception in products-with-options API:", err)
    return NextResponse.json([])
  }
}
