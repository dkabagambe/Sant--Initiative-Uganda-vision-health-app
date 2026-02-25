const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function initDB() {
  try {
    console.log('📦 Initializing database...\n');

    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('✓ UUID extension enabled');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
      )
    `;
    console.log('✓ Users table created');

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        power VARCHAR(20),
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'UGX',
        stock_quantity INTEGER DEFAULT 0,
        stock_standard INTEGER DEFAULT 0,
        stock_metal INTEGER DEFAULT 0,
        stock_fashion INTEGER DEFAULT 0,
        category VARCHAR(50) DEFAULT 'reading_glasses',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Products table created');

    // Create screenings table
    await sql`
      CREATE TABLE IF NOT EXISTS screenings (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        client_id UUID,
        health_worker_id UUID REFERENCES users(id),
        client_name VARCHAR(200),
        client_phone VARCHAR(20),
        client_age INTEGER,
        client_gender VARCHAR(20),
        client_village VARCHAR(100),
        client_district VARCHAR(100),
        client_county VARCHAR(100),
        client_sub_county VARCHAR(100),
        client_parish VARCHAR(100),
        distance_vision_left VARCHAR(20),
        distance_vision_right VARCHAR(20),
        distance_vision_both VARCHAR(20),
        near_vision_result VARCHAR(20),
        pinhole_test_left VARCHAR(20),
        pinhole_test_right VARCHAR(20),
        needs_glasses BOOLEAN DEFAULT false,
        needs_referral BOOLEAN DEFAULT false,
        referral_reason TEXT,
        recommended_product_id UUID REFERENCES products(id),
        recommended_power VARCHAR(20),
        selected_frame_type VARCHAR(50),
        notes TEXT,
        screening_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_synced BOOLEAN DEFAULT true,
        offline_id VARCHAR(100)
      )
    `;
    console.log('✓ Screenings table created');

    // Create referrals table
    await sql`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        screening_id UUID REFERENCES screenings(id),
        client_id UUID,
        health_worker_id UUID REFERENCES users(id),
        client_name VARCHAR(200),
        client_phone VARCHAR(20),
        client_age INTEGER,
        client_gender VARCHAR(20),
        client_district VARCHAR(100),
        reason TEXT NOT NULL,
        urgency VARCHAR(20) DEFAULT 'normal',
        facility_name VARCHAR(200),
        facility_location VARCHAR(200),
        status VARCHAR(20) DEFAULT 'pending',
        referred_date DATE DEFAULT CURRENT_DATE,
        completed_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Referrals table created');

    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        screening_id UUID REFERENCES screenings(id),
        product_id UUID REFERENCES products(id),
        client_name VARCHAR(200),
        client_phone VARCHAR(20),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'UGX',
        mobile_money_number VARCHAR(20) NOT NULL,
        transaction_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
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
      )
    `;
    console.log('✓ Payments table created');

    // Create sync_queue table
    await sql`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        operation VARCHAR(20) NOT NULL,
        table_name VARCHAR(50) NOT NULL,
        record_id UUID,
        data JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      )
    `;
    console.log('✓ Sync queue table created');

    // Create vht_stock table (per-VHT inventory)
    await sql`
      CREATE TABLE IF NOT EXISTS vht_stock (
        health_worker_id UUID NOT NULL REFERENCES users(id),
        product_id UUID NOT NULL REFERENCES products(id),
        stock_quantity INTEGER DEFAULT 0,
        stock_standard INTEGER DEFAULT 0,
        stock_metal INTEGER DEFAULT 0,
        stock_fashion INTEGER DEFAULT 0,
        PRIMARY KEY (health_worker_id, product_id)
      )
    `;
    console.log('✓ vht_stock table created');

    // Create clients table
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        health_worker_id UUID REFERENCES users(id),
        full_name VARCHAR(200) NOT NULL,
        phone_number VARCHAR(20),
        age INTEGER,
        gender VARCHAR(20),
        village VARCHAR(100),
        parish VARCHAR(100),
        sub_county VARCHAR(100),
        county VARCHAR(100),
        district VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Clients table created');

    // Insert sample products
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`;
    if (parseInt(existingProducts[0].count) === 0) {
      await sql`
        INSERT INTO products (name, description, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion) VALUES
        ('Reading Glasses +1.00', 'Low power for early presbyopia', '+1.00', 15000.00, 78, 30, 28, 20),
        ('Reading Glasses +1.50', 'For mild difficulty with near vision', '+1.50', 15000.00, 95, 40, 35, 20),
        ('Reading Glasses +2.00', 'Standard reading glasses', '+2.00', 15000.00, 142, 60, 52, 30),
        ('Reading Glasses +2.50', 'For moderate presbyopia', '+2.50', 15000.00, 87, 35, 32, 20),
        ('Reading Glasses +3.00', 'High power for advanced presbyopia', '+3.00', 15000.00, 64, 25, 24, 15),
        ('Reading Glasses +3.50', 'Very high power for severe presbyopia', '+3.50', 18000.00, 42, 18, 14, 10)
      `;
      console.log('✓ Sample products inserted');
    } else {
      console.log('✓ Products already exist, skipping insert');
    }

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_screenings_health_worker_id ON screenings(health_worker_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_screening_id ON payments(screening_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date)`;
    console.log('✓ Indexes created');

    console.log('\n✅ Database initialized successfully!');
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDB();
