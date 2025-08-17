import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { admin_id } = await request.json()

    const result = await sql`
      UPDATE users 
      SET is_verified = TRUE, verified_by = ${admin_id}, verified_at = NOW(), updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error verifying user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
