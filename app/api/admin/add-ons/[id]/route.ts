import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * PUT /api/admin/add-ons/[id]
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const headers = { "Content-Type": "application/json" }

  try {
    const { id } = params
    const body = await request.json()
    console.log(`🔍 [/api/admin/add-ons/${id}] Updating add-on:`, body)

    // Mock response
    const updatedAddOn = {
      id,
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        data: updatedAddOn,
        message: "Add-on updated successfully",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error(`❌ [/api/admin/add-ons/${params.id}] Update error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to update add-on",
      },
      { headers, status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/add-ons/[id]
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const headers = { "Content-Type": "application/json" }

  try {
    const { id } = params
    console.log(`🔍 [/api/admin/add-ons/${id}] Deleting add-on`)

    return NextResponse.json(
      {
        message: "Add-on deleted successfully",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error(`❌ [/api/admin/add-ons/${params.id}] Delete error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to delete add-on",
      },
      { headers, status: 500 },
    )
  }
}
