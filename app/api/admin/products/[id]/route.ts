import { NextResponse } from "next/server"

export const runtime = "nodejs"

// This would normally come from a database, but we'll use a simple in-memory store
const mockProducts = [
  {
    id: "1",
    name: "Espresso",
    description: "Rich and bold espresso shot",
    price: 89,
    category: "ESPRESSO",
    image_url: "/menu-espresso-updated.jpg",
    is_active: true,
    rating: 4.8,
    prep_time: 2,
    stock_quantity: 100,
    variations: ["1", "4"],
    add_ons: ["1", "2"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Latte",
    description: "Espresso with steamed milk",
    price: 109,
    category: "ESPRESSO",
    image_url: "/menu-espresso-updated.jpg",
    is_active: true,
    rating: 4.7,
    prep_time: 3,
    stock_quantity: 100,
    variations: ["1", "2", "3", "4", "5"],
    add_ons: ["1", "2", "3", "5"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/**
 * PUT /api/admin/products/[id]
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const headers = { "Content-Type": "application/json" }

  try {
    const { id } = params
    const body = await request.json()
    console.log(`🔍 [/api/admin/products/${id}] Updating product:`, body)

    const productIndex = mockProducts.findIndex((p) => p.id === id)
    if (productIndex === -1) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        { headers, status: 404 },
      )
    }

    // Update the product
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        data: mockProducts[productIndex],
        message: "Product updated successfully",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error(`❌ [/api/admin/products/${params.id}] Update error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to update product",
      },
      { headers, status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/products/[id]
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const headers = { "Content-Type": "application/json" }

  try {
    const { id } = params
    console.log(`🔍 [/api/admin/products/${id}] Deleting product`)

    const productIndex = mockProducts.findIndex((p) => p.id === id)
    if (productIndex === -1) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        { headers, status: 404 },
      )
    }

    // Remove the product
    const deletedProduct = mockProducts.splice(productIndex, 1)[0]

    return NextResponse.json(
      {
        data: deletedProduct,
        message: "Product deleted successfully",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error(`❌ [/api/admin/products/${params.id}] Delete error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to delete product",
      },
      { headers, status: 500 },
    )
  }
}
