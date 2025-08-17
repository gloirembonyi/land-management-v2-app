import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM users 
      WHERE is_verified = FALSE AND role != 'admin'
      ORDER BY created_at ASC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching unverified users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
