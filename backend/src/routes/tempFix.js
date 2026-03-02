const express = require('express');
const router = express.Router();

// Temporary fix endpoint to return correct API URL
// This allows the app to get the correct URL without authentication
router.get('/get-api-url', (req, res) => {
  res.json({
    success: true,
    apiUrl: 'https://backend-tau-sepia-43.vercel.app/api',
    message: 'Use this URL for API connections',
    timestamp: new Date().toISOString()
  });
});

// Simple health check that doesn't require auth
router.get('/simple-health', (req, res) => {
  res.json({
    success: true,
    status: 'Backend is working',
    url: 'https://backend-tau-sepia-43.vercel.app/api',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
