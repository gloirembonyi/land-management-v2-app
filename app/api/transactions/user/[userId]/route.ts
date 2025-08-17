import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    const transactions = await DatabaseService.getUserTransactions(userId)

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error("Error fetching user transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}
