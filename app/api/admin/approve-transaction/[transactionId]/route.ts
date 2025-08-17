import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const { approved_by } = await request.json()
    const { transactionId } = params

    if (!approved_by) {
      return NextResponse.json({ error: "Missing approved_by field" }, { status: 400 })
    }

    // First approve the transaction
    const approvedTransaction = await DatabaseService.approveTransaction(transactionId, approved_by)

    if (!approvedTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Then complete the transaction (transfer ownership)
    const completedTransaction = await DatabaseService.completeTransaction(transactionId)

    // Create notifications for both buyer and seller
    await DatabaseService.createAdminNotification({
      type: "transaction_completed",
      title: "Transaction Completed",
      message: `The land transaction has been completed successfully. Ownership has been transferred.`,
      related_transaction_id: transactionId,
    })

    return NextResponse.json({
      success: true,
      transaction: completedTransaction,
      message: "Transaction approved and completed successfully",
    })
  } catch (error) {
    console.error("Approve transaction error:", error)
    return NextResponse.json({ error: "Failed to approve transaction" }, { status: 500 })
  }
}
