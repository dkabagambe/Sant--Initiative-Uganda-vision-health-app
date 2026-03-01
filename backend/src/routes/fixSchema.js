const express = require('express');
const router = express.Router();

// One-time schema fix endpoint
router.post('/apply-fix', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    console.log('🔧 Applying schema fixes...');
    
    // Add missing columns
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'UGX'`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`;
    await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS client_name VARCHAR(200)`;
    
    // Update existing data
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
    
    await sql`
      UPDATE referrals r 
      SET client_name = s.client_name 
      FROM screenings s 
      WHERE r.screening_id = s.id AND r.client_name IS NULL
    `;
    
    // Verify results
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const referralCount = await sql`SELECT COUNT(*) as count FROM referrals`;
    
    res.json({
      success: true,
      message: 'Schema fix completed successfully!',
      results: {
        products: productCount[0].count,
        users: userCount[0].count,
        referrals: referralCount[0].count
      }
    });
    
  } catch (error) {
    console.error('Schema fix error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
