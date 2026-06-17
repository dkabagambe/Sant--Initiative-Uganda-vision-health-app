-- Update user profile for phone number 0705686573
-- Run this in your Neon database console

UPDATE users 
SET 
  full_name = 'daniel kabagambe',
  first_name = 'daniel',
  last_name = 'kabagambe',
  district = 'Kampala',
  village = 'kikoni',
  updated_at = CURRENT_TIMESTAMP
WHERE phone_number = '0705686573';

-- Verify the update
SELECT id, phone_number, full_name, first_name, last_name, role, village, district, updated_at
FROM users 
WHERE phone_number = '0705686573';
