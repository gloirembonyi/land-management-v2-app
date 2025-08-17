import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/rwanda_land")

export interface User {
  id: string
  name: string
  email: string
  nida_id: string
  role: "citizen" | "abunzi" | "admin"
  biometric_data?: string
  created_at: Date
  updated_at: Date
}

export interface LandParcel {
  id: string
  title: string
  location: string
  coordinates: number[]
  area: number
  owner_id: string
  status: "verified" | "pending" | "disputed"
  blockchain_hash: string
  value: number
  created_at: Date
  updated_at: Date
}

export interface Transaction {
  id: string
  type: "sale" | "purchase" | "inheritance" | "mortgage"
  land_id: string
  buyer_id: string
  seller_id: string
  amount: number
  status: "pending" | "completed" | "failed"
  smart_contract_address: string
  blockchain_tx_hash: string
  created_at: Date
  updated_at: Date
}

// User operations
export async function createUser(userData: Omit<User, "id" | "created_at" | "updated_at">) {
  const result = await sql`
    INSERT INTO users (name, email, nida_id, role, biometric_data)
    VALUES (${userData.name}, ${userData.email}, ${userData.nida_id}, ${userData.role}, ${userData.biometric_data})
    RETURNING *
  `
  return result[0]
}

export async function getUserByNidaId(nidaId: string) {
  const result = await sql`
    SELECT * FROM users WHERE nida_id = ${nidaId}
  `
  return result[0]
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  `
  return result[0]
}

// Land operations
export async function createLandParcel(landData: Omit<LandParcel, "id" | "created_at" | "updated_at">) {
  const result = await sql`
    INSERT INTO land_parcels (title, location, coordinates, area, owner_id, status, blockchain_hash, value)
    VALUES (${landData.title}, ${landData.location}, ${JSON.stringify(landData.coordinates)}, 
            ${landData.area}, ${landData.owner_id}, ${landData.status}, ${landData.blockchain_hash}, ${landData.value})
    RETURNING *
  `
  return result[0]
}

export async function getLandParcelsByOwner(ownerId: string) {
  const result = await sql`
    SELECT lp.*, u.name as owner_name 
    FROM land_parcels lp
    JOIN users u ON lp.owner_id = u.id
    WHERE lp.owner_id = ${ownerId}
    ORDER BY lp.created_at DESC
  `
  return result
}

export async function getAllLandParcels() {
  const result = await sql`
    SELECT lp.*, u.name as owner_name 
    FROM land_parcels lp
    JOIN users u ON lp.owner_id = u.id
    ORDER BY lp.created_at DESC
  `
  return result
}

export async function updateLandParcelStatus(id: string, status: "verified" | "pending" | "disputed") {
  const result = await sql`
    UPDATE land_parcels 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0]
}

// Transaction operations
export async function createTransaction(transactionData: Omit<Transaction, "id" | "created_at" | "updated_at">) {
  const result = await sql`
    INSERT INTO transactions (type, land_id, buyer_id, seller_id, amount, status, smart_contract_address, blockchain_tx_hash)
    VALUES (${transactionData.type}, ${transactionData.land_id}, ${transactionData.buyer_id}, 
            ${transactionData.seller_id}, ${transactionData.amount}, ${transactionData.status},
            ${transactionData.smart_contract_address}, ${transactionData.blockchain_tx_hash})
    RETURNING *
  `
  return result[0]
}

export async function getTransactionsByUser(userId: string) {
  const result = await sql`
    SELECT t.*, 
           lp.title as land_title,
           buyer.name as buyer_name,
           seller.name as seller_name
    FROM transactions t
    JOIN land_parcels lp ON t.land_id = lp.id
    JOIN users buyer ON t.buyer_id = buyer.id
    JOIN users seller ON t.seller_id = seller.id
    WHERE t.buyer_id = ${userId} OR t.seller_id = ${userId}
    ORDER BY t.created_at DESC
  `
  return result
}

export async function updateTransactionStatus(id: string, status: "pending" | "completed" | "failed") {
  const result = await sql`
    UPDATE transactions 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return result[0]
}

// Analytics
export async function getLandStatistics() {
  const result = await sql`
    SELECT 
      COUNT(*) as total_parcels,
      COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_parcels,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_parcels,
      COUNT(CASE WHEN status = 'disputed' THEN 1 END) as disputed_parcels,
      SUM(value) as total_value,
      AVG(area) as average_area
    FROM land_parcels
  `
  return result[0]
}

export async function getTransactionStatistics() {
  const result = await sql`
    SELECT 
      COUNT(*) as total_transactions,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
      SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_transaction_value
    FROM transactions
  `
  return result[0]
}
