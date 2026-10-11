/**
 * tempFix.js — legacy diagnostics route.
 *
 * This route was used during an early migration and is now disabled in
 * production.  All endpoints return 404 when NODE_ENV=production so the
 * hardcoded Vercel URLs it contains are never exposed to clients.
 */
const express = require('express');
const router = express.Router();

// Block everything in production
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  next();
});

// Legacy endpoints (development only)
router.get('/get-api-url', (req, res) => {
  res.json({
    success: true,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
    message: 'Development only',
    timestamp: new Date().toISOString(),
  });
});

router.get('/simple-health', (req, res) => {
  res.json({
    success: true,
    status: 'Backend is working (development)',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
