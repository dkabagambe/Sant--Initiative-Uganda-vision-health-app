
-- Copy and paste this entire script into your Neon console

-- First, let's check what's currently in the database
SELECT '=== CURRENT DATABASE STATUS ===' as info;
SELECT current_database() as database_name;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check existing data
SELECT '=== EXISTING DATA COUNTS ===' as info;
SELECT 'Users (CHW):' as table_name, COUNT(*) as count FROM users WHERE role = 'CHW'
UNION ALL
SELECT 'Screenings:' as table_name, COUNT(*) as count FROM screenings
UNION ALL  
SELECT 'Referrals:' as table_name, COUNT(*) as count FROM referrals
UNION ALL
SELECT 'Payments:' as table_name, COUNT(*) as count FROM payments
UNION ALL
SELECT 'Products:' as table_name, COUNT(*) as count FROM products;

-- Add sample screenings
SELECT '=== ADDING SAMPLE SCREENINGS ===' as info;

INSERT INTO screenings (
  client_name, client_phone, client_age, client_gender, health_worker_id,
  distance_vision_left, distance_vision_right, near_vision_result, needs_glasses, needs_referral,
  referral_reason, recommended_power, screening_date
) VALUES 
  ('Aisha Nantume', '0781234567', 45, 'Female', 'f396ba90-2feb-489b-9bfc-64a3268dbf7f', '6/6', '6/6', 'N6', false, false, null, null, '2026-02-15'),
  ('Peter Okello', '0782345678', 38, 'Male', 'f396ba90-2feb-489b-9bfc-64a3268dbf7f', '6/12', '6/12', 'N8', true, false, null, '+1.50', '2026-02-16'),
  ('Mariam Babirye', '0783456789', 52, 'Female', '2a3405dc-35e1-4cc2-a152-fd41b08e8b8b', '6/18', '6/18', 'N10', true, false, null, '+2.00', '2026-02-17'),
  ('John Ssenyonjo', '0784567890', 67, 'Male', '8ca20913-4720-44c2-91d0-cbc257256a37', '6/60', '6/60', 'N12', true, true, 'Severe vision impairment - cataract suspected', null, '2026-02-18'),
  ('Grace Nakigozi', '0785678901', 41, 'Female', '8ca20913-4720-44c2-91d0-cbc257256a37', '6/9', '6/9', 'N6', false, false, null, null, '2026-02-19'),
  ('Samuel Waiswa', '0786789012', 29, 'Male', 'f396ba90-2feb-489b-9bfc-64a3268dbf7f', '6/6', '6/6', 'N6', false, false, null, null, '2026-02-20');

SELECT 'Screenings added successfully!' as result;

-- Add sample referrals for patients who need them
SELECT '=== ADDING SAMPLE REFERRALS ===' as info;

INSERT INTO referrals (client_name, client_phone, client_age, client_gender, health_worker_id, reason, urgency, facility_name, facility_location, referred_date)
SELECT client_name, client_phone, client_age, client_gender, health_worker_id, referral_reason, 'high', 'Mulago National Referral Hospital', 'Kampala', screening_date
FROM screenings 
WHERE needs_referral = true;

SELECT 'Referrals added successfully!' as result;

-- Add sample payments
SELECT '=== ADDING SAMPLE PAYMENTS ===' as info;

INSERT INTO payments (client_name, client_phone, amount, mobile_money_number, status)
VALUES 
  ('Peter Okello', '0782345678', 15000, '0782345678', 'completed'),
  ('Mariam Babirye', '0783456789', 15000, '0783456789', 'completed'),
  ('Aisha Nantume', '0781234567', 18000, '0781234567', 'pending'),
  ('John Ssenyonjo', '0784567890', 25000, '0784567890', 'pending');

SELECT 'Payments added successfully!' as result;

-- Update product stock to show some sales activity
SELECT '=== UPDATING PRODUCT STOCK ===' as info;

UPDATE products SET 
  stock_quantity = stock_quantity - CASE 
    WHEN power = '+1.50' THEN 2
    WHEN power = '+2.00' THEN 3
    WHEN power = '+3.50' THEN 1
    ELSE 0
  END;

SELECT 'Product stock updated successfully!' as result;

-- Show final results
SELECT '=== FINAL DATABASE STATUS ===' as info;
SELECT 'Users (CHW):' as table_name, COUNT(*) as count FROM users WHERE role = 'CHW'
UNION ALL
SELECT 'Screenings:' as table_name, COUNT(*) as count FROM screenings
UNION ALL  
SELECT 'Referrals:' as table_name, COUNT(*) as count FROM referrals
UNION ALL
SELECT 'Payments:' as table_name, COUNT(*) as count FROM payments;

-- Show sample data
SELECT '=== SAMPLE DATA PREVIEW ===' as info;
SELECT 'Recent Screenings:' as info;
SELECT client_name, client_age, needs_glasses, needs_referral, screening_date 
FROM screenings 
ORDER BY screening_date DESC 
LIMIT 3;

SELECT 'Recent Payments:' as info;
SELECT client_name, amount, status 
FROM payments 
ORDER BY payment_date DESC 
LIMIT 3;

SELECT 'Updated Product Stock:' as info;
SELECT name, power, stock_quantity 
FROM products 
ORDER BY power;

SELECT '=== DATA SEEDING COMPLETED! ===' as info;
SELECT 'Your app should now show data!' as message;
