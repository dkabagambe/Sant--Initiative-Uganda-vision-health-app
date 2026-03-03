const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');

// Debug OTP sending for specific phone number
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const targetNumber = phoneNumber || '0702612079';
    
    console.log(`🔍 [DEBUG] Testing OTP send for: ${targetNumber}`);
    
    // Check phone number normalization
    const toE164 = (phone) => {
      const digits = String(phone || '').replace(/\D/g, '');
      if (!digits) return '';
      if (digits.startsWith('256')) return `+${digits}`;
      if (digits.startsWith('0')) return `+256${digits.slice(1)}`;
      return `+256${digits}`;
    };
    
    const normalized = toE164(targetNumber);
    console.log(`🔍 [DEBUG] Normalized phone: ${normalized}`);
    
    // Check if this is a dev bypass number
    const DEV_BYPASS_NUMBERS = ['0705686573', '+256705686573'];
    const isDevBypass = DEV_BYPASS_NUMBERS.includes(targetNumber) || normalized === '+256705686573';
    console.log(`🔍 [DEBUG] Is dev bypass: ${isDevBypass}`);
    
    // Check Twilio configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    console.log(`🔍 [DEBUG] Twilio config:`, {
      hasAccountSid: !!accountSid,
      hasAuthToken: !!authToken,
      hasVerifyServiceSid: !!verifyServiceSid,
      accountSidPrefix: accountSid ? accountSid.substring(0, 8) + '...' : 'none'
    });
    
    // Attempt to send OTP
    const smsResult = await smsService.sendOTP(targetNumber, null);
    
    console.log(`🔍 [DEBUG] SMS Result:`, smsResult);
    
    res.json({
      success: true,
      debug: {
        originalNumber: targetNumber,
        normalizedNumber: normalized,
        isDevBypass,
        twilioConfig: {
          hasAccountSid: !!accountSid,
          hasAuthToken: !!authToken,
          hasVerifyServiceSid: !!verifyServiceSid
        },
        smsResult
      }
    });
    
  } catch (error) {
    console.error('🔍 [DEBUG] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        stack: error.stack
      }
    });
  }
});

// Test OTP verification
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    const targetNumber = phoneNumber || '0702612079';
    const testCode = code || '123456';
    
    console.log(`🔍 [DEBUG] Testing OTP verify for: ${targetNumber} with code: ${testCode}`);
    
    const verifyResult = await smsService.verifyOTP(targetNumber, testCode);
    
    console.log(`🔍 [DEBUG] Verify Result:`, verifyResult);
    
    res.json({
      success: true,
      debug: {
        originalNumber: targetNumber,
        testCode,
        verifyResult
      }
    });
    
  } catch (error) {
    console.error('🔍 [DEBUG] Verify Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
