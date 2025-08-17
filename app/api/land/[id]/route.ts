import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const result = await sql`
      SELECT lp.*, u.name as owner_name 
      FROM land_parcels lp
      JOIN users u ON lp.owner_id = u.id
      WHERE lp.id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Land parcel not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching land parcel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
