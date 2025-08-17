import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Create the SQL client
export const sql = neon(process.env.DATABASE_URL)

// Database utility functions
export class DatabaseService {
  // Land management functions
  static async createLand(landData: {
    owner_id: string
    title: string
    description?: string
    location_address: string
    latitude?: number
    longitude?: number
    area_size: number
    price?: number
  }) {
    // Validate that the user exists before creating the land
    const user = await this.getUserById(landData.owner_id)
    if (!user) {
      throw new Error(`User with ID ${landData.owner_id} does not exist`)
    }

    console.log(`[v0] Creating land for validated user: ${user.full_name}`)

    const result = await sql`
      INSERT INTO land_management.lands (
        owner_id, title, description, location_address, 
        latitude, longitude, area_size, price
      )
      VALUES (
        ${landData.owner_id}, ${landData.title}, ${landData.description || null},
        ${landData.location_address}, ${landData.latitude || null}, 
        ${landData.longitude || null}, ${landData.area_size}, ${landData.price || null}
      )
      RETURNING *
    `
    return result[0]
  }

  static async getLandsByOwner(owner_id: string) {
    return await sql`
      SELECT l.*, 
             array_agg(
               json_build_object(
                 'id', d.id,
                 'document_type', d.document_type,
                 'file_name', d.file_name,
                 'file_url', d.file_url,
                 'created_at', d.created_at
               )
             ) FILTER (WHERE d.id IS NOT NULL) as documents
      FROM land_management.lands l
      LEFT JOIN land_management.documents d ON l.id = d.land_id
      WHERE l.owner_id = ${owner_id}
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `
  }

  static async getLandById(land_id: string) {
    const result = await sql`
      SELECT l.*, 
             u.full_name as owner_name,
             u.email as owner_email,
             array_agg(
               json_build_object(
                 'id', d.id,
                 'document_type', d.document_type,
                 'file_name', d.file_name,
                 'file_url', d.file_url,
                 'created_at', d.created_at
               )
             ) FILTER (WHERE d.id IS NOT NULL) as documents
      FROM land_management.lands l
      LEFT JOIN public.users u ON l.owner_id::integer = u.id
      LEFT JOIN land_management.documents d ON l.id = d.land_id
      WHERE l.id = ${land_id}
      GROUP BY l.id, u.full_name, u.email
    `
    return result[0]
  }

  static async getPendingLands() {
    return await sql`
      SELECT l.*, 
             u.full_name as owner_name,
             u.email as owner_email
      FROM land_management.lands l
      LEFT JOIN public.users u ON l.owner_id::integer = u.id
      WHERE l.status = 'pending'
      ORDER BY l.created_at ASC
    `
  }

