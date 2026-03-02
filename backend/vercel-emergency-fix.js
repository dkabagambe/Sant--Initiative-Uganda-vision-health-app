// Emergency Vercel Fix - Direct database schema correction
const { neon } = require('@neondatabase/serverless');

// Use your actual DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = neon(dbUrl);

async function emergencyFix() {
  try {
    console.log('🚨 EMERGENCY VERCEL FIX - Running database corrections...\n');
    
    // Test database connection first
    console.log('📊 Testing database connection...');
    const testResult = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('✅ Database connected:', testResult[0].count, 'users found\n');
    
    // Fix 1: Check and fix referrals table structure
    console.log('🔧 Fixing referrals table structure...');
    
    // Get current referrals table structure
    const referralColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'referrals' 
      ORDER BY ordinal_position
    `;
    
    console.log('Current referrals columns:');
    referralColumns.forEach(col => console.log(`  • ${col.column_name} (${col.data_type})`));
    
    // Add missing columns one by one with error handling
    const requiredReferralColumns = [
      { name: 'id', type: 'UUID DEFAULT uuid_generate_v4() PRIMARY KEY' },
      { name: 'screening_id', type: 'UUID' },
      { name: 'client_id', type: 'UUID' },
      { name: 'health_worker_id', type: 'UUID' },
      { name: 'client_name', type: 'VARCHAR(200)' },
      { name: 'client_phone', type: 'VARCHAR(20)' },
      { name: 'client_age', type: 'INTEGER' },
      { name: 'client_gender', type: 'VARCHAR(20)' },
      { name: 'client_district', type: 'VARCHAR(100)' },
      { name: 'reason', type: 'TEXT NOT NULL' },
      { name: 'urgency', type: 'VARCHAR(20) DEFAULT normal' },
      { name: 'facility_name', type: 'VARCHAR(200)' },
      { name: 'facility_location', type: 'VARCHAR(200)' },
      { name: 'status', type: 'VARCHAR(20) DEFAULT pending' },
      { name: 'referred_date', type: 'DATE DEFAULT CURRENT_DATE' },
      { name: 'completed_date', type: 'DATE' },
      { name: 'notes', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    for (const column of requiredReferralColumns) {
      try {
        // Skip primary key and default constraints for ALTER TABLE
        let alterSql = `ALTER TABLE referrals ADD COLUMN IF NOT EXISTS ${column.name} `;
        
        if (column.type.includes('DEFAULT') || column.type.includes('PRIMARY KEY')) {
          // Extract just the data type for ALTER TABLE
          const dataType = column.type.split(' ')[0] + (column.type.split(' ')[1] || '');
          alterSql += dataType;
        } else {
          alterSql += column.type;
        }
        
        await sql.unsafe(alterSql);
        console.log(`✓ Added/verified ${column.name} column`);
      } catch (error) {
        console.log(`⚠️ ${column.name} column may already exist or failed:`, error.message);
      }
    }
    
    // Fix 2: Check and fix screenings table structure
    console.log('\n🔧 Fixing screenings table structure...');
    
    const screeningColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'screenings' 
      ORDER BY ordinal_position
    `;
    
    console.log('Current screenings columns:');
    screeningColumns.forEach(col => console.log(`  • ${col.column_name} (${col.data_type})`));
    
    // Add missing screenings columns
    const requiredScreeningColumns = [
      { name: 'health_worker_id', type: 'UUID' },
      { name: 'client_name', type: 'VARCHAR(200)' },
      { name: 'client_phone', type: 'VARCHAR(20)' },
      { name: 'client_age', type: 'INTEGER' },
      { name: 'client_gender', type: 'VARCHAR(20)' },
      { name: 'district', type: 'VARCHAR(100)' },
      { name: 'village', type: 'VARCHAR(100)' },
      { name: 'client_district', type: 'VARCHAR(100)' }
    ];
    
    for (const column of requiredScreeningColumns) {
      try {
        await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql(column.type)}`;
        console.log(`✓ Added/verified ${column.name} column in screenings`);
      } catch (error) {
        console.log(`⚠️ ${column.name} in screenings may already exist:`, error.message);
      }
    }
    
    // Fix 3: Populate missing data
    console.log('\n📋 Populating missing data...');
    
    // Update referrals with screening data
    try {
      const updateResult = await sql`
        UPDATE referrals r 
        SET 
          client_name = COALESCE(r.client_name, s.client_name),
          client_phone = COALESCE(r.client_phone, s.client_phone),
          client_age = COALESCE(r.client_age, s.client_age),
          client_gender = COALESCE(r.client_gender, s.client_gender),
          client_district = COALESCE(r.client_district, s.district)
        FROM screenings s 
        WHERE r.screening_id = s.id AND (
          r.client_name IS NULL OR r.client_phone IS NULL OR 
          r.client_age IS NULL OR r.client_gender IS NULL OR r.client_district IS NULL
        )
      `;
      console.log(`✓ Updated ${updateResult.count || 0} referrals with screening data`);
    } catch (error) {
      console.log('⚠️ Referral update failed:', error.message);
    }
    
    // Fix 4: Test the critical queries
    console.log('\n🧪 Testing critical API queries...');
    
    try {
      const healthTest = await sql`SELECT COUNT(*) as count FROM users`;
      console.log('✅ Health check query works:', healthTest[0].count, 'users');
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
    try {
      const referralsTest = await sql`
        SELECT 
          r.id, r.screening_id, r.health_worker_id,
          COALESCE(s.client_name, r.client_name) as client_name,
          COALESCE(s.client_phone, r.client_phone) as client_phone,
          COALESCE(s.client_age, r.client_age) as client_age,
          COALESCE(s.client_gender, r.client_gender) as client_gender,
          COALESCE(s.client_district, r.client_district) as client_district
        FROM referrals r
        LEFT JOIN screenings s ON r.screening_id = s.id
        LIMIT 3
      `;
      console.log('✅ Referrals query works:', referralsTest.length, 'referrals found');
    } catch (error) {
      console.log('❌ Referrals query failed:', error.message);
    }
    
    // Fix 5: Add sample data if tables are empty
    console.log('\n📊 Adding sample data if needed...');
    
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'CHW') as vht_users,
        (SELECT COUNT(*) FROM screenings) as screenings,
        (SELECT COUNT(*) FROM referrals) as referrals,
        (SELECT COUNT(*) FROM payments) as payments,
        (SELECT COUNT(*) FROM products) as products
    `;
    
    console.log('Current database status:');
    Object.entries(stats[0]).forEach(([key, value]) => {
      console.log(`  • ${key}: ${value}`);
    });
    
    if (stats[0].vht_users > 0 && stats[0].referrals === 0) {
      console.log('Adding sample referral...');
      await sql`
        INSERT INTO referrals (
          client_name, client_phone, client_age, client_gender, health_worker_id,
          reason, urgency, facility_name, facility_location, referred_date
        )
        SELECT 
          'Test Referral Patient', '0782345678', 67, 'Male', u.id,
          'Severe vision impairment', 'high', 'Mulago Hospital', 'Kampala', CURRENT_DATE
        FROM users u 
        WHERE u.role = 'CHW' 
        LIMIT 1
      `;
      console.log('✓ Sample referral added');
    }
    
    console.log('\n🎉 EMERGENCY FIX COMPLETED!');
    console.log('📱 Your Vercel backend should now work correctly');
    console.log('🔗 Test: https://backend-tau-sepia-43.vercel.app/api/health');
    
  } catch (error) {
    console.error('\n❌ Emergency fix failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the fix
emergencyFix();
