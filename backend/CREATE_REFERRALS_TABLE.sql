-- Create referrals table if it doesn't exist
-- Run this in your Neon database console

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_id UUID REFERENCES screenings(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20),
  client_age INTEGER,
  client_gender VARCHAR(10),
  client_village VARCHAR(100),
  client_district VARCHAR(100),
  referral_reason TEXT,
  facility_name VARCHAR(255),
  facility_type VARCHAR(100),
  urgency_level VARCHAR(50) DEFAULT 'routine',
  referral_status VARCHAR(50) DEFAULT 'pending',
  referred_date DATE,
  follow_up_date DATE,
  notes TEXT,
  health_worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_screening_id ON referrals(screening_id);
CREATE INDEX IF NOT EXISTS idx_referrals_health_worker_id ON referrals(health_worker_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(referral_status);
CREATE INDEX IF NOT EXISTS idx_referrals_date ON referrals(referred_date);

-- Verify table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'referrals' 
ORDER BY ordinal_position;
