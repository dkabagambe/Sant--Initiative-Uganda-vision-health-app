const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
const sql = neon(dbUrl);

async function fixSchema() {
  try {
    console.log('🔧 Fixing database schema...\n');
    
    // Add missing columns to products table
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'UGX'`;
      console.log('✓ Added currency column to products');
    } catch (error) {
      console.log('⚠️ Currency column may already exist');
    }
    
    // Add missing columns to users table
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)`;
      console.log('✓ Added first_name column to users');
    } catch (error) {
      console.log('⚠️ first_name column may already exist');
    }
    
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`;
      console.log('✓ Added last_name column to users');
    } catch (error) {
      console.log('⚠️ last_name column may already exist');
    }
    
    // Fix referrals table - add client_name if missing
    try {
      await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_name VARCHAR(200)`;
      console.log('✓ Added client_name column to referrals');
    } catch (error) {
      console.log('⚠️ client_name column may already exist');
    }
    
    // Check current table structures
    console.log('\n📊 Current table structures:');
    
    const products = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position`;
    console.log('\nProducts table columns:');
    products.forEach(col => console.log(`  • ${col.column_name} (${col.data_type})`));
    
    const users = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
    console.log('\nUsers table columns:');
    users.forEach(col => console.log(`  • ${col.column_name} (${col.data_type})`));
    
    const referrals = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'referrals' ORDER BY ordinal_position`;
    console.log('\nReferrals table columns:');
    referrals.forEach(col => console.log(`  • ${col.column_name} (${col.data_type})`));
    
    // Test queries
    console.log('\n🧪 Testing API queries...');
    
    try {
      const testProducts = await sql`SELECT id, name, description, power, price, currency, stock_quantity, stock_standard, stock_metal, stock_fashion, category, created_at FROM products ORDER BY power ASC LIMIT 3`;
      console.log(`✅ Products query works: ${testProducts.length} products found`);
    } catch (error) {
      console.log('❌ Products query failed:', error.message);
    }
    
    try {
      const testUsers = await sql`SELECT id, phone_number, first_name, last_name, full_name, role FROM users LIMIT 3`;
      console.log(`✅ Users query works: ${testUsers.length} users found`);
    } catch (error) {
      console.log('❌ Users query failed:', error.message);
    }
    
    try {
      const testReferrals = await sql`SELECT id, client_name, client_phone, reason, status FROM referrals LIMIT 3`;
      console.log(`✅ Referrals query works: ${testReferrals.length} referrals found`);
    } catch (error) {
      console.log('❌ Referrals query failed:', error.message);
    }
    
    console.log('\n✅ Schema fix completed!');
    
  } catch (error) {
    console.error('\n❌ Schema fix failed:', error.message);
  }
}

fixSchema();
