-- Creating test data for the land management system
-- Updated to use exact NIDA credentials specified by user
INSERT INTO users (nida_id, password_hash, full_name, email, phone, role, is_verified) VALUES
('1195432109876543', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Uwimana', 'admin@landmanagement.rw', '+250788123456', 'admin', true),
('1199780123456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean Baptiste Seller', 'seller@gmail.com', '+250788234567', 'user', true),
('1198765432109876', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie Buyer', 'buyer@gmail.com', '+250788345678', 'user', true);

-- Insert land parcels for Jean Baptiste (can sell)
INSERT INTO land_parcels (owner_id, title, description, location, size_hectares, price, status, blockchain_hash, coordinates_lat, coordinates_lng) VALUES
(2, 'Prime Agricultural Land - Kigali', 'Fertile agricultural land perfect for farming, located in Kigali with good road access', 'Kigali, Gasabo District', 2.5, 15000000, 'owned', 'bc_hash_001_kigali_prime', -1.9441, 30.0619),
(2, 'Residential Plot - Nyamirambo', 'Residential plot in developing area of Nyamirambo, suitable for housing development', 'Nyamirambo, Nyarugenge District', 0.8, 8500000, 'owned', 'bc_hash_002_nyamirambo_res', -1.9706, 30.0588),
(2, 'Commercial Land - Kimisagara', 'Strategic commercial land near main road, ideal for business development', 'Kimisagara, Nyarugenge District', 1.2, 12000000, 'for_sale', 'bc_hash_003_kimisagara_comm', -1.9659, 30.0588);

-- Insert land parcels for Marie (can also sell - bidirectional trading)
INSERT INTO land_parcels (owner_id, title, description, location, size_hectares, price, status, blockchain_hash, coordinates_lat, coordinates_lng) VALUES
(3, 'Urban Development Plot - Remera', 'Modern urban plot suitable for residential or commercial development', 'Remera, Gasabo District', 1.0, 10000000, 'owned', 'bc_hash_004_remera_urban', -1.9536, 30.0909),
(3, 'Agricultural Land - Bugesera', 'Large agricultural land with irrigation potential in Bugesera', 'Bugesera District', 5.0, 25000000, 'owned', 'bc_hash_005_bugesera_agri', -2.2017, 30.2812);

-- Insert a sample land sale for testing QR code functionality
INSERT INTO land_sales (land_parcel_id, seller_id, price, qr_code, blockchain_hash, status, expires_at) VALUES
(3, 2, 12000000, 'QR_SALE_001_KIMISAGARA', 'bc_sale_hash_001_kimisagara', 'active', CURRENT_TIMESTAMP + INTERVAL '30 days');

-- Insert sample sale interaction
INSERT INTO sale_interactions (land_sale_id, buyer_id, interaction_type, message, status) VALUES
(1, 3, 'interest', 'I am interested in purchasing this commercial land. Please contact me.', 'pending');

-- Insert admin notification
INSERT INTO admin_notifications (type, title, message, related_id, related_type, is_read) VALUES
('sale_interest', 'New Land Sale Interest', 'Marie Buyer has shown interest in Commercial Land - Kimisagara', 1, 'sale_interaction', false);
