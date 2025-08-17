import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status, buyer_id } = await request.json()

    const result = await sql`
      UPDATE land_sales 
      SET status = ${status}, buyer_id = ${buyer_id}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating land sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
