const express = require('express');
const router = express.Router();

// Simple database test endpoint
router.get('/test', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    // Test basic database connection
    console.log('Testing database connection...');
    
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    
    res.json({
      success: true,
      message: 'Database connection successful',
      userCount: result[0].count,
      database: 'connected',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: 'failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Test environment variables
router.get('/env', (req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      USE_SQLITE: process.env.USE_SQLITE
    }
  });
});

module.exports = router;
