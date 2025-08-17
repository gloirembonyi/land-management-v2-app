import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const notifications = await DatabaseService.getUnreadAdminNotifications()

    return NextResponse.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error("Get admin notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
