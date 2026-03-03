const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Get current user data
router.get('/me', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    let userId = null;
    let phoneNumber = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
        userId = decoded.userId;
        phoneNumber = decoded.phoneNumber;
      } catch (tokenError) {
        console.log('Invalid token, checking phone number fallback');
      }
    }

    // If no valid token, try to get user from frontend-stored token via AsyncStorage simulation
    // For development, we'll use the dev phone number as fallback
    if (!userId && !phoneNumber) {
      // Try to get the most recently active CHW user (for development/testing)
      const activeUser = await sql`
        SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
        FROM users 
        WHERE role = 'CHW' OR role = 'health_worker' 
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      
      if (activeUser.length > 0) {
        const user = activeUser[0];
        console.log('Using most recently active CHW user:', user.phone_number);
        return res.json({
          success: true,
          data: user
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'No CHW users found in database'
        });
      }
    }

    // Get user details from database using userId or phoneNumber
    let userResult;
    if (userId) {
      userResult = await sql`
        SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
        FROM users
        WHERE id = ${userId}
      `;
    } else if (phoneNumber) {
      userResult = await sql`
        SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
        FROM users
        WHERE phone_number = ${phoneNumber}
      `;
    }

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult[0];
    console.log('Returning user data for:', user.phone_number);

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
