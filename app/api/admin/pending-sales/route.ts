import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT ls.*, lp.title as land_title, lp.location,
             seller.name as seller_name, buyer.name as buyer_name
      FROM land_sales ls
      JOIN land_parcels lp ON ls.land_id = lp.id
      JOIN users seller ON ls.seller_id = seller.id
      LEFT JOIN users buyer ON ls.buyer_id = buyer.id
      WHERE ls.status = 'pending_payment'
      ORDER BY ls.created_at DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching pending sales:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
