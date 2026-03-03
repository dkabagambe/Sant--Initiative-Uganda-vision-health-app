-- Add missing columns to payments table
-- Run this in your Neon database console

-- Add missing columns that frontend expects
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_reference VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_status VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS offline_id VARCHAR(100);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name IN ('provider', 'provider_reference', 'provider_status', 'offline_id')
ORDER BY column_name;
