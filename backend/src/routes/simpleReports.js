const express = require('express');
const router = express.Router();

// Simple reports endpoint without authentication
router.get('/list', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { reportType, startDate, endDate } = req.query;

    let data = [];

    if (reportType === 'screenings' || !reportType) {
      // Get screenings data
      let query = sql`
        SELECT 
          s.client_name,
          s.client_phone,
          s.client_age as age,
          s.client_gender as gender,
          s.client_village as village,
          s.client_district as district,
          s.screening_date,
          s.needs_glasses,
          s.needs_referral,
          p.name as product_name,
          p.power as product_power
        FROM screenings s
        LEFT JOIN products p ON s.recommended_product_id = p.id
        WHERE s.client_name IS NOT NULL
      `;

      if (startDate && endDate) {
        query = sql`
          SELECT 
            s.client_name,
            s.client_phone,
            s.client_age as age,
            s.client_gender as gender,
            s.client_village as village,
            s.client_district as district,
            s.screening_date,
            s.needs_glasses,
            s.needs_referral,
            p.name as product_name,
            p.power as product_power
          FROM screenings s
          LEFT JOIN products p ON s.recommended_product_id = p.id
          WHERE s.client_name IS NOT NULL
          AND date(s.screening_date) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      }

      const screenings = await query;
      data = screenings;
    }

    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Simple reports error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
