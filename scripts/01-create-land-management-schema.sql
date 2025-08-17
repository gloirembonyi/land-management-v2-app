-- Create the main schema for land management
CREATE SCHEMA IF NOT EXISTS land_management;

-- Create enum types for better data integrity
CREATE TYPE land_management.land_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE land_management.transaction_status AS ENUM ('pending', 'approved', 'completed', 'cancelled');
CREATE TYPE land_management.document_type AS ENUM ('title_deed', 'survey_map', 'tax_certificate', 'identity_document', 'other');

-- Lands table - stores all land information
CREATE TABLE land_management.lands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    area_size DECIMAL(10, 2) NOT NULL, -- in square meters
    price DECIMAL(15, 2), -- price in RWF (Rwandan Francs)
    status land_management.land_status DEFAULT 'pending',
    blockchain_hash VARCHAR(255), -- for blockchain integration
    qr_code_data TEXT, -- QR code data for transactions
    is_for_sale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT REFERENCES neon_auth.users_sync(id)
);

-- Documents table - stores all documents related to lands
CREATE TABLE land_management.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID NOT NULL REFERENCES land_management.lands(id) ON DELETE CASCADE,
    document_type land_management.document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- URL to the stored document
    file_size INTEGER, -- file size in bytes
    mime_type VARCHAR(100),
    uploaded_by TEXT NOT NULL REFERENCES neon_auth.users_sync(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table - handles buying/selling of lands
CREATE TABLE land_management.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID NOT NULL REFERENCES land_management.lands(id),
    seller_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id),
    buyer_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id),
    transaction_amount DECIMAL(15, 2) NOT NULL,
    status land_management.transaction_status DEFAULT 'pending',
    qr_code_data TEXT, -- QR code for this specific transaction
    blockchain_hash VARCHAR(255), -- blockchain transaction hash
    payment_confirmed BOOLEAN DEFAULT FALSE,
    payment_confirmed_by TEXT REFERENCES neon_auth.users_sync(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Admin notifications table - for admin approval workflows
CREATE TABLE land_management.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'land_registration', 'transaction_approval', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_land_id UUID REFERENCES land_management.lands(id),
    related_transaction_id UUID REFERENCES land_management.transactions(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_lands_owner_id ON land_management.lands(owner_id);
CREATE INDEX idx_lands_status ON land_management.lands(status);
CREATE INDEX idx_lands_for_sale ON land_management.lands(is_for_sale);
CREATE INDEX idx_lands_location ON land_management.lands(latitude, longitude);
CREATE INDEX idx_documents_land_id ON land_management.documents(land_id);
CREATE INDEX idx_transactions_land_id ON land_management.transactions(land_id);
CREATE INDEX idx_transactions_seller_id ON land_management.transactions(seller_id);
CREATE INDEX idx_transactions_buyer_id ON land_management.transactions(buyer_id);
CREATE INDEX idx_transactions_status ON land_management.transactions(status);
CREATE INDEX idx_admin_notifications_type ON land_management.admin_notifications(type);
CREATE INDEX idx_admin_notifications_read ON land_management.admin_notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION land_management.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_lands_updated_at BEFORE UPDATE ON land_management.lands
    FOR EACH ROW EXECUTE FUNCTION land_management.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON land_management.transactions
    FOR EACH ROW EXECUTE FUNCTION land_management.update_updated_at_column();
