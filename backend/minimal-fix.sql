-- Minimal Schema Fix for Neon Console
-- Copy and paste this into your Neon console

-- Fix 1: Add missing client_phone to referrals table
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);

-- Fix 2: Update existing referrals with client_phone from screenings
UPDATE referrals r 
SET client_phone = s.client_phone 
FROM screenings s 
WHERE r.screening_id = s.id AND r.client_phone IS NULL;

-- Verify the fix
SELECT 'Referrals table structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'referrals' 
ORDER BY ordinal_position;

-- Test the referrals query
SELECT 'Testing referrals query:' as info;
SELECT r.id, r.client_name, r.client_phone, r.reason, r.status
FROM referrals r
LIMIT 3;

SELECT 'Fix completed!' as result;
