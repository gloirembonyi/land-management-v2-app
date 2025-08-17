-- Seed data for Rwanda Land Management System

-- Insert sample users
INSERT INTO users (name, email, nida_id, role, biometric_data) VALUES
('Jean Baptiste Uwimana', 'jean.uwimana@example.com', '1199780123456789', 'citizen', 'verified'),
('Marie Mukamana', 'marie.mukamana@example.com', '1198765432109876', 'citizen', 'verified'),
('Paul Nkurunziza', 'paul.nkurunziza@example.com', '1197654321098765', 'citizen', 'verified'),
('Jeanne Mukamana', 'jeanne.mukamana@example.com', '1196543210987654', 'abunzi', 'verified'),
('Admin User', 'admin@rwanda.gov.rw', '1195432109876543', 'admin', 'verified');

-- Insert sample land parcels
INSERT INTO land_parcels (title, location, coordinates, area, owner_id, status, blockchain_hash, value) VALUES
('Kigali Residential Plot', 'Kigali, Gasabo District', '[-1.9441, 30.0619]', 500, 
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified', 
 '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z', 15000000),

('Nyagatare Agricultural Land', 'Nyagatare, Eastern Province', '[-1.2921, 30.3378]', 2000,
 (SELECT id FROM users WHERE nida_id = '1198765432109876'), 'pending',
 '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a', 8000000),

('Huye Commercial Plot', 'Huye, Southern Province', '[-2.5967, 29.7394]', 800,
 (SELECT id FROM users WHERE nida_id = '1197654321098765'), 'disputed',
 '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b', 12000000),

('Musanze Tea Plantation', 'Musanze, Northern Province', '[-1.4991, 29.6369]', 5000,
 (SELECT id FROM users WHERE nida_id = '1199780123456789'), 'verified',
 '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b3c', 25000000);

-- Insert sample transactions
INSERT INTO transactions (type, land_id, buyer_id, seller_id, amount, status, smart_contract_address, blockchain_tx_hash) VALUES
('sale', 
 (SELECT id FROM land_parcels WHERE title = 'Kigali Residential Plot'),
 (SELECT id FROM users WHERE nida_id = '1198765432109876'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 15000000, 'completed', '0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1',
 '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b3c4d'),

('purchase',
 (SELECT id FROM land_parcels WHERE title = 'Nyagatare Agricultural Land'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 (SELECT id FROM users WHERE nida_id = '1197654321098765'),
 8000000, 'pending', '0x853e46Dd7645D1532936b4c9E5D1D9c4D3f2f2f2',
 '0x6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z1a2b3c4d5e');

-- Insert sample disputes
INSERT INTO disputes (title, description, status, land_id, complainant_id, abunzi_id) VALUES
('Boundary Dispute - Kigali Plot 123', 
 'Disagreement about the exact boundaries between my land and neighbor''s property',
 'in_progress',
 (SELECT id FROM land_parcels WHERE title = 'Kigali Residential Plot'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 (SELECT id FROM users WHERE nida_id = '1196543210987654'));

-- Insert sample dispute messages
INSERT INTO dispute_messages (dispute_id, sender_id, message, message_type) VALUES
((SELECT id FROM disputes WHERE title LIKE 'Boundary Dispute%'),
 (SELECT id FROM users WHERE nida_id = '1199780123456789'),
 'I need help resolving a boundary dispute with my neighbor. The fence seems to be placed incorrectly.',
 'text'),

((SELECT id FROM disputes WHERE title LIKE 'Boundary Dispute%'),
 (SELECT id FROM users WHERE nida_id = '1196543210987654'),
 'I have reviewed your case. Let''s schedule a site visit to examine the boundaries. Please provide the original land documents.',
 'text');

-- Insert sample payments
INSERT INTO payments (user_id, transaction_id, type, amount, status, method, reference) VALUES
((SELECT id FROM users WHERE nida_id = '1199780123456789'),
 NULL, 'land_fee', 25000, 'completed', 'mtn', 'MTN-789456123'),

((SELECT id FROM users WHERE nida_id = '1198765432109876'),
 (SELECT id FROM transactions WHERE type = 'purchase'), 'transaction_fee', 15000, 'pending', 'airtel', 'AIR-456789123');
