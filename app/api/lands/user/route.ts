import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/auth
    const userId = request.headers.get("x-user-id") || "user-id-placeholder"

    const lands = await DatabaseService.getLandsByOwner(userId)

    return NextResponse.json({
      success: true,
      lands,
    })
  } catch (error) {
    console.error("Get user lands error:", error)
    return NextResponse.json({ error: "Failed to fetch user lands" }, { status: 500 })
  }
}
