import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { landId: string } }) {
  try {
    const { price } = await request.json()
    const { landId } = params
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Valid price required" }, { status: 400 })
    }

    // Verify land ownership and approval status
    const land = await DatabaseService.getLandById(landId)
    if (!land) {
      return NextResponse.json({ error: "Land not found" }, { status: 404 })
    }

    if (land.owner_id !== userId) {
      return NextResponse.json({ error: "Not authorized to sell this land" }, { status: 403 })
    }

    if (land.status !== "approved") {
      return NextResponse.json({ error: "Land must be approved before selling" }, { status: 400 })
    }

    // Set land for sale
    const updatedLand = await DatabaseService.setLandForSale(landId, price)

    // Create admin notification
    await DatabaseService.createAdminNotification({
      type: "land_for_sale",
      title: "Land Listed for Sale",
      message: `${land.title} has been listed for sale at ${price.toLocaleString()} RWF`,
      related_land_id: landId,
    })

    return NextResponse.json({
      success: true,
      land: updatedLand,
      message: "Land listed for sale successfully",
    })
  } catch (error) {
    console.error("Set land for sale error:", error)
    return NextResponse.json({ error: "Failed to list land for sale" }, { status: 500 })
  }
}
