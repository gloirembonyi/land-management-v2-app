import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { type, title, message, related_user_id, related_sale_id } = await request.json()

    const result = await sql`
      INSERT INTO admin_notifications (type, title, message, related_user_id, related_sale_id)
      VALUES (${type}, ${title}, ${message}, ${related_user_id}, ${related_sale_id})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating admin notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM admin_notifications 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching admin notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
