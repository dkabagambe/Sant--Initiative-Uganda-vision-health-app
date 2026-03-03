-- Add missing columns to screenings table based on frontend ScreeningData interface
-- Run this in your Neon database console

-- Client location fields
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_county VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_sub_county VARCHAR(100);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_parish VARCHAR(100);

-- Vision test results
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS torch_test_passed BOOLEAN;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS torch_test_abnormal_signs TEXT;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS distance_vision_left VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS distance_vision_right VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS distance_vision_both VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS near_vision_result VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS pinhole_test_left VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS pinhole_test_right VARCHAR(20);

-- Referral details
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS referral_reason TEXT;
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS referral_urgency VARCHAR(50);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS referral_step VARCHAR(50);

-- Product and glasses details
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS recommended_power VARCHAR(20);
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS selected_frame_type VARCHAR(50);

-- Additional notes
ALTER TABLE screenings ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'screenings' 
AND column_name IN (
  'client_county', 'client_sub_county', 'client_parish',
  'torch_test_passed', 'torch_test_abnormal_signs',
  'distance_vision_left', 'distance_vision_right', 'distance_vision_both',
  'near_vision_result', 'pinhole_test_left', 'pinhole_test_right',
  'referral_reason', 'referral_urgency', 'referral_step',
  'recommended_power', 'selected_frame_type', 'notes'
)
ORDER BY column_name;
