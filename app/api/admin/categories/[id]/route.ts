import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * PUT /api/admin/categories/[id]
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const headers = { "Content-Type": "application/json" }

  try {
    const { id } = params
    const body = await request.json()
    console.log(`🔍 [/api/admin/categories/${id}] Updating category:`, body)

    // Mock response
    const updatedCategory = {
      id,
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        data: updatedCategory,
        message: "Category updated successfully",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error(`❌ [/api/admin/categories/${params.id}] Update error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to update category",
      },
      { headers, status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/categories/[id]
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const headers = { "Content-Type": "application/json" }

  try {
    const { id } = params
    console.log(`🔍 [/api/admin/categories/${id}] Deleting category`)

    return NextResponse.json(
      {
        message: "Category deleted successfully",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error(`❌ [/api/admin/categories/${params.id}] Delete error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to delete category",
      },
      { headers, status: 500 },
    )
  }
}
