import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Get transactions that need payment verification (status = 'pending' and not payment_confirmed)
    const transactions = await DatabaseService.getPendingTransactions()

    // Filter for transactions that specifically need payment verification
    const paymentVerifications = transactions.filter((t: any) => t.status === "pending" && !t.payment_confirmed)

    return NextResponse.json({
      success: true,
      transactions: paymentVerifications,
    })
  } catch (error) {
    console.error("Get payment verifications error:", error)
    return NextResponse.json({ error: "Failed to fetch payment verifications" }, { status: 500 })
  }
}
