import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/rwanda_land")

export interface AuthUser {
  id: string
  name: string
  email: string
  nida_id: string
  role: "citizen" | "abunzi" | "admin"
  biometric_data?: string
  is_verified: boolean
  verified_by?: string
  verified_at?: Date
}

// Test user credentials for the three users
const TEST_CREDENTIALS = {
  "1195432109876543": { password: "admin123", role: "admin" }, // Admin
  "1199780123456789": { password: "seller123", role: "citizen" }, // Seller
  "1198765432109876": { password: "buyer123", role: "citizen" }, // Buyer
}

export async function authenticateUser(nidaId: string, password: string): Promise<AuthUser | null> {
  try {
    // Check test credentials first
    const testCred = TEST_CREDENTIALS[nidaId as keyof typeof TEST_CREDENTIALS]
    if (!testCred || testCred.password !== password) {
      return null
    }

    // Get user from database
    const result = await sql`
      SELECT * FROM users WHERE nida_id = ${nidaId}
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      nida_id: user.nida_id,
      role: user.role,
      biometric_data: user.biometric_data,
      is_verified: user.is_verified,
      verified_by: user.verified_by,
      verified_at: user.verified_at,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function authenticateUserBiometric(nidaId: string): Promise<AuthUser | null> {
  try {
    // Simulate biometric authentication - in real app this would verify biometric data
    const result = await sql`
      SELECT * FROM users WHERE nida_id = ${nidaId} AND biometric_data IS NOT NULL
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      nida_id: user.nida_id,
      role: user.role,
      biometric_data: user.biometric_data,
      is_verified: user.is_verified,
      verified_by: user.verified_by,
      verified_at: user.verified_at,
    }
  } catch (error) {
    console.error("Biometric authentication error:", error)
    return null
  }
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === "admin"
}

export function isVerifiedUser(user: AuthUser): boolean {
  return user.is_verified
}

export function canSellLand(user: AuthUser): boolean {
  return user.role === "citizen" && user.is_verified
}

export function canBuyLand(user: AuthUser): boolean {
  return user.role === "citizen" && user.is_verified
}
