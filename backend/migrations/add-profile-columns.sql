-- Add missing profile columns to users table
-- Safe to re-run (IF NOT EXISTS / DO NOTHING)
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS county         VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sub_county     VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS parish         VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender         VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS age            INTEGER;
