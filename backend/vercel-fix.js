// Vercel deployment fix script
// This addresses common issues when migrating from Render to Vercel

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
const sql = neon(dbUrl);

async function fixVercelIssues() {
  try {
    console.log('🔧 Fixing Vercel deployment issues...\n');
    
    // Issue 1: Check database connection
    console.log('📊 Testing database connection...');
    try {
      const test = await sql`SELECT COUNT(*) as count FROM users`;
      console.log('✅ Database connected:', test[0].count, 'users found');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }
    
    // Issue 2: Check and fix referrals table structure (common referral creation error)
    console.log('\n🏥 Checking referrals table structure...');
    const referralColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'referrals' 
      ORDER BY ordinal_position
    `;
    
    console.log('Referrals table columns:');
    referralColumns.forEach(col => console.log(`  • ${col.column_name} (${col.data_type})`));
    
    // Issue 3: Add missing columns that referrals API expects
    console.log('\n🔧 Adding missing columns to referrals table...');
    
    const requiredColumns = [
      { name: 'client_name', type: 'VARCHAR(200)' },
      { name: 'client_phone', type: 'VARCHAR(20)' },
      { name: 'client_age', type: 'INTEGER' },
      { name: 'client_gender', type: 'VARCHAR(20)' },
      { name: 'client_district', type: 'VARCHAR(100)' },
      { name: 'health_worker_id', type: 'UUID' },
      { name: 'screening_id', type: 'UUID' }
    ];
    
    for (const column of requiredColumns) {
      try {
        await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql(column.type)}`;
        console.log(`✓ Added ${column.name} column`);
      } catch (error) {
        console.log(`⚠️ ${column.name} may already exist`);
      }
    }
    
    // Issue 4: Check and fix screenings table
    console.log('\n👁️ Checking screenings table structure...');
    const screeningColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'screenings' 
      ORDER BY ordinal_position
    `;
    
    console.log('Screenings table columns:');
    screeningColumns.forEach(col => console.log(`  • ${col.column_name} (${col.data_type})`));
    
    // Issue 5: Add missing columns to screenings table
    const screeningRequiredColumns = [
      { name: 'health_worker_id', type: 'UUID' },
      { name: 'client_name', type: 'VARCHAR(200)' },
      { name: 'client_phone', type: 'VARCHAR(20)' },
      { name: 'client_age', type: 'INTEGER' },
      { name: 'client_gender', type: 'VARCHAR(20)' },
      { name: 'district', type: 'VARCHAR(100)' },
      { name: 'village', type: 'VARCHAR(100)' }
    ];
    
    for (const column of screeningRequiredColumns) {
      try {
        await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS ${sql(column.name)} ${sql(column.type)}`;
        console.log(`✓ Added ${column.name} column to screenings`);
      } catch (error) {
        console.log(`⚠️ ${column.name} may already exist in screenings`);
      }
    }
    
    // Issue 6: Populate missing data
    console.log('\n📋 Populating missing data...');
    
    // Update referrals with data from screenings
    const updateResult = await sql`
      UPDATE referrals r 
      SET 
        client_name = COALESCE(r.client_name, s.client_name),
        client_phone = COALESCE(r.client_phone, s.client_phone),
        client_age = COALESCE(r.client_age, s.client_age),
        client_gender = COALESCE(r.client_gender, s.client_gender),
        client_district = COALESCE(r.client_district, s.district),
        health_worker_id = COALESCE(r.health_worker_id, s.health_worker_id)
      FROM screenings s 
      WHERE r.screening_id = s.id AND (
        r.client_name IS NULL OR r.client_phone IS NULL OR 
        r.client_age IS NULL OR r.client_gender IS NULL OR
        r.client_district IS NULL OR r.health_worker_id IS NULL
      )
    `;
    console.log(`✓ Updated ${updateResult.count} referrals with screening data`);
    
    // Issue 7: Test API queries that commonly fail
    console.log('\n🧪 Testing critical API queries...');
    
    try {
      const testReferrals = await sql`
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
      console.log('✅ Referrals query works:', testReferrals.length, 'referrals found');
    } catch (error) {
      console.log('❌ Referrals query failed:', error.message);
    }
    
    try {
      const testScreenings = await sql`
        SELECT id, client_name, client_phone, client_age, client_gender, health_worker_id
        FROM screenings
        LIMIT 3
      `;
      console.log('✅ Screenings query works:', testScreenings.length, 'screenings found');
    } catch (error) {
      console.log('❌ Screenings query failed:', error.message);
    }
    
    // Issue 8: Check data counts
    console.log('\n📊 Final database status:');
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'CHW') as vht_users,
        (SELECT COUNT(*) FROM screenings) as screenings,
        (SELECT COUNT(*) FROM referrals) as referrals,
        (SELECT COUNT(*) FROM payments) as payments,
        (SELECT COUNT(*) FROM products) as products
    `;
    
    console.log('Database summary:');
    Object.entries(stats[0]).forEach(([key, value]) => {
      console.log(`  • ${key}: ${value}`);
    });
    
    console.log('\n🎉 Vercel migration fixes completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your frontend API URL to point to Vercel');
    console.log('2. Test referral creation in the app');
    console.log('3. Verify data is displaying correctly');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
    console.error('Full error:', error);
  }
}

fixVercelIssues();
