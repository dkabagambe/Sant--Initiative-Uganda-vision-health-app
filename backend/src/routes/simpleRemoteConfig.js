const express = require('express');
const router = express.Router();

// Default remote configuration
const defaultConfig = {
  apiBaseUrl: 'https://sante-initiative.vercel.app/api',
  maintenanceMode: false,
  forceUpdateVersion: null,
  features: {
    paymentsEnabled: true,
    referralsEnabled: true,
    stockEnabled: true,
    reportsEnabled: true,
  },
  messages: {
    welcome: 'Welcome to Santé Initiative Vision Health App',
    maintenance: 'System under maintenance. Please try again later.',
    updateRequired: 'Please update to the latest version for best experience.',
  },
  lastUpdated: new Date().toISOString(),
};

// In-memory storage (in production, use database)
let currentConfig = { ...defaultConfig };

// Get current remote configuration
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: currentConfig,
    });
  } catch (error) {
    console.error('Get remote config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch remote config',
    });
  }
});

// Update remote configuration (admin only - add authentication in production)
router.patch('/', async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate updates
    const allowedKeys = [
      'apiBaseUrl', 'maintenanceMode', 'forceUpdateVersion', 
      'features', 'messages'
    ];
    
    const validUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedKeys.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });
    
    // Update config
    currentConfig = {
      ...currentConfig,
      ...validUpdates,
      lastUpdated: new Date().toISOString(),
    };
    
    console.log('Remote config updated:', currentConfig);
    
    res.json({
      success: true,
      message: 'Remote configuration updated successfully',
      data: currentConfig,
    });
  } catch (error) {
    console.error('Update remote config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update remote config',
    });
  }
});

// Reset to default configuration
router.post('/reset', async (req, res) => {
  try {
    currentConfig = { ...defaultConfig, lastUpdated: new Date().toISOString() };
    
    res.json({
      success: true,
      message: 'Remote configuration reset to default',
      data: currentConfig,
    });
  } catch (error) {
    console.error('Reset remote config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset remote config',
    });
  }
});

// Emergency endpoint to update API URL
router.post('/emergency-url', async (req, res) => {
  try {
    const { apiBaseUrl } = req.body;
    
    if (!apiBaseUrl) {
      return res.status(400).json({
        success: false,
        error: 'API URL is required',
      });
    }
    
    currentConfig.apiBaseUrl = apiBaseUrl;
    currentConfig.lastUpdated = new Date().toISOString();
    
    console.log('Emergency API URL updated:', apiBaseUrl);
    
    res.json({
      success: true,
      message: 'Emergency API URL updated successfully',
      data: currentConfig,
    });
  } catch (error) {
    console.error('Emergency URL update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency URL',
    });
  }
});

module.exports = router;
