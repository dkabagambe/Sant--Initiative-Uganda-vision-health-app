const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Get current user data — always resolves from the JWT token first
router.get('/me', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { phoneNumber } = req.query;

    // --- 1. Try JWT token from Authorization header (most reliable) ---
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        if (decoded?.userId) {
          const userResult = await sql`
            SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
            FROM users
            WHERE id = ${decoded.userId}
          `;
          if (userResult.length > 0) {
            return res.json({ success: true, data: userResult[0] });
          }
        }
      } catch (_jwtErr) {
        // token invalid/expired — fall through to phone number lookup
      }
    }

    // --- 2. Phone number query param fallback (used when token is missing) ---
    if (phoneNumber) {
      const userResult = await sql`
        SELECT id, phone_number, full_name, first_name, last_name, role, village, district, created_at, updated_at
        FROM users
        WHERE phone_number = ${phoneNumber}
      `;
      if (userResult.length > 0) {
        return res.json({ success: true, data: userResult[0] });
      }
      return res.status(404).json({ success: false, error: 'User not found for this phone number' });
    }

    return res.status(401).json({ success: false, error: 'Authentication required' });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user data' });
  }
});

module.exports = router;
