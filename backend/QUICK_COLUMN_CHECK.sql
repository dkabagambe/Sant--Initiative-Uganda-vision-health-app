-- Quick column check - run this in Neon console

-- Screenings table columns
SELECT 'SCREENINGS:' as info, column_name as column, data_type as type
FROM information_schema.columns 
WHERE table_name = 'screenings' 
ORDER BY ordinal_position;

-- Payments table columns  
SELECT 'PAYMENTS:' as info, column_name as column, data_type as type
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;
