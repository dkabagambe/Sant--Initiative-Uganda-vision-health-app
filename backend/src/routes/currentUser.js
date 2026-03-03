const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Get current user data
router.get('/me', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { phoneNumber } = req.query;
    
    console.log('Current user request for phoneNumber:', phoneNumber);
    
    // If phoneNumber is provided, get that specific user
    if (phoneNumber) {
      const userResult = await sql`
        SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
        FROM users
        WHERE phone_number = ${phoneNumber}
      `;
      
      if (userResult.length > 0) {
        const user = userResult[0];
        console.log('Returning user data for phone:', phoneNumber);
        return res.json({
          success: true,
          data: user
        });
      } else {
        console.log('No user found for phone:', phoneNumber);
        return res.status(404).json({
          success: false,
          error: 'User not found for this phone number'
        });
      }
    }
    
    // Fallback: get the most recently active CHW user
    const activeUser = await sql`
      SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
      FROM users 
      WHERE role = 'CHW' OR role = 'health_worker' 
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    
    if (activeUser.length > 0) {
      const user = activeUser[0];
      console.log('Returning fallback user data for:', user.phone_number);
      return res.json({
        success: true,
        data: user
      });
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