  static async approveLand(land_id: string, approved_by: string) {
    // Generate blockchain hash and QR code data
    const blockchain_hash = `BLK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const qr_code_data = `LAND_${land_id}_${blockchain_hash}`

    const result = await sql`
      UPDATE land_management.lands 
      SET status = 'approved', 
          approved_by = ${approved_by}, 
          approved_at = NOW(),
          blockchain_hash = ${blockchain_hash},
          qr_code_data = ${qr_code_data}
      WHERE id = ${land_id}
      RETURNING *
    `
    return result[0]
  }

  static async rejectLand(land_id: string, approved_by: string) {
    const result = await sql`
      UPDATE land_management.lands 
      SET status = 'rejected', 
          approved_by = ${approved_by}, 
          approved_at = NOW()
      WHERE id = ${land_id}
      RETURNING *
    `
    return result[0]
  }

  // Document management functions
  static async addDocument(documentData: {
    land_id: string
    document_type: string
    file_name: string
    file_url: string
    file_size?: number
    mime_type?: string
    uploaded_by: string
  }) {
    const result = await sql`
      INSERT INTO land_management.documents (
        land_id, document_type, file_name, file_url, 
        file_size, mime_type, uploaded_by
      )
      VALUES (
        ${documentData.land_id}, ${documentData.document_type}, 
        ${documentData.file_name}, ${documentData.file_url},
        ${documentData.file_size || null}, ${documentData.mime_type || null},
        ${documentData.uploaded_by}
      )
      RETURNING *
    `
    return result[0]
  }

  // Transaction management functions
  static async createTransaction(transactionData: {
    land_id: string
    seller_id: string
    buyer_id: string
    transaction_amount: number
  }) {
    // Generate QR code and blockchain hash for transaction
    const blockchain_hash = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const qr_code_data = `TXN_${transactionData.land_id}_${blockchain_hash}`

    const result = await sql`
      INSERT INTO land_management.transactions (
        land_id, seller_id, buyer_id, transaction_amount,
        blockchain_hash, qr_code_data
      )
      VALUES (
        ${transactionData.land_id}, ${transactionData.seller_id}, 
        ${transactionData.buyer_id}, ${transactionData.transaction_amount},
        ${blockchain_hash}, ${qr_code_data}
      )
      RETURNING *
    `
    return result[0]
  }

  static async getUserTransactions(user_id: string) {
    return await sql`
      SELECT t.*, 
             l.title as land_title,
             l.location_address,
             seller.full_name as seller_name,
             buyer.full_name as buyer_name,
             t.transaction_amount as amount,
             t.qr_code_data as qr_code,
             t.blockchain_hash
      FROM land_management.transactions t
      LEFT JOIN land_management.lands l ON t.land_id = l.id
      LEFT JOIN public.users seller ON t.seller_id::integer = seller.id
      LEFT JOIN public.users buyer ON t.buyer_id::integer = buyer.id
      WHERE t.seller_id = ${user_id} OR t.buyer_id = ${user_id}
      ORDER BY t.created_at DESC
    `
  }

  static async getTransactionsByUser(user_id: string) {
    return await sql`
      SELECT t.*, 
             l.title as land_title,
             l.location_address,
             seller.full_name as seller_name,
             buyer.full_name as buyer_name
      FROM land_management.transactions t
      LEFT JOIN land_management.lands l ON t.land_id = l.id
      LEFT JOIN public.users seller ON t.seller_id::integer = seller.id
      LEFT JOIN public.users buyer ON t.buyer_id::integer = buyer.id
      WHERE t.seller_id = ${user_id} OR t.buyer_id = ${user_id}
      ORDER BY t.created_at DESC
    `
  }

  static async getPendingTransactions() {
    return await sql`
      SELECT t.*, 
             l.title as land_title,
             l.location_address,
             seller.full_name as seller_name,
             seller.email as seller_email,
             buyer.full_name as buyer_name,
             buyer.email as buyer_email
      FROM land_management.transactions t
      LEFT JOIN land_management.lands l ON t.land_id = l.id
      LEFT JOIN public.users seller ON t.seller_id::integer = seller.id
      LEFT JOIN public.users buyer ON t.buyer_id::integer = buyer.id
      WHERE t.status = 'pending'
      ORDER BY t.created_at ASC
    `
  }

  static async approveTransaction(transaction_id: string, approved_by: string) {
    const result = await sql`
      UPDATE land_management.transactions 
      SET status = 'approved', 
          payment_confirmed = true,
          payment_confirmed_by = ${approved_by},
          updated_at = NOW()
      WHERE id = ${transaction_id}
      RETURNING *
    `
    return result[0]
  }

  static async completeTransaction(transaction_id: string) {
    // Start a transaction to update both transaction and land ownership
    const transaction = await sql`
      SELECT * FROM land_management.transactions 
      WHERE id = ${transaction_id} AND status = 'approved'
    `

    if (transaction.length === 0) {
      throw new Error("Transaction not found or not approved")
    }

    const txn = transaction[0]

    // Update land ownership
    await sql`
      UPDATE land_management.lands 
      SET owner_id = ${txn.buyer_id}, 
          is_for_sale = false,
          updated_at = NOW()
      WHERE id = ${txn.land_id}
    `

    // Complete the transaction
    const result = await sql`
      UPDATE land_management.transactions 
      SET status = 'completed', 
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = ${transaction_id}
      RETURNING *
    `

    return result[0]
  }

  static async requestPaymentVerification(transaction_id: string, seller_message: string) {
    await sql`
      UPDATE land_management.transactions 
      SET status = 'payment_verification',
          seller_message = ${seller_message},
          updated_at = NOW()
      WHERE id = ${transaction_id}
    `

    // Create admin notification
    return await this.createAdminNotification({
      type: "payment_verification",
      title: "Payment Verification Requested",
      message: `Seller has requested payment verification for transaction ${transaction_id}`,
      related_transaction_id: transaction_id,
    })
  }

  static async verifyPayment(transaction_id: string, payment_received: boolean, admin_id: string) {
    if (payment_received) {
      // Complete the transaction
      return await this.completeTransaction(transaction_id)
    } else {
      // Revert to pending status
      const result = await sql`
        UPDATE land_management.transactions 
        SET status = 'pending',
            updated_at = NOW()
        WHERE id = ${transaction_id}
        RETURNING *
      `
      return result[0]
    }
  }

  static async getPaymentVerifications() {
    return await sql`
      SELECT t.*, 
             l.title as land_title,
             l.location_address,
             seller.full_name as seller_name,
             seller.email as seller_email,
             buyer.full_name as buyer_name,
             buyer.email as buyer_email
      FROM land_management.transactions t
      LEFT JOIN land_management.lands l ON t.land_id = l.id
      LEFT JOIN public.users seller ON t.seller_id::integer = seller.id
      LEFT JOIN public.users buyer ON t.buyer_id::integer = buyer.id
      WHERE t.status = 'payment_verification'
      ORDER BY t.updated_at ASC
    `
  }

  // Admin notification functions
  static async createAdminNotification(notificationData: {
    type: string
    title: string
    message: string
    related_land_id?: string
    related_transaction_id?: string
  }) {
    const result = await sql`
      INSERT INTO land_management.admin_notifications (
        type, title, message, related_land_id, related_transaction_id
      )
      VALUES (
        ${notificationData.type}, ${notificationData.title}, 
        ${notificationData.message}, ${notificationData.related_land_id || null},
        ${notificationData.related_transaction_id || null}
      )
      RETURNING *
    `
    return result[0]
  }

  static async getUnreadAdminNotifications() {
    return await sql`
      SELECT * FROM land_management.admin_notifications 
      WHERE is_read = false 
      ORDER BY created_at DESC
    `
  }

  static async markNotificationAsRead(notification_id: string) {
    const result = await sql`
      UPDATE land_management.admin_notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = ${notification_id}
      RETURNING *
    `
    return result[0]
  }

  // Utility functions
  static async getAvailableLands() {
    return await sql`
      SELECT l.*, 
             u.full_name as owner_name,
             u.email as owner_email
      FROM land_management.lands l
      LEFT JOIN public.users u ON l.owner_id::integer = u.id
      WHERE l.status = 'approved' AND l.is_for_sale = true
      ORDER BY l.created_at DESC
    `
  }

  static async setLandForSale(land_id: string, price: number) {
    const result = await sql`
      UPDATE land_management.lands 
      SET is_for_sale = true, price = ${price}, updated_at = NOW()
      WHERE id = ${land_id}
      RETURNING *
    `
    return result[0]
  }

  static async searchLandByQR(qr_code: string) {
    const result = await sql`
      SELECT l.*, 
             u.full_name as owner_name,
             u.email as owner_email
      FROM land_management.lands l
      LEFT JOIN public.users u ON l.owner_id::integer = u.id
      WHERE l.qr_code_data = ${qr_code} AND l.status = 'approved' AND l.is_for_sale = true
    `
    return result[0]
  }

  // User management functions
  static async getUserById(user_id: string | number) {
    const id = typeof user_id === "string" ? Number.parseInt(user_id) : user_id
    if (isNaN(id)) {
      throw new Error(`Invalid user ID: ${user_id}`)
    }

    const result = await sql`
      SELECT * FROM public.users 
      WHERE id = ${id}
    `
    return result[0]
  }

  static async getUserByNida(nida: string) {
    const result = await sql`
      SELECT * FROM public.users 
      WHERE nida_id = ${nida}
    `
    return result[0]
  }
}
