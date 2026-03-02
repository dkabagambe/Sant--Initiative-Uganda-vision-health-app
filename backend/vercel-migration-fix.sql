-- Complete Vercel Migration Fix Script
-- Run this in your Neon console to fix all database issues

-- Step 1: Check current database status
SELECT '=== CURRENT DATABASE STATUS ===' as info;
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'CHW') as vht_users,
  (SELECT COUNT(*) FROM screenings) as screenings,
  (SELECT COUNT(*) FROM referrals) as referrals,
  (SELECT COUNT(*) FROM payments) as payments,
  (SELECT COUNT(*) FROM products) as products;

-- Step 2: Fix referrals table structure (common referral creation error)
SELECT '=== FIXING REFERRALS TABLE ===' as info;

-- Add missing columns that referrals API expects
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_name VARCHAR(200);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_age INTEGER;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_gender VARCHAR(20);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_district VARCHAR(100);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS health_worker_id UUID;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS screening_id UUID;

-- Show referrals table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'referrals' 
ORDER BY ordinal_position;

-- Step 3: Fix screenings table structure
SELECT '=== FIXING SCREENINGS TABLE ===' as info;

-- Add missing columns to screenings table
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS health_worker_id UUID;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_name VARCHAR(200);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_age INTEGER;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_gender VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS village VARCHAR(100);

-- Show screenings table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'screenings' 
ORDER BY ordinal_position;

-- Step 4: Populate missing data
SELECT '=== POPULATING MISSING DATA ===' as info;

-- Update referrals with data from screenings
UPDATE referrals r 
SET 
  client_name = COALESCE(r.client_name, s.client_name),
  client_phone = COALESCE(r.client_phone, s.client_phone),
  client_age = COALESCE(r.client_age, s.client_age),
  client_gender = COALESCE(r.client_gender, s.client_gender),
  client_district = COALESCE(r.client_district, s.district),
  health_worker_id = COALESCE(r.health_worker_id, s.health_worker_id)
FROM screenings s 
WHERE r.screening_id = s.id AND (
  r.client_name IS NULL OR r.client_phone IS NULL OR 
  r.client_age IS NULL OR r.client_gender IS NULL OR
  r.client_district IS NULL OR r.health_worker_id IS NULL
);

-- Update screenings with health worker IDs if missing
UPDATE screenings s
SET health_worker_id = u.id
FROM users u
WHERE u.role = 'CHW' AND s.health_worker_id IS NULL;

-- Step 5: Test critical API queries
SELECT '=== TESTING CRITICAL API QUERIES ===' as info;

-- Test referrals query (this was failing before)
SELECT 'Referrals query test:' as test_name;
SELECT 
  r.id, r.screening_id, r.health_worker_id,
  COALESCE(s.client_name, r.client_name) as client_name,
  COALESCE(s.client_phone, r.client_phone) as client_phone,
  COALESCE(s.client_age, r.client_age) as client_age,
  COALESCE(s.client_gender, r.client_gender) as client_gender,
  COALESCE(s.client_district, r.client_district) as client_district
FROM referrals r
LEFT JOIN screenings s ON r.screening_id = s.id
LIMIT 3;

-- Test screenings query
SELECT 'Screenings query test:' as test_name;
SELECT id, client_name, client_phone, client_age, client_gender, health_worker_id
FROM screenings
LIMIT 3;

-- Test users query
SELECT 'Users query test:' as test_name;
SELECT id, phone_number, full_name, first_name, last_name, district, village, role
FROM users
WHERE role = 'CHW'
LIMIT 3;

-- Step 6: Add sample data if tables are empty
SELECT '=== ADDING SAMPLE DATA IF NEEDED ===' as info;

-- Add sample screenings if none exist
INSERT INTO screenings (
  client_name, client_phone, client_age, client_gender, health_worker_id,
  distance_vision_left, distance_vision_right, near_vision_result, needs_glasses, needs_referral,
  screening_date
) 
SELECT 
  'Test Patient', '0781234567', 45, 'Female', u.id,
  '6/6', '6/6', 'N6', false, false,
  CURRENT_DATE
FROM users u 
WHERE u.role = 'CHW' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add sample referral if none exist
INSERT INTO referrals (
  client_name, client_phone, client_age, client_gender, health_worker_id,
  reason, urgency, facility_name, facility_location, referred_date
)
SELECT 
  'Test Referral Patient', '0782345678', 67, 'Male', u.id,
  'Severe vision impairment', 'high', 'Mulago Hospital', 'Kampala', CURRENT_DATE
FROM users u 
WHERE u.role = 'CHW' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Step 7: Final verification
SELECT '=== FINAL VERIFICATION ===' as info;

SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'CHW') as vht_users,
  (SELECT COUNT(*) FROM screenings) as screenings,
  (SELECT COUNT(*) FROM referrals) as referrals,
  (SELECT COUNT(*) FROM payments) as payments,
  (SELECT COUNT(*) FROM products) as products;

SELECT '=== VERCEL MIGRATION FIX COMPLETED! ===' as result;
SELECT 'Your database is now ready for Vercel deployment!' as message;
SELECT 'Update your frontend API URL to point to your Vercel backend' as next_step;
