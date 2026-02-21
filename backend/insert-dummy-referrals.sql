-- Insert dummy referral data for testing
-- Run this in your PostgreSQL database

-- Insert 3 active referrals
INSERT INTO referrals (
  id, client_name, client_phone, client_age, client_gender,
  reason, urgency, facility_name, facility_location,
  status, referred_date, health_worker_id
) VALUES
(
  gen_random_uuid(),
  'Nansubuga Sarah',
  '0700111222',
  58,
  'Female',
  'Suspected cataract, vision loss',
  'urgent',
  'Luweero Hospital Eye Clinic',
  'Luweero District',
  'pending',
  '2026-01-12',
  (SELECT id FROM users WHERE role = 'health_worker' LIMIT 1)
),
(
  gen_random_uuid(),
  'Okello David',
  '0700222333',
  62,
  'Male',
  'High blood pressure, diabetes',
  'normal',
  'Bombo Health Center IV',
  'Luweero District',
  'pending',
  '2026-01-10',
  (SELECT id FROM users WHERE role = 'health_worker' LIMIT 1)
),
(
  gen_random_uuid(),
  'Nabirye Joyce',
  '0700333444',
  55,
  'Female',
  'Eye pain and redness',
  'urgent',
  'Luweero Hospital Eye Clinic',
  'Luweero District',
  'pending',
  '2026-01-08',
  (SELECT id FROM users WHERE role = 'health_worker' LIMIT 1)
);

-- Insert 2 completed referrals (matching your design)
INSERT INTO referrals (
  id, client_name, client_phone, client_age, client_gender,
  reason, urgency, facility_name, facility_location,
  status, referred_date, completed_date, outcome, health_worker_id
) VALUES
(
  gen_random_uuid(),
  'Kawooya John',
  '0700444555',
  48,
  'Male',
  'Distance vision loss',
  'normal',
  'Luweero Hospital Eye Clinic',
  'Luweero District',
  'completed',
  '2026-01-05',
  '2026-01-07',
  'Prescribed corrective lenses',
  (SELECT id FROM users WHERE role = 'health_worker' LIMIT 1)
),
(
  gen_random_uuid(),
  'Nassali Agnes',
  '0700555666',
  52,
  'Female',
  'Diabetes screening',
  'normal',
  'Bombo Health Center IV',
  'Luweero District',
  'completed',
  '2026-01-03',
  '2026-01-06',
  'Started on medication',
  (SELECT id FROM users WHERE role = 'health_worker' LIMIT 1)
);

-- Verify the data
SELECT 
  client_name, 
  client_age, 
  client_phone, 
  reason, 
  urgency, 
  facility_name, 
  status,
  referred_date
FROM referrals
ORDER BY referred_date DESC;
