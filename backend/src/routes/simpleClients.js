const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Clients endpoint — requires JWT so list is scoped to the logged-in VHT
router.get('/list', authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId;

    if (!healthWorkerId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Get clients from screenings belonging to this VHT only
    const clients = await sql`
      SELECT DISTINCT
        client_name as full_name,
        client_phone as phone_number,
        client_age as age,
        client_gender as gender,
        client_village as village,
        client_district as district,
        MAX(COALESCE(screening_date::date, created_at::date)) as last_screening_date,
        COUNT(*) as total_screenings
      FROM screenings
      WHERE client_name IS NOT NULL
        AND health_worker_id = ${healthWorkerId}
      GROUP BY client_name, client_phone, client_age, client_gender, client_village, client_district
      ORDER BY MAX(COALESCE(screening_date::date, created_at::date)) DESC
      LIMIT 100
    `;

    res.json({
      success: true,
      data: clients,
      count: clients.length
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
