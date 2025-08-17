-- Enhanced database schema for Land Selling System
-- This builds on the existing schema with additional features for land selling workflow

-- Add verification status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create land_sales table for managing the selling process
CREATE TABLE IF NOT EXISTS land_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    land_id UUID NOT NULL REFERENCES land_parcels(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    asking_price BIGINT NOT NULL,
    qr_code TEXT NOT NULL,
    blockchain_hash VARCHAR(66) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'pending_payment', 'completed', 'cancelled')),
    buyer_id UUID REFERENCES users(id),
    admin_approved_by UUID REFERENCES users(id),
    admin_approved_at TIMESTAMP WITH TIME ZONE,
    payment_confirmed BOOLEAN DEFAULT FALSE,
    payment_confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sale_interactions table to track QR code scans and buyer interest
CREATE TABLE IF NOT EXISTS sale_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES land_sales(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('qr_scan', 'interest', 'offer')),
    offer_amount BIGINT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_notifications table for admin approval workflow
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(30) NOT NULL CHECK (type IN ('user_verification', 'sale_approval', 'payment_confirmation')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_user_id UUID REFERENCES users(id),
    related_sale_id UUID REFERENCES land_sales(id),
    admin_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'reviewed', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_land_sales_seller_id ON land_sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_land_sales_buyer_id ON land_sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_land_sales_status ON land_sales(status);
CREATE INDEX IF NOT EXISTS idx_sale_interactions_sale_id ON sale_interactions(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_interactions_buyer_id ON sale_interactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON admin_notifications(admin_id);

-- Create triggers for updated_at on new tables
CREATE TRIGGER update_land_sales_updated_at BEFORE UPDATE ON land_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_notifications_updated_at BEFORE UPDATE ON admin_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing transactions table to link with land_sales
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sale_id UUID REFERENCES land_sales(id);
