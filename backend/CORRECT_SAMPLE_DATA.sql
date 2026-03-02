-- Create sample data for testing the app (CORRECTED VERSION)
-- Run this in your Neon console

-- Step 1: Create sample screenings with correct columns
INSERT INTO screenings (
  id, health_worker_id, client_name, client_phone, client_age, client_gender, 
  client_district, client_village, village, district,
  distance_vision_left, distance_vision_right, distance_vision_both,
  near_vision_result, pinhole_test_left, pinhole_test_right,
  needs_glasses, needs_referral, referral_reason, recommended_product_id,
  recommended_power, selected_frame_type, notes, screening_date, created_at,
  is_synced, offline_id
) 
SELECT 
  gen_random_uuid(),
  u.id,
  'John Smith',
  '0781234567',
  45,
  'Male',
  'Kampala',
  'Bwaise',
  'Bwaise',
  'Kampala',
  '6/6',
  '6/6',
  '6/6',
  'N6',
  '6/6',
  '6/6',
  true,
  true,
  'Vision impairment',
  (SELECT id FROM products WHERE power = '+1.50' LIMIT 1),
  '+1.50',
  'standard',
  'Client needs reading glasses for presbyopia',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_TIMESTAMP,
  true,
  gen_random_uuid()::text
FROM users u 
WHERE u.role = 'CHW' 
LIMIT 3;

-- Step 2: Create more screenings with different data
INSERT INTO screenings (
  id, health_worker_id, client_name, client_phone, client_age, client_gender, 
  client_district, client_village, village, district,
  distance_vision_left, distance_vision_right, distance_vision_both,
  near_vision_result, pinhole_test_left, pinhole_test_right,
  needs_glasses, needs_referral, referral_reason, recommended_product_id,
  recommended_power, selected_frame_type, notes, screening_date, created_at,
  is_synced, offline_id
) 
SELECT 
  gen_random_uuid(),
  u.id,
  'Mary Johnson',
  '0787654321',
  35,
  'Female',
  'Wakiso',
  'Entebbe',
  'Entebbe',
  'Wakiso',
  '6/6',
  '6/6',
  '6/6',
  'N6',
  '6/6',
  '6/6',
  false,
  false,
  NULL,
  NULL,
  NULL,
  NULL,
  'Normal vision, no glasses needed',
  CURRENT_DATE - INTERVAL '2 days',
  CURRENT_TIMESTAMP,
  true,
  gen_random_uuid()::text
FROM users u 
WHERE u.role = 'CHW' 
LIMIT 2;

-- Step 3: Create sample payments
INSERT INTO payments (
  id, screening_id, product_id, client_name, client_phone, amount, currency,
  mobile_money_number, transaction_id, status, payment_method, payment_type,
  installment_number, total_installments, due_date, payment_date, created_at,
  is_synced, offline_id
)
SELECT 
  gen_random_uuid(),
  s.id,
  s.recommended_product_id,
  s.client_name,
  s.client_phone,
  15000,
  'UGX',
  '0781234567',
  'TXN' || gen_random_uuid()::text,
  'completed',
  'cash',
  'full',
  1,
  1,
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_TIMESTAMP,
  true,
  gen_random_uuid()::text
FROM screenings s 
WHERE s.client_phone = '0781234567' AND s.needs_glasses = true
LIMIT 2;

-- Step 4: Create pending payments
INSERT INTO payments (
  id, screening_id, product_id, client_name, client_phone, amount, currency,
  mobile_money_number, transaction_id, status, payment_method, payment_type,
  installment_number, total_installments, due_date, payment_date, created_at,
  is_synced, offline_id
)
SELECT 
  gen_random_uuid(),
  s.id,
  s.recommended_product_id,
  s.client_name,
  s.client_phone,
  18000,
  'UGX',
  '0787654321',
  'TXN' || gen_random_uuid()::text,
  'pending',
  'mobile_money',
  'installment',
  1,
  3,
  CURRENT_DATE + INTERVAL '3 days',
  NULL,
  CURRENT_TIMESTAMP,
  true,
  gen_random_uuid()::text
FROM screenings s 
WHERE s.client_phone = '0787654321' AND s.needs_glasses = true
LIMIT 1;

-- Step 5: Show results
SELECT 'SAMPLE DATA CREATED:' as info;
SELECT 
  (SELECT COUNT(*) FROM screenings) as total_screenings,
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT COUNT(*) FROM screenings WHERE needs_glasses = true) as needs_glasses,
  (SELECT COUNT(*) FROM payments WHERE status = 'completed') as completed_payments,
  (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments;

SELECT 'READY FOR TESTING!' as result;
