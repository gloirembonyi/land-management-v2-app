-- Complete test data setup for Land Selling System
-- This creates comprehensive test data for all system features

-- Clear all existing data in correct order (respecting foreign key constraints)
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

-- Insert test users with proper verification setup
-- 1. Admin user (can verify users and approve transactions)
INSERT INTO users (name, email, nida_id, role, biometric_data, is_verified, verified_at) VALUES
('Admin Uwimana', 'admin@rwanda.gov.rw', '1195432109876543', 'admin', 'verified', TRUE, NOW());

-- 2. Regular user with lands (seller) - verified by admin
INSERT INTO users (name, email, nida_id, role, biometric_data, is_verified, verified_by, verified_at) VALUES
('Jean Baptiste Seller', 'jean.seller@example.com', '1199780123456789', 'citizen', 'verified', TRUE, 
 (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW());

-- 3. Regular user without lands (buyer) - verified by admin
INSERT INTO users (name, email, nida_id, role, biometric_data, is_verified, verified_by, verified_at) VALUES
('Marie Buyer', 'marie.buyer@example.com', '1198765432109876', 'citizen', 'verified', TRUE,
 (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW());

-- 4. Additional unverified user for testing admin verification workflow
INSERT INTO users (name, email, nida_id, role, biometric_data, is_verified) VALUES
('Paul Pending', 'paul.pending@example.com', '1197654321098765', 'citizen', 'verified', FALSE);

-- Insert land parcels for the seller (Jean Baptiste)
INSERT INTO land_parcels (title, location, coordinates, area, owner_id, status, blockchain_hash, value) VALUES
-- Land 1: Available for sale
('Kigali Prime Plot', 'Kigali, Gasabo District', '[-1.9441, 30.0619]', 500, 
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified', 
 '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z', 15000000),

-- Land 2: Available for sale
('Nyagatare Agricultural Land', 'Nyagatare, Eastern Province', '[-1.2921, 30.3378]', 2000,
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified',
 '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a', 8000000),

-- Land 3: Available for sale
('Huye Commercial Plot', 'Huye, Southern Province', '[-2.5967, 29.7394]', 800,
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified',
 '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b', 12000000),

-- Land 4: Keep for seller (not for sale)
('Musanze Tea Plantation', 'Musanze, Northern Province', '[-1.4991, 29.6369]', 5000,
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified',
 '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b3c', 25000000);

-- Create active land sales for testing the selling workflow
INSERT INTO land_sales (land_id, seller_id, asking_price, qr_code, blockchain_hash, status) VALUES
-- Active sale 1
((SELECT id FROM land_parcels WHERE title = 'Kigali Prime Plot'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 15000000,
 'QR_KIGALI_PRIME_PLOT_SALE_2024',
 '0x9f8e7d6c5b4a39281726354849576869708192a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8',
 'active'),

-- Active sale 2
((SELECT id FROM land_parcels WHERE title = 'Nyagatare Agricultural Land'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 8000000,
 'QR_NYAGATARE_AGRI_LAND_2024',
 '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
 'active');

-- Create a pending sale (buyer has expressed interest)
INSERT INTO land_sales (land_id, seller_id, asking_price, qr_code, blockchain_hash, status, buyer_id) VALUES
((SELECT id FROM land_parcels WHERE title = 'Huye Commercial Plot'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 12000000,
 'QR_HUYE_COMMERCIAL_PLOT_2024',
 '0xb2c3d4e5f6789012345678901234567890123456789012345678901234567890123456789012345678901234567890a1',
 'pending_payment',
 (SELECT id FROM users WHERE nida_id = '1198765432109876'));

-- Create sale interactions for testing
INSERT INTO sale_interactions (sale_id, buyer_id, interaction_type, message) VALUES
-- QR scan interaction
((SELECT id FROM land_sales WHERE qr_code = 'QR_KIGALI_PRIME_PLOT_SALE_2024'),
 (SELECT id FROM users WHERE nida_id = '1198765432109876'),
 'qr_scan',
 NULL),

-- Interest expression
((SELECT id FROM land_sales WHERE qr_code = 'QR_HUYE_COMMERCIAL_PLOT_2024'),
 (SELECT id FROM users WHERE nida_id = '1198765432109876'),
 'interest',
 'I am very interested in purchasing this commercial plot. Please let me know the next steps.');

-- Create admin notifications for testing admin workflow
INSERT INTO admin_notifications (type, title, message, related_user_id, related_sale_id, status) VALUES
-- User verification notification
('user_verification', 
 'New User Pending Verification', 
 'Paul Pending has registered and needs admin verification to access the system.',
 (SELECT id FROM users WHERE nida_id = '1197654321098765'),
 NULL,
 'pending'),

-- Sale approval notification
('sale_approval',
 'Land Sale Pending Admin Approval',
 'Jean Baptiste Seller is selling Huye Commercial Plot to Marie Buyer. Payment confirmation required.',
 NULL,
 (SELECT id FROM land_sales WHERE qr_code = 'QR_HUYE_COMMERCIAL_PLOT_2024'),
 'pending'),

-- Payment confirmation notification
('payment_confirmation',
 'Payment Confirmation Required',
 'Buyer has made payment for Huye Commercial Plot. Please verify with seller and approve transaction.',
 NULL,
 (SELECT id FROM land_sales WHERE qr_code = 'QR_HUYE_COMMERCIAL_PLOT_2024'),
 'pending');

-- Create sample completed transaction for transaction history
INSERT INTO transactions (type, land_id, buyer_id, seller_id, amount, status, smart_contract_address, blockchain_tx_hash) VALUES
('sale',
 (SELECT id FROM land_parcels WHERE title = 'Musanze Tea Plantation'),
 (SELECT id FROM users WHERE nida_id = '1198765432109876'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 25000000,
 'completed',
 '0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1',
 '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b3c4d');

-- Create sample documents
INSERT INTO documents (name, type, url, land_id, uploaded_by, file_size) VALUES
('Land Title Certificate', 'title_certificate', '/documents/kigali_prime_title.pdf',
 (SELECT id FROM land_parcels WHERE title = 'Kigali Prime Plot'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 2048576),

('Survey Report', 'survey_report', '/documents/nyagatare_survey.pdf',
 (SELECT id FROM land_parcels WHERE title = 'Nyagatare Agricultural Land'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 1536000);

-- Create sample payment records
INSERT INTO payments (user_id, type, amount, status, method, reference) VALUES
-- Land registration fee
((SELECT id FROM users WHERE nida_id = '1199780123456789'),
 'land_fee', 25000, 'completed', 'mtn', 'MTN-789456123'),

-- Transaction fee for pending sale
((SELECT id FROM users WHERE nida_id = '1198765432109876'),
 'transaction_fee', 15000, 'pending', 'airtel', 'AIR-456789123');

-- Create a sample dispute for testing dispute resolution
INSERT INTO disputes (title, description, status, land_id, complainant_id) VALUES
('Boundary Dispute - Kigali Plot',
 'There is a disagreement about the exact boundaries of my land parcel. The neighbor claims part of my land.',
 'open',
 (SELECT id FROM land_parcels WHERE title = 'Kigali Prime Plot'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'));

-- Add dispute message
INSERT INTO dispute_messages (dispute_id, sender_id, message, message_type) VALUES
((SELECT id FROM disputes WHERE title = 'Boundary Dispute - Kigali Plot'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 'I need help resolving this boundary issue. I have the original land documents that show the correct boundaries.',
 'text');
