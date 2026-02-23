-- Enable UUID extension for secure IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (CHW, VSLA, Outlet)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    gender VARCHAR(20),
    national_id VARCHAR(50),
    date_of_birth DATE,
    role VARCHAR(50) DEFAULT 'health_worker', -- health_worker, vsla, outlet
    village VARCHAR(100),
    parish VARCHAR(100),
    sub_county VARCHAR(100),
    district VARCHAR(100),
    region VARCHAR(50),
    organization_name VARCHAR(200),
    registration_number VARCHAR(100),
    years_of_experience INTEGER,
    training_certificate VARCHAR(200),
    business_name VARCHAR(200),
    business_type VARCHAR(100),
    tin_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMP
);

-- Clients table (People screened)
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    health_worker_id UUID REFERENCES users(id),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    age INTEGER,
    gender VARCHAR(10),
    village VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (Reading glasses with frame types)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    power VARCHAR(20), -- e.g., +1.00, +1.50, +2.00
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UGX',
    stock_quantity INTEGER DEFAULT 0,
    stock_standard INTEGER DEFAULT 0,
    stock_metal INTEGER DEFAULT 0,
    stock_fashion INTEGER DEFAULT 0,
    category VARCHAR(50) DEFAULT 'reading_glasses',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Screenings table (Vision tests with full workflow)
CREATE TABLE IF NOT EXISTS screenings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    health_worker_id UUID REFERENCES users(id),
    
    -- Step 1: Client Info
    client_name VARCHAR(200),
    client_phone VARCHAR(20),
    client_age INTEGER,
    client_gender VARCHAR(20),
    client_village VARCHAR(100),
    
    -- Step 2-5: Vision Tests
    distance_vision_left VARCHAR(20),
    distance_vision_right VARCHAR(20),
    distance_vision_both VARCHAR(20),
    near_vision_result VARCHAR(20),
    pinhole_test_left VARCHAR(20),
    pinhole_test_right VARCHAR(20),
    
    -- Step 6: Results
    needs_glasses BOOLEAN DEFAULT false,
    needs_referral BOOLEAN DEFAULT false,
    referral_reason TEXT,
    recommended_product_id UUID REFERENCES products(id),
    recommended_power VARCHAR(20),
    selected_frame_type VARCHAR(50), -- standard, metal, fashion
    
    notes TEXT,
    screening_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_synced BOOLEAN DEFAULT true,
    offline_id VARCHAR(100)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    screening_id UUID REFERENCES screenings(id),
    client_id UUID REFERENCES clients(id),
    health_worker_id UUID REFERENCES users(id),
    client_name VARCHAR(200),
    client_phone VARCHAR(20),
    client_age INTEGER,
    client_gender VARCHAR(20),
    client_district VARCHAR(100),
    reason TEXT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'normal', -- urgent, normal, routine
    facility_name VARCHAR(200),
    facility_location VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
    referred_date DATE DEFAULT CURRENT_DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (Mobile money with installments)
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    screening_id UUID REFERENCES screenings(id),
    product_id UUID REFERENCES products(id),
    client_name VARCHAR(200),
    client_phone VARCHAR(20),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UGX',
    mobile_money_number VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100), -- From mobile money provider
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, overdue
    payment_method VARCHAR(50) DEFAULT 'mobile_money', -- mobile_money, cash, installment
    payment_type VARCHAR(50) DEFAULT 'full', -- full, installment
    installment_number INTEGER,
    total_installments INTEGER,
    due_date DATE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_synced BOOLEAN DEFAULT true,
    offline_id VARCHAR(100)
);

-- Sync queue for offline data
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    operation VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Insert sample reading glasses products with frame breakdown
INSERT INTO products (name, description, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion) VALUES
('Reading Glasses +1.00', 'Low power for early presbyopia', '+1.00', 15000.00, 78, 30, 28, 20),
('Reading Glasses +1.50', 'For mild difficulty with near vision', '+1.50', 15000.00, 95, 40, 35, 20),
('Reading Glasses +2.00', 'Standard reading glasses', '+2.00', 15000.00, 142, 60, 52, 30),
('Reading Glasses +2.50', 'For moderate presbyopia', '+2.50', 15000.00, 87, 35, 32, 20),
('Reading Glasses +3.00', 'High power for advanced presbyopia', '+3.00', 15000.00, 64, 25, 24, 15),
('Reading Glasses +3.50', 'Very high power for severe presbyopia', '+3.50', 18000.00, 42, 18, 14, 10)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_screenings_client_id ON screenings(client_id);
CREATE INDEX IF NOT EXISTS idx_screenings_health_worker_id ON screenings(health_worker_id);
CREATE INDEX IF NOT EXISTS idx_payments_screening_id ON payments(screening_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone_number);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for screening reports
CREATE OR REPLACE VIEW screening_reports AS
SELECT 
    s.id,
    s.screening_date,
    s.client_name,
    s.client_phone,
    s.client_age,
    s.client_village,
    u.full_name as health_worker_name,
    u.phone_number as health_worker_phone,
    p.name as recommended_product,
    p.power as recommended_power,
    s.selected_frame_type,
    s.distance_vision_left,
    s.distance_vision_right,
    s.near_vision_result,
    s.needs_glasses,
    s.needs_referral,
    py.amount as payment_amount,
    py.status as payment_status,
    py.payment_method
FROM screenings s
LEFT JOIN users u ON s.health_worker_id = u.id
LEFT JOIN products p ON s.recommended_product_id = p.id
LEFT JOIN payments py ON s.id = py.screening_id;

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    u.id as health_worker_id,
    u.full_name as health_worker_name,
    COUNT(DISTINCT s.id) as total_screenings,
    COUNT(DISTINCT CASE WHEN s.screening_date >= CURRENT_DATE - INTERVAL '7 days' THEN s.id END) as screenings_this_week,
    COUNT(DISTINCT CASE WHEN s.screening_date >= CURRENT_DATE - INTERVAL '30 days' THEN s.id END) as screenings_this_month,
    COUNT(DISTINCT CASE WHEN s.needs_glasses = true THEN s.id END) as clients_needing_glasses,
    COUNT(DISTINCT CASE WHEN s.needs_referral = true THEN s.id END) as clients_referred,
    COALESCE(SUM(py.amount), 0) as total_revenue,
    COUNT(DISTINCT CASE WHEN py.status = 'completed' THEN py.id END) as completed_payments,
    COUNT(DISTINCT CASE WHEN py.status = 'pending' THEN py.id END) as pending_payments
FROM users u
LEFT JOIN screenings s ON u.id = s.health_worker_id
LEFT JOIN payments py ON s.id = py.screening_id
WHERE u.role = 'health_worker'
GROUP BY u.id, u.full_name;

-- Grant necessary permissions (if using separate user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sante_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sante_user;

COMMENT ON DATABASE sante-db IS 'Santé Initiative Uganda Vision Health App Database';