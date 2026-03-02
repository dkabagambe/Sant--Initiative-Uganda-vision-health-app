const express = require('express');
const router = express.Router();

// Emergency fix endpoint - run this to fix database issues
router.post('/fix-database', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    console.log('🚨 Running emergency database fix...');
    
    // Fix referrals table
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_id UUID`;
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_name VARCHAR(200)`;
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20)`;
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_age INTEGER`;
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_gender VARCHAR(20)`;
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_district VARCHAR(100)`;
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS health_worker_id UUID`;
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS screening_id UUID`;
    
    // Fix screenings table
    await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS health_worker_id UUID`;
    await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_name VARCHAR(200)`;
    await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20)`;
    await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_age INTEGER`;
    await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_gender VARCHAR(20)`;
    await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS district VARCHAR(100)`;
    await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS village VARCHAR(100)`;
    await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS client_district VARCHAR(100)`;
    
    // Update missing data
    await sql`
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
    
    // Test the queries
    const healthTest = await sql`SELECT COUNT(*) as count FROM users`;
    const referralsTest = await sql`
      SELECT 
        r.id, r.screening_id, r.health_worker_id,
        COALESCE(s.client_name, r.client_name) as client_name,
        COALESCE(s.client_phone, r.client_phone) as client_phone
      FROM referrals r
      LEFT JOIN screenings s ON r.screening_id = s.id
      LIMIT 3
    `;
    
    // Get stats
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'CHW') as vht_users,
        (SELECT COUNT(*) FROM screenings) as screenings,
        (SELECT COUNT(*) FROM referrals) as referrals,
        (SELECT COUNT(*) FROM payments) as payments,
        (SELECT COUNT(*) FROM products) as products
    `;
    
    res.json({
      success: true,
      message: 'Emergency database fix completed successfully!',
      results: {
        health_check: healthTest[0].count,
        referrals_query: referralsTest.length,
        database_stats: stats[0]
      }
    });
    
  } catch (error) {
    console.error('Emergency fix error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
