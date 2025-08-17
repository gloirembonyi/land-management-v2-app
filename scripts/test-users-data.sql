-- Insert test users for the land selling system
-- This will create 1 admin and 2 regular users as requested

-- Clear existing test data
DELETE FROM admin_notifications;
DELETE FROM sale_interactions;
DELETE FROM land_sales;
DELETE FROM transactions;
DELETE FROM dispute_messages;
DELETE FROM disputes;
DELETE FROM documents;
DELETE FROM payments;
DELETE FROM land_parcels;
DELETE FROM users;

-- Insert admin user
INSERT INTO users (name, email, nida_id, role, biometric_data, is_verified, verified_at) VALUES
('Admin Uwimana', 'admin@rwanda.gov.rw', '1195432109876543', 'admin', 'verified', TRUE, NOW());

-- Insert regular user with lands (seller)
INSERT INTO users (name, email, nida_id, role, biometric_data, is_verified, verified_by, verified_at) VALUES
('Jean Baptiste Seller', 'jean.seller@example.com', '1199780123456789', 'citizen', 'verified', TRUE, 
 (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW());

-- Insert regular user without lands (buyer)
INSERT INTO users (name, email, nida_id, role, biometric_data, is_verified, verified_by, verified_at) VALUES
('Marie Buyer', 'marie.buyer@example.com', '1198765432109876', 'citizen', 'verified', TRUE,
 (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW());

-- Insert land parcels for the seller
INSERT INTO land_parcels (title, location, coordinates, area, owner_id, status, blockchain_hash, value) VALUES
('Kigali Prime Plot', 'Kigali, Gasabo District', '[-1.9441, 30.0619]', 500, 
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified', 
 '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z', 15000000),

('Nyagatare Agricultural Land', 'Nyagatare, Eastern Province', '[-1.2921, 30.3378]', 2000,
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified',
 '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a', 8000000),

('Huye Commercial Plot', 'Huye, Southern Province', '[-2.5967, 29.7394]', 800,
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified',
 '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b', 12000000);

-- Create a sample land sale for testing
INSERT INTO land_sales (land_id, seller_id, asking_price, qr_code, blockchain_hash, status) VALUES
((SELECT id FROM land_parcels WHERE title = 'Kigali Prime Plot'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 15000000,
 'QR_KIGALI_PRIME_PLOT_SALE_2024',
 '0x9f8e7d6c5b4a39281726354849576869708192a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8',
 'active');
