-- Add missing columns to users table for complete registration
-- Run this in your Neon database console

-- Add gender column
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- Add national_id column  
ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);

-- Add date_of_birth column
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add parish column
ALTER TABLE users ADD COLUMN IF NOT EXISTS parish VARCHAR(100);

-- Add sub_county column
ALTER TABLE users ADD COLUMN IF NOT EXISTS sub_county VARCHAR(100);

-- Add county column
ALTER TABLE users ADD COLUMN IF NOT EXISTS county VARCHAR(100);

-- Add region column
ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- Add organization_name column
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name VARCHAR(200);

-- Add registration_number column
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);

-- Add years_of_experience column
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;

-- Add training_certificate column
ALTER TABLE users ADD COLUMN IF NOT EXISTS training_certificate VARCHAR(500);

-- Add business_name column
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(200);

-- Add business_type column
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_type VARCHAR(100);

-- Add tin_number column
ALTER TABLE users ADD COLUMN IF NOT EXISTS tin_number VARCHAR(50);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('gender', 'national_id', 'date_of_birth', 'parish', 'sub_county', 'county', 'region', 'organization_name', 'registration_number', 'years_of_experience', 'training_certificate', 'business_name', 'business_type', 'tin_number')
ORDER BY column_name;
