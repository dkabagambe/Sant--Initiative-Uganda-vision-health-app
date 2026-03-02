-- Create sample data for testing the app
-- Run this in your Neon console

-- Step 1: Create sample screenings
INSERT INTO screenings (
  id, client_name, client_phone, client_age, client_gender, client_district,
  health_worker_id, screening_date, needs_glasses, needs_referral,
  torch_test_result, distance_vision_result, near_vision_result, glasses_power, created_at
) 
SELECT 
  gen_random_uuid(),
  'John Smith',
  '0781234567',
  45,
  'Male',
  'Kampala',
  u.id,
  CURRENT_DATE - INTERVAL '1 day',
  true,
  true,
  'pass',
  'pass',
  'fail',
  '+1.50',
  CURRENT_TIMESTAMP
FROM users u 
WHERE u.role = 'CHW' 
LIMIT 3;

-- Step 2: Create sample payments
INSERT INTO payments (
  id, screening_id, amount, status, due_date, payment_method,
  created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  s.id,
  15000,
  'completed',
  CURRENT_DATE - INTERVAL '1 day',
  'cash',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM screenings s 
WHERE s.client_phone = '0781234567'
LIMIT 2;

-- Step 3: Create more screenings with different data
INSERT INTO screenings (
  id, client_name, client_phone, client_age, client_gender, client_district,
  health_worker_id, screening_date, needs_glasses, needs_referral,
  torch_test_result, distance_vision_result, near_vision_result, glasses_power, created_at
) 
SELECT 
  gen_random_uuid(),
  'Mary Johnson',
  '0787654321',
  35,
  'Female',
  'Wakiso',
  u.id,
  CURRENT_DATE - INTERVAL '2 days',
  false,
  false,
  'pass',
  'pass',
  'pass',
  NULL,
  CURRENT_TIMESTAMP
FROM users u 
WHERE u.role = 'CHW' 
LIMIT 2;

-- Step 4: Create pending payments
INSERT INTO payments (
  id, screening_id, amount, status, due_date, payment_method,
  created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  s.id,
  18000,
  'pending',
  CURRENT_DATE + INTERVAL '3 days',
  'mobile_money',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM screenings s 
WHERE s.client_phone = '0787654321'
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
