import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { landId: string } }) {
  try {
    const { approved_by } = await request.json()
    const { landId } = params

    if (!approved_by) {
      return NextResponse.json({ error: "Missing approved_by field" }, { status: 400 })
    }

    const approvedLand = await DatabaseService.approveLand(landId, approved_by)

    if (!approvedLand) {
      return NextResponse.json({ error: "Land not found" }, { status: 404 })
    }

    // Create notification for the land owner
    await DatabaseService.createAdminNotification({
      type: "land_approved",
      title: "Land Registration Approved",
      message: `Your land "${approvedLand.title}" has been approved and is now registered with blockchain verification.`,
      related_land_id: landId,
    })

    return NextResponse.json({
      success: true,
      land: approvedLand,
      message: "Land approved successfully",
    })
  } catch (error) {
    console.error("Approve land error:", error)
    return NextResponse.json({ error: "Failed to approve land" }, { status: 500 })
  }
}
