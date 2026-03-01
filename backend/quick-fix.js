const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
const sql = neon(dbUrl);

async function quickFix() {
  try {
    console.log('🔧 Quick schema fixes...');
    
    // Fix 1: Add missing client_phone to referrals
    try {
      await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20)`;
      console.log('✓ Added client_phone to referrals');
    } catch (error) {
      console.log('⚠️ client_phone may already exist');
    }
    
    // Fix 2: Update referrals with client_phone from screenings
    try {
      await sql`
        UPDATE referrals r 
        SET client_phone = s.client_phone 
        FROM screenings s 
        WHERE r.screening_id = s.id AND r.client_phone IS NULL
      `;
      console.log('✓ Updated referrals with client_phone');
    } catch (error) {
      console.log('⚠️ Referral update failed:', error.message);
    }
    
    // Test the fixes
    console.log('\n🧪 Testing fixes...');
    
    try {
      const testReferrals = await sql`
        SELECT r.id, r.client_name, r.client_phone, r.reason, r.status
        FROM referrals r
        LIMIT 3
      `;
      console.log('✅ Referrals query works:', testReferrals.length, 'referrals found');
    } catch (error) {
      console.log('❌ Referrals query failed:', error.message);
    }
    
    console.log('\n✅ Quick fixes completed!');
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error.message);
  }
}

quickFix();
