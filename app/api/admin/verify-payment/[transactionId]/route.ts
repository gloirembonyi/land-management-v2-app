import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const { payment_confirmed, verification_notes } = await request.json()
    const { transactionId } = params

    if (typeof payment_confirmed !== "boolean") {
      return NextResponse.json({ error: "payment_confirmed must be a boolean" }, { status: 400 })
    }

    if (payment_confirmed) {
      // If payment is confirmed, approve and complete the transaction
      const approvedTransaction = await DatabaseService.approveTransaction(transactionId, "admin")
      const completedTransaction = await DatabaseService.completeTransaction(transactionId)

      // Create success notifications
      await DatabaseService.createAdminNotification({
        type: "payment_verified",
        title: "Payment Verified - Transaction Completed",
        message: `Payment has been verified and the land transaction has been completed successfully. ${verification_notes ? `Notes: ${verification_notes}` : ""}`,
        related_transaction_id: transactionId,
      })

      return NextResponse.json({
        success: true,
        transaction: completedTransaction,
        message: "Payment verified and transaction completed successfully",
      })
    } else {
      // If payment is not confirmed, keep transaction pending
      await DatabaseService.createAdminNotification({
        type: "payment_not_verified",
        title: "Payment Not Verified",
        message: `Payment has not been received by the seller. Transaction remains pending. ${verification_notes ? `Notes: ${verification_notes}` : ""}`,
        related_transaction_id: transactionId,
      })

      return NextResponse.json({
        success: true,
        message: "Payment marked as not received. Transaction remains pending.",
      })
    }
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
