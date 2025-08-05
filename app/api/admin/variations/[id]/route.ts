import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * PUT /api/admin/variations/[id]
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const headers = { "Content-Type": "application/json" }

  try {
    const { id } = params
    const body = await request.json()
    console.log(`🔍 [/api/admin/variations/${id}] Updating variation:`, body)

    // Mock response
    const updatedVariation = {
      id,
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        data: updatedVariation,
        message: "Variation updated successfully",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error(`❌ [/api/admin/variations/${params.id}] Update error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to update variation",
      },
      { headers, status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/variations/[id]
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const headers = { "Content-Type": "application/json" }

  try {
    const { id } = params
    console.log(`🔍 [/api/admin/variations/${id}] Deleting variation`)

    return NextResponse.json(
      {
        message: "Variation deleted successfully",
      },
      { headers, status: 200 },
    )
  } catch (err) {
    console.error(`❌ [/api/admin/variations/${params.id}] Delete error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to delete variation",
      },
      { headers, status: 500 },
    )
  }
}
