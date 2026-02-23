-- Initialize PostgreSQL database for Santé Initiative

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(200),
  gender VARCHAR(20),
  national_id VARCHAR(50),
  date_of_birth DATE,
  role VARCHAR(50) DEFAULT 'health_worker',
  village VARCHAR(100),
  parish VARCHAR(100),
  sub_county VARCHAR(100),
  district VARCHAR(100),
  region VARCHAR(100),
  organization_name VARCHAR(200),
  registration_number VARCHAR(100),
  years_of_experience INTEGER,
  training_certificate TEXT,
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

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  power VARCHAR(20),
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'UGX',
  stock_quantity INTEGER DEFAULT 0,
  stock_standard INTEGER DEFAULT 0,
  stock_metal INTEGER DEFAULT 0,
  stock_fashion INTEGER DEFAULT 0,
  category VARCHAR(50) DEFAULT 'reading_glasses',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Screenings table
CREATE TABLE IF NOT EXISTS screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(100),
  client_name VARCHAR(200),
  client_phone VARCHAR(20),
  client_age INTEGER,
  client_gender VARCHAR(20),
  client_village VARCHAR(100),
  health_worker_id UUID,
  distance_vision_left VARCHAR(20),
  distance_vision_right VARCHAR(20),
  distance_vision_both VARCHAR(20),
  near_vision_result VARCHAR(20),
  pinhole_test_left VARCHAR(20),
  pinhole_test_right VARCHAR(20),
  needs_glasses BOOLEAN DEFAULT false,
  needs_referral BOOLEAN DEFAULT false,
  referral_reason TEXT,
  recommended_product_id VARCHAR(50),
  recommended_power VARCHAR(20),
  selected_frame_type VARCHAR(50),
  notes TEXT,
  screening_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_synced BOOLEAN DEFAULT true,
  offline_id VARCHAR(100)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_id UUID,
  product_id VARCHAR(50),
  client_name VARCHAR(200),
  client_phone VARCHAR(20),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'UGX',
  mobile_money_number VARCHAR(20),
  transaction_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'mobile_money',
  payment_type VARCHAR(50) DEFAULT 'full',
  installment_number INTEGER,
  total_installments INTEGER,
  due_date DATE,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_synced BOOLEAN DEFAULT true,
  offline_id VARCHAR(100)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_id UUID,
  client_id VARCHAR(100),
  health_worker_id UUID,
  client_name VARCHAR(200),
  client_phone VARCHAR(20),
  client_age INTEGER,
  client_gender VARCHAR(20),
  client_district VARCHAR(100),
  reason TEXT NOT NULL,
  urgency VARCHAR(20) DEFAULT 'normal',
  facility_name VARCHAR(200),
  facility_location VARCHAR(200),
  status VARCHAR(50) DEFAULT 'pending',
  referred_date DATE DEFAULT CURRENT_DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_worker_id UUID,
  full_name VARCHAR(200) NOT NULL,
  phone_number VARCHAR(20),
  age INTEGER,
  gender VARCHAR(20),
  village VARCHAR(100),
  district VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (id, name, description, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion)
VALUES 
  ('1', 'Reading Glasses +1.00', 'Low power', '+1.00', 15000, 78, 30, 28, 20),
  ('2', 'Reading Glasses +1.50', 'Mild difficulty', '+1.50', 15000, 95, 40, 35, 20),
  ('3', 'Reading Glasses +2.00', 'Standard', '+2.00', 15000, 142, 60, 52, 30),
  ('4', 'Reading Glasses +2.50', 'Moderate', '+2.50', 15000, 87, 35, 32, 20),
  ('5', 'Reading Glasses +3.00', 'High power', '+3.00', 15000, 64, 25, 24, 15),
  ('6', 'Reading Glasses +3.50', 'Very high', '+3.50', 18000, 42, 18, 14, 10)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_screenings_worker ON screenings(health_worker_id);
CREATE INDEX IF NOT EXISTS idx_screenings_date ON screenings(screening_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
