import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { land_id, seller_id, buyer_id, transaction_amount, message } = await request.json()
    const userId = request.headers.get("x-user-id")

    if (!userId || userId !== buyer_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate required fields
    if (!land_id || !seller_id || !buyer_id || !transaction_amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify land is available for sale
    const land = await DatabaseService.getLandById(land_id)
    if (!land) {
      return NextResponse.json({ error: "Land not found" }, { status: 404 })
    }

    if (!land.is_for_sale) {
      return NextResponse.json({ error: "Land is not for sale" }, { status: 400 })
    }

    if (land.owner_id !== seller_id) {
      return NextResponse.json({ error: "Invalid seller" }, { status: 400 })
    }

    // Create transaction
    const transaction = await DatabaseService.createTransaction({
      land_id,
      seller_id,
      buyer_id,
      transaction_amount,
    })

    // Create admin notification
    await DatabaseService.createAdminNotification({
      type: "transaction_pending",
      title: "New Land Purchase Request",
      message: `A buyer is interested in purchasing "${land.title}" for ${transaction_amount.toLocaleString()} RWF. ${message ? `Message: ${message}` : ""}`,
      related_transaction_id: transaction.id,
      related_land_id: land_id,
    })

    return NextResponse.json({
      success: true,
      transaction,
      message: "Purchase request created successfully",
    })
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
