-- Fix: Add columns that screeningController INSERT references but were missing
-- from the live Neon DB, causing every createScreening call to crash with a 500.
-- Applied directly to production DB on 2026-09-15.
-- Safe to re-run (IF NOT EXISTS).

ALTER TABLE screenings ADD COLUMN IF NOT EXISTS distance_vision_result VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS near_vision_passed BOOLEAN;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS key_questions_passed BOOLEAN;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS key_questions_referral_reasons TEXT;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS referral_urgency VARCHAR(20) DEFAULT 'normal';
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS referral_step VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
