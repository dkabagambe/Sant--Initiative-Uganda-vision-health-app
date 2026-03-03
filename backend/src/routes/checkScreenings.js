const express = require('express');
const router = express.Router();

// Check screenings table structure
router.get('/schema', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'screenings'
      ORDER BY ordinal_position
    `;
    
    res.json({
      success: true,
      table: 'screenings',
      columns: columns
    });
    
  } catch (error) {
    console.error('Screenings schema check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
