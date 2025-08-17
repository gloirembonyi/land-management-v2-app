import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { transaction_id, message, type } = await request.json()

    if (!transaction_id || !message || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get transaction details
    const transactions = await DatabaseService.getPendingTransactions()
    const transaction = transactions.find((t: any) => t.id === transaction_id)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Create admin notification
    await DatabaseService.createAdminNotification({
      type: "seller_payment_confirmation",
      title: "Seller Confirms Payment Received",
      message: `Seller ${transaction.seller_name} confirms payment received for "${transaction.land_title}". Message: ${message}`,
      related_transaction_id: transaction_id,
    })

    return NextResponse.json({
      success: true,
      message: "Admin has been notified about the payment confirmation",
    })
  } catch (error) {
    console.error("Seller contact admin error:", error)
    return NextResponse.json({ error: "Failed to contact admin" }, { status: 500 })
  }
}
