-- Simple table structure check
-- Run this in your Neon console

-- Check screenings columns
SELECT 'SCREENINGS COLUMNS:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'screenings' 
ORDER BY ordinal_position;

-- Check payments columns
SELECT 'PAYMENTS COLUMNS:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- Check if there's any existing data
SELECT 'EXISTING DATA COUNT:' as info;
SELECT 
  (SELECT COUNT(*) FROM screenings) as screenings_count,
  (SELECT COUNT(*) FROM payments) as payments_count,
  (SELECT COUNT(*) FROM referrals) as referrals_count;
