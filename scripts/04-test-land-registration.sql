-- Test script to verify land registration workflow
-- This script tests the complete land registration and approval process

-- First, let's check if we have test users
SELECT 'Checking existing users...' as status;
SELECT id, full_name, email, nida_id FROM public.users LIMIT 5;

-- Insert a test user if none exist
INSERT INTO public.users (full_name, email, nida_id, phone, role, is_verified)
VALUES ('Test User', 'test@example.com', '1234567890123456', '+250788123456', 'user', true)
ON CONFLICT (email) DO NOTHING;

-- Get the test user ID
SELECT 'Test user created/found:' as status;
SELECT id, full_name, email FROM public.users WHERE email = 'test@example.com';

-- Test land creation (this simulates what the API does)
SELECT 'Testing land creation...' as status;

-- Insert a test land record
INSERT INTO land_management.lands (
  owner_id, title, description, location_address, 
  latitude, longitude, area_size, price, status
)
VALUES (
  (SELECT id::text FROM public.users WHERE email = 'test@example.com' LIMIT 1),
  'Test Land Parcel',
  'A test land parcel for registration testing',
  'Kigali, Rwanda - Test Location',
  -1.9441,
  30.0619,
  1000.50,
  5000000,
  'pending'
) ON CONFLICT DO NOTHING
RETURNING id, title, owner_id, status;

-- Check if land was created successfully
SELECT 'Verifying land creation...' as status;
SELECT l.id, l.title, l.owner_id, l.status, u.full_name as owner_name
FROM land_management.lands l
LEFT JOIN public.users u ON l.owner_id::integer = u.id
WHERE l.title = 'Test Land Parcel';

-- Test admin notification creation
SELECT 'Testing admin notification...' as status;
INSERT INTO land_management.admin_notifications (
  type, title, message, related_land_id
)
VALUES (
  'land_registration',
  'Test Land Registration',
  'Test land registration notification',
  (SELECT id FROM land_management.lands WHERE title = 'Test Land Parcel' LIMIT 1)
) ON CONFLICT DO NOTHING
RETURNING id, type, title, message;

-- Test land approval process
SELECT 'Testing land approval...' as status;
UPDATE land_management.lands 
SET status = 'approved', 
    approved_by = 'admin-test', 
    approved_at = NOW(),
    blockchain_hash = 'BLK_TEST_' || extract(epoch from now())::text,
    qr_code_data = 'LAND_TEST_' || extract(epoch from now())::text
WHERE title = 'Test Land Parcel'
RETURNING id, title, status, blockchain_hash, qr_code_data;

-- Final verification
SELECT 'Final verification - Complete land record:' as status;
SELECT l.*, u.full_name as owner_name
FROM land_management.lands l
LEFT JOIN public.users u ON l.owner_id::integer = u.id
WHERE l.title = 'Test Land Parcel';

-- Check admin notifications
SELECT 'Admin notifications:' as status;
SELECT id, type, title, message, is_read, created_at
FROM land_management.admin_notifications
WHERE related_land_id = (SELECT id FROM land_management.lands WHERE title = 'Test Land Parcel' LIMIT 1);

-- Summary
SELECT 'TEST SUMMARY:' as status;
SELECT 
  'Users: ' || COUNT(*) as user_count
FROM public.users
UNION ALL
SELECT 
  'Lands: ' || COUNT(*) as land_count
FROM land_management.lands
UNION ALL
SELECT 
  'Notifications: ' || COUNT(*) as notification_count
FROM land_management.admin_notifications;

SELECT 'Land registration test completed successfully!' as final_status;
