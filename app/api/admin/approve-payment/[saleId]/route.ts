import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { saleId: string } }) {
  try {
    const { saleId } = params
    const { admin_id } = await request.json()

    // Get sale details
    const saleResult = await sql`
      SELECT ls.*, lp.id as land_id
      FROM land_sales ls
      JOIN land_parcels lp ON ls.land_id = lp.id
      WHERE ls.id = ${saleId}
    `

    if (saleResult.length === 0) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    const sale = saleResult[0]

    // Update sale status
    await sql`
      UPDATE land_sales 
      SET payment_confirmed = TRUE, 
          payment_confirmed_at = NOW(),
          admin_approved_by = ${admin_id},
          admin_approved_at = NOW(),
          status = 'completed',
          updated_at = NOW()
      WHERE id = ${saleId}
    `

    // Transfer land ownership
    await sql`
      UPDATE land_parcels 
      SET owner_id = ${sale.buyer_id}, updated_at = NOW()
      WHERE id = ${sale.land_id}
    `

    // Create transaction record
    await sql`
      INSERT INTO transactions (type, land_id, buyer_id, seller_id, amount, status, smart_contract_address, blockchain_tx_hash, sale_id)
      VALUES ('sale', ${sale.land_id}, ${sale.buyer_id}, ${sale.seller_id}, ${sale.asking_price}, 'completed', 
              ${`0x${Math.random().toString(16).substr(2, 40)}`}, ${`0x${Math.random().toString(16).substr(2, 64)}`}, ${saleId})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
