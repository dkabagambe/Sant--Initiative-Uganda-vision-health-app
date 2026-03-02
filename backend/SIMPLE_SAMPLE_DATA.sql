-- Simple sample data creation - run this step by step
-- Run this in your Neon console

-- Step 1: Create one screening first
INSERT INTO screenings (
  id, health_worker_id, client_name, client_phone, client_age, client_gender, 
  client_district, village, district,
  distance_vision_left, distance_vision_right, distance_vision_both,
  near_vision_result, needs_glasses, needs_referral, referral_reason,
  recommended_power, selected_frame_type, notes, screening_date, created_at,
  is_synced
) 
VALUES (
  gen_random_uuid(),
  (SELECT id FROM users WHERE role = 'CHW' LIMIT 1),
  'John Smith',
  '0781234567',
  45,
  'Male',
  'Kampala',
  'Bwaise',
  'Kampala',
  '6/6',
  '6/6', 
  '6/6',
  'N6',
  true,
  true,
  'Vision impairment',
  '+1.50',
  'standard',
  'Client needs reading glasses',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_TIMESTAMP,
  true
);

-- Step 2: Create another screening
INSERT INTO screenings (
  id, health_worker_id, client_name, client_phone, client_age, client_gender, 
  client_district, village, district,
  distance_vision_left, distance_vision_right, distance_vision_both,
  near_vision_result, needs_glasses, needs_referral,
  recommended_power, selected_frame_type, notes, screening_date, created_at,
  is_synced
) 
VALUES (
  gen_random_uuid(),
  (SELECT id FROM users WHERE role = 'CHW' LIMIT 1),
  'Mary Johnson',
  '0787654321',
  35,
  'Female',
  'Wakiso',
  'Entebbe',
  'Wakiso',
  '6/6',
  '6/6', 
  '6/6',
  'N6',
  false,
  false,
  NULL,
  NULL,
  NULL,
  'Normal vision',
  CURRENT_DATE - INTERVAL '2 days',
  CURRENT_TIMESTAMP,
  true
);

-- Step 3: Check if screenings were created
SELECT 'SCREENINGS CREATED:' as info;
SELECT COUNT(*) as count FROM screenings;

-- Step 4: Create a payment
INSERT INTO payments (
  id, screening_id, client_name, client_phone, amount, currency,
  status, payment_method, payment_type, due_date, payment_date, created_at,
  is_synced
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM screenings WHERE client_phone = '0781234567' LIMIT 1),
  'John Smith',
  '0781234567',
  15000,
  'UGX',
  'completed',
  'cash',
  'full',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_TIMESTAMP,
  true
);

-- Step 5: Check results
SELECT 'FINAL RESULTS:' as info;
SELECT 
  (SELECT COUNT(*) FROM screenings) as total_screenings,
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT COUNT(*) FROM screenings WHERE needs_glasses = true) as needs_glasses,
  (SELECT COUNT(*) FROM payments WHERE status = 'completed') as completed_payments;

SELECT 'SAMPLE DATA READY!' as result;
