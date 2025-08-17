import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { land_id, seller_id, asking_price } = await request.json()

    // Generate QR code and blockchain hash
    const qr_code = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const blockchain_hash = `0x${Math.random().toString(16).substr(2, 64)}`

    const result = await sql`
      INSERT INTO land_sales (land_id, seller_id, asking_price, qr_code, blockchain_hash, status)
      VALUES (${land_id}, ${seller_id}, ${asking_price}, ${qr_code}, ${blockchain_hash}, 'active')
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating land sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
