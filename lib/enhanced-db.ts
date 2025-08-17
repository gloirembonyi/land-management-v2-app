import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/rwanda_land")

// Enhanced interfaces for the land selling system
export interface EnhancedUser {
  id: string
  name: string
  email: string
  nida_id: string
  role: "citizen" | "abunzi" | "admin"
  biometric_data?: string
  is_verified: boolean
  verified_by?: string
  verified_at?: Date
  created_at: Date
  updated_at: Date
}

export interface LandSale {
  id: string
  land_id: string
  seller_id: string
  asking_price: number
  qr_code: string
  blockchain_hash: string
  status: "active" | "pending_payment" | "completed" | "cancelled"
  buyer_id?: string
  admin_approved_by?: string
  admin_approved_at?: Date
  payment_confirmed: boolean
  payment_confirmed_at?: Date
  created_at: Date
  updated_at: Date
}

export interface SaleInteraction {
  id: string
  sale_id: string
  buyer_id: string
  interaction_type: "qr_scan" | "interest" | "offer"
  offer_amount?: number
  message?: string
  created_at: Date
}

export interface AdminNotification {
  id: string
  type: "user_verification" | "sale_approval" | "payment_confirmation"
  title: string
  message: string
  related_user_id?: string
  related_sale_id?: string
  admin_id?: string
  status: "pending" | "reviewed" | "completed"
  created_at: Date
  updated_at: Date
}

// User operations
export async function verifyUser(userId: string, adminId: string) {
  const result = await sql`
    UPDATE users 
    SET is_verified = TRUE, verified_by = ${adminId}, verified_at = NOW(), updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `
  return result[0]
}

export async function getUnverifiedUsers() {
  const result = await sql`
    SELECT * FROM users 
    WHERE is_verified = FALSE AND role != 'admin'
    ORDER BY created_at ASC
  `
  return result
}

// Land sale operations
export async function createLandSale(saleData: {
  land_id: string
  seller_id: string
  asking_price: number
  qr_code: string
  blockchain_hash: string
}) {
  const result = await sql`
    INSERT INTO land_sales (land_id, seller_id, asking_price, qr_code, blockchain_hash, status)
    VALUES (${saleData.land_id}, ${saleData.seller_id}, ${saleData.asking_price}, 
            ${saleData.qr_code}, ${saleData.blockchain_hash}, 'active')
    RETURNING *
  `
  return result[0]
}

export async function getLandSaleByQR(qrCode: string) {
  const result = await sql`
    SELECT ls.*, lp.title as land_title, lp.location, lp.area,
           seller.name as seller_name, buyer.name as buyer_name
    FROM land_sales ls
    JOIN land_parcels lp ON ls.land_id = lp.id
    JOIN users seller ON ls.seller_id = seller.id
    LEFT JOIN users buyer ON ls.buyer_id = buyer.id
    WHERE ls.qr_code = ${qrCode}
  `
  return result[0]
}

export async function updateLandSaleStatus(saleId: string, status: string, buyerId?: string) {
  const result = await sql`
    UPDATE land_sales 
    SET status = ${status}, 
        buyer_id = ${buyerId || null},
        updated_at = NOW()
    WHERE id = ${saleId}
    RETURNING *
  `
  return result[0]
}

export async function getPendingSales() {
  const result = await sql`
    SELECT ls.*, lp.title as land_title, lp.location,
           seller.name as seller_name, buyer.name as buyer_name
    FROM land_sales ls
    JOIN land_parcels lp ON ls.land_id = lp.id
    JOIN users seller ON ls.seller_id = seller.id
    LEFT JOIN users buyer ON ls.buyer_id = buyer.id
    WHERE ls.status = 'pending_payment'
    ORDER BY ls.created_at DESC
  `
  return result
}

// Sale interaction operations
export async function recordSaleInteraction(interactionData: {
  sale_id: string
  buyer_id: string
  interaction_type: "qr_scan" | "interest" | "offer"
  offer_amount?: number
  message?: string
}) {
  const result = await sql`
    INSERT INTO sale_interactions (sale_id, buyer_id, interaction_type, offer_amount, message)
    VALUES (${interactionData.sale_id}, ${interactionData.buyer_id}, 
            ${interactionData.interaction_type}, ${interactionData.offer_amount}, 
            ${interactionData.message})
    RETURNING *
  `
  return result[0]
}

// Admin notification operations
export async function createAdminNotification(notificationData: {
  type: "user_verification" | "sale_approval" | "payment_confirmation"
  title: string
  message: string
  related_user_id?: string
  related_sale_id?: string
}) {
  const result = await sql`
    INSERT INTO admin_notifications (type, title, message, related_user_id, related_sale_id)
    VALUES (${notificationData.type}, ${notificationData.title}, ${notificationData.message},
            ${notificationData.related_user_id}, ${notificationData.related_sale_id})
    RETURNING *
  `
  return result[0]
}

export async function getPendingAdminNotifications() {
  const result = await sql`
    SELECT * FROM admin_notifications 
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `
  return result
}

export async function approvePayment(saleId: string, adminId: string) {
  const result = await sql`
    UPDATE land_sales 
    SET payment_confirmed = TRUE, 
        payment_confirmed_at = NOW(),
        admin_approved_by = ${adminId},
        admin_approved_at = NOW(),
        status = 'completed',
        updated_at = NOW()
    WHERE id = ${saleId}
    RETURNING *
  `
  return result[0]
}

// Transfer land ownership
export async function transferLandOwnership(landId: string, newOwnerId: string) {
  const result = await sql`
    UPDATE land_parcels 
    SET owner_id = ${newOwnerId}, updated_at = NOW()
    WHERE id = ${landId}
    RETURNING *
  `
  return result[0]
}
