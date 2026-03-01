const express = require('express');
const router = express.Router();

// Remote configuration endpoint
router.post('/update-api-url', async (req, res) => {
  try {
    const { newUrl, adminKey } = req.body;
    
    // Simple admin key validation (you should change this in production)
    const VALID_ADMIN_KEY = 'sante-admin-2024';
    
    if (!adminKey || adminKey !== VALID_ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        error: 'Invalid admin key'
      });
    }
    
    if (!newUrl || typeof newUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid API URL provided'
      });
    }
    
    // Validate URL format
    try {
      new URL(newUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }
    
    // In a real implementation, you might store this in a database
    // For now, we'll just return success and the frontend will handle storage
    
    res.json({
      success: true,
      message: 'API URL update ready for frontend',
      newUrl: newUrl,
      instruction: 'Frontend will store this configuration locally'
    });
    
  } catch (error) {
    console.error('Remote config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current configuration status
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Remote configuration service is active',
      supportedActions: [
        'POST /update-api-url - Update API URL (requires admin key)',
        'GET /status - Get service status'
      ],
      note: 'Frontend stores configuration locally for offline access'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
