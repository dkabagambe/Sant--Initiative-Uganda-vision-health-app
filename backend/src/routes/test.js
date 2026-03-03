const express = require('express');
const router = express.Router();

// Simple test endpoint for debugging connection
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is reachable!',
    timestamp: new Date().toISOString(),
    ip: req.ip,
    headers: req.headers
  });
});

// Force refresh endpoint for app
router.get('/refresh', (req, res) => {
  res.json({
    success: true,
    message: 'API configuration refreshed!',
    api_url: 'http://192.168.137.123:5000/api',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
