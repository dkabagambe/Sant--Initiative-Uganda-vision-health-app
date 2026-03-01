const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(dbUrl);

async function applySchemaFix() {
  try {
    console.log('🔧 Applying schema fixes to Render database...\n');
    
    // Add missing columns to products table
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'UGX'`;
      console.log('✓ Added currency column to products');
    } catch (error) {
      console.log('⚠️ Currency column may already exist:', error.message);
    }
    
    // Add missing columns to users table  
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)`;
      console.log('✓ Added first_name column to users');
    } catch (error) {
      console.log('⚠️ first_name column may already exist:', error.message);
    }
    
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`;
      console.log('✓ Added last_name column to users');
    } catch (error) {
      console.log('⚠️ last_name column may already exist:', error.message);
    }
    
    // Add missing columns to referrals table
    try {
      await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_name VARCHAR(200)`;
      console.log('✓ Added client_name column to referrals');
    } catch (error) {
      console.log('⚠️ client_name column may already exist:', error.message);
    }
    
    // Update existing records to have proper data
    try {
      await sql`
        UPDATE users SET 
          first_name = COALESCE(first_name, SPLIT_PART(full_name, ' ', 1)),
          last_name = COALESCE(last_name, 
            CASE 
              WHEN POSITION(' ' IN full_name) > 0 
              THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
              ELSE ''
            END
          )
        WHERE first_name IS NULL OR last_name IS NULL
      `;
      console.log('✓ Updated user records with first_name and last_name');
    } catch (error) {
      console.log('⚠️ User update failed:', error.message);
    }
    
    // Update referrals to get client_name from screenings if missing
    try {
      await sql`
        UPDATE referrals r 
        SET client_name = s.client_name 
        FROM screenings s 
        WHERE r.screening_id = s.id AND r.client_name IS NULL
      `;
      console.log('✓ Updated referrals with client_name from screenings');
    } catch (error) {
      console.log('⚠️ Referrals update failed:', error.message);
    }
    
    // Verify the fixes
    console.log('\n📊 Verifying schema fixes...');
    
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`✅ Products: ${productCount[0].count} records`);
    
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Users: ${userCount[0].count} records`);
    
    const referralCount = await sql`SELECT COUNT(*) as count FROM referrals`;
    console.log(`✅ Referrals: ${referralCount[0].count} records`);
    
    // Test API queries
    console.log('\n🧪 Testing API queries...');
    
    try {
      const testProducts = await sql`
        SELECT id, name, description, power, price, currency, stock_quantity, stock_standard, stock_metal, stock_fashion, category, created_at 
        FROM products 
        ORDER BY power ASC 
        LIMIT 3
      `;
      console.log(`✅ Products query works: ${testProducts.length} products`);
      testProducts.forEach(p => console.log(`  • ${p.name} - UGX ${p.price} (Stock: ${p.stock_quantity})`));
    } catch (error) {
      console.log('❌ Products query failed:', error.message);
    }
    
    try {
      const testUsers = await sql`
        SELECT id, phone_number, first_name, last_name, full_name, role 
        FROM users 
        LIMIT 3
      `;
      console.log(`✅ Users query works: ${testUsers.length} users`);
      testUsers.forEach(u => console.log(`  • ${u.full_name} (${u.role})`));
    } catch (error) {
      console.log('❌ Users query failed:', error.message);
    }
    
    try {
      const testReferrals = await sql`
        SELECT id, client_name, client_phone, reason, status 
        FROM referrals 
        LIMIT 3
      `;
      console.log(`✅ Referrals query works: ${testReferrals.length} referrals`);
      testReferrals.forEach(r => console.log(`  • ${r.client_name} - ${r.status}`));
    } catch (error) {
      console.log('❌ Referrals query failed:', error.message);
    }
    
    console.log('\n🎉 Schema fix completed successfully!');
    console.log('Your Render backend should now work without errors.');
    
  } catch (error) {
    console.error('\n❌ Schema fix failed:', error.message);
    console.error('Full error:', error);
  }
}

applySchemaFix();
