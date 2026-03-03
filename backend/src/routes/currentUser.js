const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Get current user data
router.get('/me', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    let userId = req.user?.userId;

    // If no authenticated user, get a sample CHW user for testing
    if (!userId) {
      const chwUsers = await sql`
        SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
        FROM users 
        WHERE role = 'CHW' OR role = 'health_worker' 
        LIMIT 1
      `;
      
      if (chwUsers.length > 0) {
        userId = chwUsers[0].id;
      } else {
        // Fallback to any user
        const anyUser = await sql`
          SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
          FROM users 
          LIMIT 1
        `;
        
        if (anyUser.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'No users found in database'
          });
        }
        
        return res.json({
          success: true,
          data: anyUser[0]
        });
      }
    }

    // Get user details from database
    const userResult = await sql`
      SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
      FROM users
      WHERE id = ${userId}
    `;

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult[0];

    res.json({
      success: true,
      data: user
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
