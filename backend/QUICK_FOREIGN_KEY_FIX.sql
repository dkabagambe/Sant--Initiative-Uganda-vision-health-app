-- Fix foreign key constraint errors for referrals
-- Run this in your Neon console

-- Step 1: Check if we have any CHW users
SELECT 'CHECKING CHW USERS:' as info;
SELECT id, phone_number, full_name, role 
FROM users 
WHERE role = 'CHW' 
LIMIT 5;

-- Step 2: If no CHW users, create one
INSERT INTO users (
  id, phone_number, full_name, role, created_at
) 
SELECT 
  gen_random_uuid(), 
  '0700000001', 
  'Test CHW User', 
  'CHW',
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE role = 'CHW'
);

-- Step 3: Get a valid CHW ID for testing
SELECT 'VALID CHW ID FOR TESTING:' as info;
SELECT id, phone_number, full_name 
FROM users 
WHERE role = 'CHW' 
LIMIT 1;

-- Step 4: Test referral creation with valid CHW ID
-- (Copy this ID for your API tests)
SELECT 'READY FOR REFERRAL CREATION!' as result;
