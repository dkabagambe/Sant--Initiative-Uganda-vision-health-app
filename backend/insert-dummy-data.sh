#!/bin/bash

# Insert dummy referral data into database
# This script works for both local SQLite and production PostgreSQL

echo "🔧 Inserting dummy referral data..."
echo ""

# Check if we're using Heroku or local
if [ -n "$DATABASE_URL" ]; then
  echo "📡 Using Heroku PostgreSQL database"
  psql $DATABASE_URL < insert-dummy-referrals.sql
else
  echo "💾 Using local SQLite database"
  
  # For SQLite, we need to adapt the SQL
  sqlite3 sante.db <<EOF
-- Insert 3 active referrals
INSERT INTO referrals (
  id, client_name, client_phone, client_age, client_gender,
  reason, urgency, facility_name, facility_location,
  status, referred_date, health_worker_id
) VALUES
(
  lower(hex(randomblob(16))),
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
  lower(hex(randomblob(16))),
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
  lower(hex(randomblob(16))),
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

-- Insert 2 completed referrals (matching design)
INSERT INTO referrals (
  id, client_name, client_phone, client_age, client_gender,
  reason, urgency, facility_name, facility_location,
  status, referred_date, completed_date, outcome, health_worker_id
) VALUES
(
  lower(hex(randomblob(16))),
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
  lower(hex(randomblob(16))),
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

-- Show results
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
EOF
fi

echo ""
echo "✅ Dummy data inserted successfully!"
echo ""
echo "📊 Summary:"
echo "  - 3 Active referrals (2 urgent, 1 normal)"
echo "  - 2 Completed referrals:"
echo "    • Kawooya John - Distance vision loss"
echo "    • Nassali Agnes - Diabetes screening"
echo ""
echo "🎯 Screen will show Completed tab by default!"

