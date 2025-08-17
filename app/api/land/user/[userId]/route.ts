import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    const result = await sql`
      SELECT lp.*, u.name as owner_name 
      FROM land_parcels lp
      JOIN users u ON lp.owner_id = u.id
      WHERE lp.owner_id = ${userId}
      ORDER BY lp.created_at DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching user lands:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
