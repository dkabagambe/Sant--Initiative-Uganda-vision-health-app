const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Get current user data
router.get('/me', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    // For now, get the most recently active CHW user
    // This will work for development and testing
    const activeUser = await sql`
      SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
      FROM users 
      WHERE role = 'CHW' OR role = 'health_worker' 
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
    if (activeUser.length > 0) {
      const user = activeUser[0];
      console.log('Returning user data for:', user.phone_number);
      return res.json({
        success: true,
        data: user
      });
    } else {
      // Fallback to any user if no CHW found
      const anyUser = await sql`
        SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
        FROM users 
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      
      if (anyUser.length > 0) {
        const user = anyUser[0];
        console.log('Returning fallback user data for:', user.phone_number);
        return res.json({
          success: true,
          data: user
        });
      }
    }

    return res.status(404).json({
      success: false,
      error: 'No users found in database'
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

module.exports = router;
