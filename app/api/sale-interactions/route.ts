import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { sale_id, buyer_id, interaction_type, offer_amount, message } = await request.json()

    const result = await sql`
      INSERT INTO sale_interactions (sale_id, buyer_id, interaction_type, offer_amount, message)
      VALUES (${sale_id}, ${buyer_id}, ${interaction_type}, ${offer_amount}, ${message})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error recording sale interaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
