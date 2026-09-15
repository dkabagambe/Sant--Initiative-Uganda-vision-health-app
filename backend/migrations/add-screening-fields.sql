-- Migration: Add missing screening fields to match MOH 8-step protocol
-- Run this against your Neon/Postgres database
-- Safe to run multiple times (uses IF NOT EXISTS)

ALTER TABLE screenings ADD COLUMN IF NOT EXISTS torch_test_passed BOOLEAN;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS torch_test_abnormal_signs TEXT;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS key_questions_passed BOOLEAN;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS key_questions_referral_reasons TEXT;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS distance_vision_result VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS near_vision_passed BOOLEAN;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS glasses_dispensed BOOLEAN DEFAULT false;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS glasses_power VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS glasses_frame_type VARCHAR(50);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS referral_urgency VARCHAR(20) DEFAULT 'normal';
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS referral_step VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS county VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS sub_county VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS parish VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS household_id VARCHAR(100);

-- Add updated_at column if missing
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create/update the screening_reports view to include new fields
CREATE OR REPLACE VIEW screening_reports AS
SELECT
  s.id,
  s.client_name,
  s.client_age,
  s.client_gender,
  s.client_phone,
  s.client_village,
  s.district,
  s.county,
  s.sub_county,
  s.parish,
  s.household_id,
  s.key_questions_passed,
  s.key_questions_referral_reasons,
  s.torch_test_passed,
  s.torch_test_abnormal_signs,
  s.distance_vision_right,
  s.distance_vision_left,
  s.distance_vision_result,
  s.near_vision_result,
  s.near_vision_passed,
  s.needs_glasses,
  s.glasses_dispensed,
  s.glasses_power,
  s.glasses_frame_type,
  s.needs_referral,
  s.referral_reason,
  s.referral_urgency,
  s.referral_step,
  s.recommended_power,
  s.notes,
  s.screening_date,
  s.created_at,
  u.full_name AS health_worker_name,
  u.phone_number AS health_worker_phone,
  u.district AS health_worker_district
FROM screenings s
LEFT JOIN users u ON s.health_worker_id = u.id;
