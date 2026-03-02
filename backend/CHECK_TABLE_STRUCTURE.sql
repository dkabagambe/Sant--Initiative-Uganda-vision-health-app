-- Check the actual structure of your tables
-- Run this in your Neon console first

-- Check screenings table structure
SELECT 'SCREENINGS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'screenings' 
ORDER BY ordinal_position;

-- Check payments table structure  
SELECT 'PAYMENTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- Check referrals table structure
SELECT 'REFERRALS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'referrals' 
ORDER BY ordinal_position;

-- Show sample data from screenings
SELECT 'SAMPLE SCREENINGS DATA:' as info;
SELECT * FROM screenings LIMIT 1;

-- Show sample data from payments
SELECT 'SAMPLE PAYMENTS DATA:' as info;
SELECT * FROM payments LIMIT 1;
