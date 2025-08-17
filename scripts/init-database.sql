-- Create database schema for Rwanda Land Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    nida_id VARCHAR(16) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('citizen', 'abunzi', 'admin', 'user')),
    is_verified BOOLEAN DEFAULT false,
    biometric_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Land parcels table
CREATE TABLE IF NOT EXISTS land_parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    coordinates JSONB NOT NULL,
    coordinates_lat DECIMAL(10, 8),
    coordinates_lng DECIMAL(11, 8),
    area INTEGER NOT NULL,
    size_hectares DECIMAL(10, 4),
    owner_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('verified', 'pending', 'disputed', 'owned', 'for_sale')),
    blockchain_hash VARCHAR(66) NOT NULL,
    value BIGINT NOT NULL,
    price BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'purchase', 'inheritance', 'mortgage')),
    land_id UUID NOT NULL REFERENCES land_parcels(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    amount BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    smart_contract_address VARCHAR(42) NOT NULL,
    blockchain_tx_hash VARCHAR(66) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    land_id UUID REFERENCES land_parcels(id),
    transaction_id UUID REFERENCES transactions(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')),
    land_id UUID NOT NULL REFERENCES land_parcels(id),
    complainant_id UUID NOT NULL REFERENCES users(id),
    abunzi_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispute messages table
CREATE TABLE IF NOT EXISTS dispute_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID NOT NULL REFERENCES disputes(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'document', 'decision')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    transaction_id UUID REFERENCES transactions(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('land_fee', 'transaction_fee', 'verification_fee')),
    amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    method VARCHAR(20) NOT NULL CHECK (method IN ('mtn', 'airtel', 'bank', 'irembo')),
    reference VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Land sales table for QR code selling system
CREATE TABLE IF NOT EXISTS land_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    land_parcel_id UUID NOT NULL REFERENCES land_parcels(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    price BIGINT NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    blockchain_hash VARCHAR(66) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale interactions table for buyer-seller communication
CREATE TABLE IF NOT EXISTS sale_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    land_sale_id UUID NOT NULL REFERENCES land_sales(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('interest', 'offer', 'message')),
    message TEXT,
    offer_amount BIGINT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_nida_id ON users(nida_id);
CREATE INDEX IF NOT EXISTS idx_land_parcels_owner_id ON land_parcels(owner_id);
CREATE INDEX IF NOT EXISTS idx_land_parcels_status ON land_parcels(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_land_id ON transactions(land_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_disputes_land_id ON disputes(land_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_land_sales_seller_id ON land_sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_land_sales_status ON land_sales(status);
CREATE INDEX IF NOT EXISTS idx_land_sales_qr_code ON land_sales(qr_code);
CREATE INDEX IF NOT EXISTS idx_sale_interactions_land_sale_id ON sale_interactions(land_sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_interactions_buyer_id ON sale_interactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_land_parcels_updated_at BEFORE UPDATE ON land_parcels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_land_sales_updated_at BEFORE UPDATE ON land_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
