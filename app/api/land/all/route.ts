import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT lp.*, u.full_name as owner_name 
      FROM public.land_parcels lp
      JOIN public.users u ON lp.owner_id = u.id
      ORDER BY lp.created_at DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching all lands:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
