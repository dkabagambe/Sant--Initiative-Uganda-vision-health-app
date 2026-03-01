-- Schema Fix Script for Render PostgreSQL
-- Run this in your Render PostgreSQL console

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'UGX';

-- Add missing columns to users table  
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Add missing columns to referrals table
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_name VARCHAR(200);

-- Update existing records to have proper data
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

-- Update referrals to get client_name from screenings if missing
UPDATE referrals r 
SET client_name = s.client_name 
FROM screenings s 
WHERE r.screening_id = s.id AND r.client_name IS NULL;

-- Verify the fixes
SELECT 'Products table structure:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;

SELECT 'Users table structure:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;

SELECT 'Referrals table structure:' as info;  
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'referrals' ORDER BY ordinal_position;

-- Test the API queries
SELECT 'Testing products query:' as info;
SELECT id, name, description, power, price, currency, stock_quantity, stock_standard, stock_metal, stock_fashion, category, created_at FROM products ORDER BY power ASC LIMIT 3;

SELECT 'Testing users query:' as info;
SELECT id, phone_number, first_name, last_name, full_name, role FROM users LIMIT 3;

SELECT 'Testing referrals query:' as info;
SELECT id, client_name, client_phone, reason, status FROM referrals LIMIT 3;
