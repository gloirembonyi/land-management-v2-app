import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const transactions = await DatabaseService.getPendingTransactions()

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error("Get pending transactions error:", error)
    return NextResponse.json({ error: "Failed to fetch pending transactions" }, { status: 500 })
  }
}
