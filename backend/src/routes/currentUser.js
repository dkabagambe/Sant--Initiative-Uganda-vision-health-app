const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Get current user data
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const sql = req.app.locals.sql;
    
    // Get user data from database
    const user = await sql`
      SELECT id, phone_number, full_name, first_name, last_name, role, village, district, 
             created_at, updated_at, last_login
      FROM users 
      WHERE id = ${decoded.userId}
    `;
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user[0]
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

module.exports = router;
