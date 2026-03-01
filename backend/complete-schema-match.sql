-- Complete Database Schema Alignment for Frontend Compatibility
-- Copy and paste this entire script into your Neon SQL Editor

-- Step 1: Check current table structures
SELECT '=== CHECKING CURRENT TABLE STRUCTURES ===' as info;

-- Users table structure (frontend expects: id, phone_number, full_name, first_name, last_name, district, village, role)
SELECT 'USERS TABLE:' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Screenings table structure (frontend expects: id, client_name, client_phone, client_age, client_gender, district, village, health_worker_id, etc.)
SELECT 'SCREENINGS TABLE:' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'screenings' 
ORDER BY ordinal_position;

-- Referrals table structure (frontend expects: id, client_name, client_phone, client_age, client_gender, client_district, health_worker_id, etc.)
SELECT 'REFERRALS TABLE:' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'referrals' 
ORDER BY ordinal_position;

-- Payments table structure (frontend expects: id, client_name, client_phone, amount, status, etc.)
SELECT 'PAYMENTS TABLE:' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- Products table structure (frontend expects: id, name, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion)
SELECT 'PRODUCTS TABLE:' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Step 2: Add any missing columns to match frontend expectations
SELECT '=== ADDING MISSING COLUMNS ===' as info;

-- Ensure users table has all required columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS village VARCHAR(100);

-- Ensure referrals table has all required columns
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_name VARCHAR(200);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_age INTEGER;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_gender VARCHAR(20);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_district VARCHAR(100);

-- Ensure products table has stock breakdown columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_standard INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_metal INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_fashion INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'UGX';

-- Step 3: Update existing data to populate new columns
SELECT '=== POPULATING NEW COLUMNS ===' as info;

-- Update users with proper names if missing
UPDATE users SET 
  first_name = COALESCE(first_name, SPLIT_PART(full_name, ' ', 1)),
  last_name = COALESCE(last_name, 
    CASE 
      WHEN POSITION(' ' IN full_name) > 0 
      THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
      ELSE ''
    END
  )
WHERE first_name IS NULL OR last_name IS NULL;

-- Update referrals with data from screenings if missing
UPDATE referrals r 
SET 
  client_name = COALESCE(r.client_name, s.client_name),
  client_phone = COALESCE(r.client_phone, s.client_phone),
  client_age = COALESCE(r.client_age, s.client_age),
  client_gender = COALESCE(r.client_gender, s.client_gender),
  client_district = COALESCE(r.client_district, s.district)
FROM screenings s 
WHERE r.screening_id = s.id AND (
  r.client_name IS NULL OR r.client_phone IS NULL OR r.client_age IS NULL OR 
  r.client_gender IS NULL OR r.client_district IS NULL
);

-- Step 4: Verify data consistency
SELECT '=== VERIFYING DATA CONSISTENCY ===' as info;

-- Check users data
SELECT 'USERS DATA SAMPLE:' as info;
SELECT id, phone_number, full_name, first_name, last_name, district, village, role
FROM users 
WHERE role = 'CHW'
LIMIT 3;

-- Check referrals data
SELECT 'REFERRALS DATA SAMPLE:' as info;
SELECT id, client_name, client_phone, client_age, client_gender, client_district, status
FROM referrals
LIMIT 3;

-- Check products data
SELECT 'PRODUCTS DATA SAMPLE:' as info;
SELECT id, name, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion, currency
FROM products
LIMIT 3;

-- Step 5: Test the queries that frontend uses
SELECT '=== TESTING FRONTEND QUERIES ===' as info;

-- Test referrals query (this was failing before)
SELECT 'REFERRALS QUERY TEST:' as info;
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

SELECT '=== SCHEMA ALIGNMENT COMPLETED! ===' as result;
SELECT 'Database now matches frontend expectations!' as message;
