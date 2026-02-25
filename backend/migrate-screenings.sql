-- Migration script to add missing columns to screenings table
-- This script handles the case where the database exists but is missing some columns

-- Check and add missing columns to screenings table
-- These columns might be missing from older database versions

-- Add client_district if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_district TEXT;

-- Add client_county if it doesn't exist  
ALTER TABLE screenings ADD COLUMN client_county TEXT;

-- Add client_sub_county if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_sub_county TEXT;

-- Add client_parish if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_parish TEXT;

-- Add offline_id if it doesn't exist
ALTER TABLE screenings ADD COLUMN offline_id TEXT;

-- Add is_synced if it doesn't exist
ALTER TABLE screenings ADD COLUMN is_synced INTEGER DEFAULT 1;

-- Add selected_frame_type if it doesn't exist
ALTER TABLE screenings ADD COLUMN selected_frame_type TEXT;

-- Add recommended_power if it doesn't exist
ALTER TABLE screenings ADD COLUMN recommended_power TEXT;

-- Add recommended_product_id if it doesn't exist
ALTER TABLE screenings ADD COLUMN recommended_product_id TEXT;

-- Add referral_reason if it doesn't exist
ALTER TABLE screenings ADD COLUMN referral_reason TEXT;

-- Add notes if it doesn't exist
ALTER TABLE screenings ADD COLUMN notes TEXT;

-- Add pinhole_test_left if it doesn't exist
ALTER TABLE screenings ADD COLUMN pinhole_test_left TEXT;

-- Add pinhole_test_right if it doesn't exist
ALTER TABLE screenings ADD COLUMN pinhole_test_right TEXT;

-- Add near_vision_result if it doesn't exist
ALTER TABLE screenings ADD COLUMN near_vision_result TEXT;

-- Add distance_vision_both if it doesn't exist
ALTER TABLE screenings ADD COLUMN distance_vision_both TEXT;

-- Add distance_vision_right if it doesn't exist
ALTER TABLE screenings ADD COLUMN distance_vision_right TEXT;

-- Add distance_vision_left if it doesn't exist
ALTER TABLE screenings ADD COLUMN distance_vision_left TEXT;

-- Add health_worker_id if it doesn't exist
ALTER TABLE screenings ADD COLUMN health_worker_id TEXT;

-- Add client_village if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_village TEXT;

-- Add client_gender if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_gender TEXT;

-- Add client_age if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_age INTEGER;

-- Add client_phone if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_phone TEXT;

-- Add client_name if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_name TEXT;

-- Add client_id if it doesn't exist
ALTER TABLE screenings ADD COLUMN client_id TEXT;
