const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function setupDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('Setting up database schema...');
    
    // Create the main schema
    await sql`CREATE SCHEMA IF NOT EXISTS land_management`;
    
    // Create enum types
    await sql`CREATE TYPE land_management.land_status AS ENUM ('pending', 'approved', 'rejected')`;
    await sql`CREATE TYPE land_management.transaction_status AS ENUM ('pending', 'approved', 'completed', 'cancelled')`;
    await sql`CREATE TYPE land_management.document_type AS ENUM ('title_deed', 'survey_map', 'tax_certificate', 'identity_document', 'other')`;
    
    // Create users table (simplified for now)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        nida_id VARCHAR(20) UNIQUE NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('citizen', 'abunzi', 'admin')),
        biometric_data TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by UUID,
        verified_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // Add foreign key constraint for verified_by after users table is created
    await sql`ALTER TABLE users ADD CONSTRAINT fk_users_verified_by FOREIGN KEY (verified_by) REFERENCES users(id)`;
    
    // Create lands table
    await sql`
      CREATE TABLE IF NOT EXISTS land_management.lands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location_address TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        area_size DECIMAL(10, 2) NOT NULL,
        price DECIMAL(15, 2),
        status land_management.land_status DEFAULT 'pending',
        blockchain_hash VARCHAR(255),
        qr_code_data TEXT,
        is_for_sale BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by UUID
      )
    `;
    
    // Add foreign key constraints for lands table
    await sql`ALTER TABLE land_management.lands ADD CONSTRAINT fk_lands_owner_id FOREIGN KEY (owner_id) REFERENCES users(id)`;
    await sql`ALTER TABLE land_management.lands ADD CONSTRAINT fk_lands_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)`;
    
    // Create documents table
    await sql`
      CREATE TABLE IF NOT EXISTS land_management.documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        land_id UUID NOT NULL,
        document_type land_management.document_type NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        uploaded_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // Add foreign key constraints for documents table
    await sql`ALTER TABLE land_management.documents ADD CONSTRAINT fk_documents_land_id FOREIGN KEY (land_id) REFERENCES land_management.lands(id) ON DELETE CASCADE`;
    await sql`ALTER TABLE land_management.documents ADD CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)`;
    
    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS land_management.transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        land_id UUID NOT NULL,
        seller_id UUID NOT NULL,
        buyer_id UUID NOT NULL,
        transaction_amount DECIMAL(15, 2) NOT NULL,
        status land_management.transaction_status DEFAULT 'pending',
        qr_code_data TEXT,
        blockchain_hash VARCHAR(255),
        payment_confirmed BOOLEAN DEFAULT FALSE,
        payment_confirmed_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `;
    
    // Add foreign key constraints for transactions table
    await sql`ALTER TABLE land_management.transactions ADD CONSTRAINT fk_transactions_land_id FOREIGN KEY (land_id) REFERENCES land_management.lands(id)`;
    await sql`ALTER TABLE land_management.transactions ADD CONSTRAINT fk_transactions_seller_id FOREIGN KEY (seller_id) REFERENCES users(id)`;
    await sql`ALTER TABLE land_management.transactions ADD CONSTRAINT fk_transactions_buyer_id FOREIGN KEY (buyer_id) REFERENCES users(id)`;
    await sql`ALTER TABLE land_management.transactions ADD CONSTRAINT fk_transactions_payment_confirmed_by FOREIGN KEY (payment_confirmed_by) REFERENCES users(id)`;
    
    // Create admin notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS land_management.admin_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_land_id UUID REFERENCES land_management.lands(id),
        related_transaction_id UUID REFERENCES land_management.transactions(id),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        read_at TIMESTAMP WITH TIME ZONE
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_nida_id ON users(nida_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lands_owner_id ON land_management.lands(owner_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lands_status ON land_management.lands(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_lands_for_sale ON land_management.lands(is_for_sale)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_land_id ON land_management.transactions(land_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON land_management.transactions(seller_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON land_management.transactions(buyer_id)`;
    
    // Create updated_at trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    // Add triggers
    await sql`CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    await sql`CREATE TRIGGER update_lands_updated_at BEFORE UPDATE ON land_management.lands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    await sql`CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON land_management.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    
    // Insert test admin user
    await sql`
      INSERT INTO users (id, name, email, nida_id, role, is_verified) 
      VALUES ('1195432109876543', 'Admin Uwimana', 'admin@landmanagement.rw', '1195432109876543', 'admin', true)
      ON CONFLICT (id) DO NOTHING
    `;
    
    console.log('Database schema setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
  }
}

setupDatabase();
