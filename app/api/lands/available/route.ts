import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const lands = await DatabaseService.getAvailableLands()

    return NextResponse.json({
      success: true,
      lands,
    })
  } catch (error) {
    console.error("Get available lands error:", error)
    return NextResponse.json({ error: "Failed to fetch available lands" }, { status: 500 })
  }
}
