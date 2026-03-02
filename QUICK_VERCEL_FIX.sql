-- QUICK VERCEL FIX - Copy and paste this into your Neon console

-- Fix the exact errors from your Vercel logs
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_district VARCHAR(100);

-- Add other missing columns that might be needed
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_name VARCHAR(200);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_age INTEGER;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_gender VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS health_worker_id UUID;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS village VARCHAR(100);

ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_name VARCHAR(200);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_age INTEGER;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_gender VARCHAR(20);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_district VARCHAR(100);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS health_worker_id UUID;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS screening_id UUID;

-- Update missing data
UPDATE referrals r 
SET 
  client_name = COALESCE(r.client_name, s.client_name),
  client_phone = COALESCE(r.client_phone, s.client_phone),
  client_age = COALESCE(r.client_age, s.client_age),
  client_gender = COALESCE(r.client_gender, s.client_gender),
  client_district = COALESCE(r.client_district, s.district)
FROM screenings s 
WHERE r.screening_id = s.id AND (
  r.client_name IS NULL OR r.client_phone IS NULL OR 
  r.client_age IS NULL OR r.client_gender IS NULL OR r.client_district IS NULL
);

-- Test the queries that were failing
SELECT 'TESTING REFERRALS QUERY (was failing):' as test;
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

-- Show final status
SELECT 'FINAL DATABASE STATUS:' as info;
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'CHW') as vht_users,
  (SELECT COUNT(*) FROM screenings) as screenings,
  (SELECT COUNT(*) FROM referrals) as referrals,
  (SELECT COUNT(*) FROM payments) as payments,
  (SELECT COUNT(*) FROM products) as products;

SELECT 'VERCEL FIX COMPLETED!' as result;
