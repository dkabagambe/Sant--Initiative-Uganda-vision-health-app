-- Enable UUID extension for secure IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Community Health Workers)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'health_worker',
    village VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
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

-- Products table (Reading glasses)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    power VARCHAR(20), -- e.g., +1.00, +1.50, +2.00
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UGX',
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(50) DEFAULT 'reading_glasses',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Screenings table (Vision tests)
CREATE TABLE IF NOT EXISTS screenings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    health_worker_id UUID REFERENCES users(id),
    visual_acuity_left VARCHAR(10), -- e.g., 20/20, 20/40
    visual_acuity_right VARCHAR(10),
    recommended_product_id UUID REFERENCES products(id),
    notes TEXT,
    screening_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_synced BOOLEAN DEFAULT true,
    offline_id VARCHAR(100) -- For offline data sync tracking
);

-- Payments table (Mobile money transactions)
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    screening_id UUID REFERENCES screenings(id),
    product_id UUID REFERENCES products(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UGX',
    mobile_money_number VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE, -- From mobile money provider
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    payment_method VARCHAR(50) DEFAULT 'mobile_money',
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

-- Insert sample reading glasses products
INSERT INTO products (name, description, power, price, stock_quantity) VALUES
('Reading Glasses +1.00', 'Low power for early presbyopia', '+1.00', 15000.00, 50),
('Reading Glasses +1.50', 'For mild difficulty with near vision', '+1.50', 15000.00, 50),
('Reading Glasses +2.00', 'Standard reading glasses', '+2.00', 15000.00, 50),
('Reading Glasses +2.50', 'For moderate presbyopia', '+2.50', 15000.00, 50),
('Reading Glasses +3.00', 'High power for advanced presbyopia', '+3.00', 15000.00, 50),
('Reading Glasses +3.50', 'Very high power for severe presbyopia', '+3.50', 18000.00, 30)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_screenings_client_id ON screenings(client_id);
CREATE INDEX idx_screenings_health_worker_id ON screenings(health_worker_id);
CREATE INDEX idx_payments_screening_id ON payments(screening_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_clients_phone ON clients(phone_number);

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
    c.full_name as client_name,
    c.village as client_village,
    u.full_name as health_worker_name,
    p.name as recommended_product,
    s.visual_acuity_left,
    s.visual_acuity_right,
    py.amount as payment_amount,
    py.status as payment_status
FROM screenings s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN users u ON s.health_worker_id = u.id
LEFT JOIN products p ON s.recommended_product_id = p.id
LEFT JOIN payments py ON s.id = py.screening_id;

-- Grant necessary permissions (if using separate user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sante_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sante_user;

COMMENT ON DATABASE sante-db IS 'Santé Initiative Uganda Vision Health App Database';