import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const TEST_CREDENTIALS = {
  "1195432109876543": { password: "admin123", role: "admin", name: "Admin Uwimana" },
  "1199780123456789": { password: "seller123", role: "regular", name: "Jean Baptiste Seller" },
  "1198765432109876": { password: "buyer123", role: "regular", name: "Marie Buyer" },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nidaId, password, biometric } = body

    console.log("[v0] Authentication attempt for NIDA:", nidaId)

    let user = null

    if (biometric) {
      const testCred = TEST_CREDENTIALS[nidaId as keyof typeof TEST_CREDENTIALS]
      if (testCred) {
        user = {
          id: Number.parseInt(nidaId.slice(-3)), // Use last 3 digits as ID
          name: testCred.name,
          email: `${testCred.name.toLowerCase().replace(/\s+/g, ".")}@landmanagement.rw`,
          nida_id: nidaId,
          role: testCred.role,
          is_verified: true,
        }
        console.log("[v0] Biometric authentication successful for:", testCred.name)
      }
    } else {
      const testCred = TEST_CREDENTIALS[nidaId as keyof typeof TEST_CREDENTIALS]
      if (testCred && testCred.password === password) {
        console.log("[v0] Test credentials matched for:", testCred.name)

        // Try to get user from database, fallback to test data
        try {
          const result = await sql`
            SELECT * FROM users WHERE nida_id = ${nidaId}
          `

          if (result.length > 0) {
            const dbUser = result[0]
            user = {
              id: dbUser.id,
              name: dbUser.full_name || testCred.name,
              email: dbUser.email || `${testCred.name.toLowerCase().replace(/\s+/g, ".")}@landmanagement.rw`,
              nida_id: dbUser.nida_id,
              role: dbUser.role || testCred.role,
              is_verified: dbUser.is_verified !== false,
            }
            console.log("[v0] Database user found:", user.name)
          } else {
            // Fallback to test credentials
            user = {
              id: Number.parseInt(nidaId.slice(-3)), // Use last 3 digits as ID
              name: testCred.name,
              email: `${testCred.name.toLowerCase().replace(/\s+/g, ".")}@landmanagement.rw`,
              nida_id: nidaId,
              role: testCred.role,
              is_verified: true,
            }
            console.log("[v0] Using test credentials fallback for:", user.name)
          }
        } catch (dbError) {
          console.log("[v0] Database query failed, using test credentials:", dbError)
          // Fallback to test credentials when database is not ready
          user = {
            id: Number.parseInt(nidaId.slice(-3)), // Use last 3 digits as ID
            name: testCred.name,
            email: `${testCred.name.toLowerCase().replace(/\s+/g, ".")}@landmanagement.rw`,
            nida_id: nidaId,
            role: testCred.role,
            is_verified: true,
          }
        }
      } else {
        console.log("[v0] Invalid credentials for NIDA:", nidaId)
      }
    }

    if (user) {
      console.log("[v0] Authentication successful for user:", user.name, "Role:", user.role)
      return NextResponse.json({ success: true, user })
    } else {
      console.log("[v0] Authentication failed for NIDA:", nidaId)
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Authentication API error:", error)
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}
