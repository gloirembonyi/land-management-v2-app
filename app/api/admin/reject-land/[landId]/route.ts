import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { landId: string } }) {
  try {
    const { approved_by } = await request.json()
    const { landId } = params

    if (!approved_by) {
      return NextResponse.json({ error: "Missing approved_by field" }, { status: 400 })
    }

    const rejectedLand = await DatabaseService.rejectLand(landId, approved_by)

    if (!rejectedLand) {
      return NextResponse.json({ error: "Land not found" }, { status: 404 })
    }

    // Create notification for the land owner
    await DatabaseService.createAdminNotification({
      type: "land_rejected",
      title: "Land Registration Rejected",
      message: `Your land registration for "${rejectedLand.title}" has been rejected. Please contact support for more information.`,
      related_land_id: landId,
    })

    return NextResponse.json({
      success: true,
      land: rejectedLand,
      message: "Land rejected successfully",
    })
  } catch (error) {
    console.error("Reject land error:", error)
    return NextResponse.json({ error: "Failed to reject land" }, { status: 500 })
  }
}
