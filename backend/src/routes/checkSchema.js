const express = require('express');
const router = express.Router();

// Check users table structure
router.get('/users', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    res.json({
      success: true,
      table: 'users',
      columns: columns
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check payments table structure
router.get('/payments', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position
    `;
    
    res.json({
      success: true,
      table: 'payments',
      columns: columns
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check clients table structure
router.get('/clients', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `;
    
    res.json({
      success: true,
      table: 'clients',
      columns: columns
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
