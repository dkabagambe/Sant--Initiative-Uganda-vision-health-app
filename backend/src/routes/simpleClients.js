const express = require('express');
const router = express.Router();

// Simple clients endpoint without authentication
router.get('/list', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    // Get all clients from screenings (most reliable source)
    const clients = await sql`
      SELECT DISTINCT
        client_name as full_name,
        client_phone as phone_number,
        client_age as age,
        client_gender as gender,
        client_village as village,
        client_district as district,
        MAX(screening_date) as last_screening_date,
        COUNT(*) as total_screenings
      FROM screenings
      WHERE client_name IS NOT NULL
      GROUP BY client_name, client_phone, client_age, client_gender, client_village, client_district
      ORDER BY MAX(screening_date) DESC
      LIMIT 50
    `;
    
    res.json({
      success: true,
      data: clients
    });
    
  } catch (error) {
    console.error('Simple clients error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
