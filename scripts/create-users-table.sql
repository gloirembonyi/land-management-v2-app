-- Create the users table with proper schema for NIDA-based authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nida_id VARCHAR(16) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'regular',
    is_verified BOOLEAN DEFAULT false,
    biometric_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create land_parcels table
CREATE TABLE IF NOT EXISTS land_parcels (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id),
    title_number VARCHAR(100) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    size_hectares DECIMAL(10,4) NOT NULL,
    land_use VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    blockchain_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create land_sales table
CREATE TABLE IF NOT EXISTS land_sales (
    id SERIAL PRIMARY KEY,
    land_parcel_id INTEGER REFERENCES land_parcels(id),
    seller_id INTEGER REFERENCES users(id),
    price DECIMAL(15,2) NOT NULL,
    qr_code TEXT NOT NULL,
    blockchain_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create sale_interactions table
CREATE TABLE IF NOT EXISTS sale_interactions (
    id SERIAL PRIMARY KEY,
    land_sale_id INTEGER REFERENCES land_sales(id),
    buyer_id INTEGER REFERENCES users(id),
    interaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    sale_interaction_id INTEGER REFERENCES sale_interactions(id),
    admin_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Insert test users with specified credentials
INSERT INTO users (nida_id, full_name, email, phone, password_hash, role, is_verified) VALUES
('1195432109876543', 'Admin Uwimana', 'admin@landmanagement.rw', '+250788123456', '$2b$10$rQJ8YnBtS.NU9rEuFZNzKOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'admin', true),
('1199780123456789', 'Jean Baptiste Seller', 'seller@landmanagement.rw', '+250788234567', '$2b$10$rQJ8YnBtS.NU9rEuFZNzKOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'regular', true),
('1198765432109876', 'Marie Buyer', 'buyer@landmanagement.rw', '+250788345678', '$2b$10$rQJ8YnBtS.NU9rEuFZNzKOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'regular', true)
ON CONFLICT (nida_id) DO NOTHING;

-- Insert test land parcels for the seller
INSERT INTO land_parcels (owner_id, title_number, location, size_hectares, land_use, blockchain_hash) VALUES
((SELECT id FROM users WHERE nida_id = '1199780123456789'), 'LT001/2024', 'Kigali, Gasabo District', 2.5, 'Residential', 'bc_hash_001'),
((SELECT id FROM users WHERE nida_id = '1199780123456789'), 'LT002/2024', 'Kigali, Kicukiro District', 1.8, 'Commercial', 'bc_hash_002'),
((SELECT id FROM users WHERE nida_id = '1199780123456789'), 'LT003/2024', 'Eastern Province, Rwamagana', 5.0, 'Agricultural', 'bc_hash_003')
ON CONFLICT (title_number) DO NOTHING;
