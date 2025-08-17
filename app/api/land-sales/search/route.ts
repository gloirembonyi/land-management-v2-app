import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Sale code is required" }, { status: 400 })
    }

    const result = await sql`
      SELECT ls.*, lp.title as land_title, lp.location, lp.area,
             seller.name as seller_name
      FROM land_sales ls
      JOIN land_parcels lp ON ls.land_id = lp.id
      JOIN users seller ON ls.seller_id = seller.id
      WHERE ls.qr_code = ${code} AND ls.status = 'active'
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Sale not found or no longer active" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error searching land sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
