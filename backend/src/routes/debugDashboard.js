const express = require('express');
const router = express.Router();

// Simple debug endpoint for dashboard
router.get('/debug', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    // Test basic database connection
    const testQuery = await sql`SELECT 1 as test`;
    
    // Test screenings count
    const screeningCount = await sql`SELECT COUNT(*) as count FROM screenings`;
    
    // Test payments count
    const paymentCount = await sql`SELECT COUNT(*) as count FROM payments`;
    
    // Test referrals count
    const referralCount = await sql`SELECT COUNT(*) as count FROM referrals`;
    
    res.json({
      success: true,
      debug: {
        database_connection: testQuery[0]?.test || 'failed',
        screenings_count: screeningCount[0]?.count || 0,
        payments_count: paymentCount[0]?.count || 0,
        referrals_count: referralCount[0]?.count || 0,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Debug dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
