import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qrCode = searchParams.get("qr_code")

    if (!qrCode) {
      return NextResponse.json({ error: "QR code required" }, { status: 400 })
    }

    // Search for land by QR code
    const lands = await DatabaseService.getAvailableLands()
    const land = lands.find((l: any) => l.qr_code_data === qrCode || l.blockchain_hash === qrCode)

    if (!land) {
      return NextResponse.json({ error: "Land not found or not available for sale" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      land,
    })
  } catch (error) {
    console.error("Search land by QR error:", error)
    return NextResponse.json({ error: "Failed to search land" }, { status: 500 })
  }
}
