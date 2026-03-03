const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Check OTP verification status
router.post('/status', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const targetNumber = phoneNumber || '0702612079';
    
    // Initialize Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    
    if (!accountSid || !authToken || !verifyServiceSid) {
      return res.status(500).json({
        success: false,
        error: 'Twilio not configured'
      });
    }
    
    const client = twilio(accountSid, authToken);
    
    // Normalize phone number
    const toE164 = (phone) => {
      const digits = String(phone || '').replace(/\D/g, '');
      if (!digits) return '';
      if (digits.startsWith('256')) return `+${digits}`;
      if (digits.startsWith('0')) return `+256${digits.slice(1)}`;
      return `+256${digits}`;
    };
    
    const normalized = toE164(targetNumber);
    
    // Get recent verification attempts
    const verifications = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .list({ limit: 5 });
    
    console.log(`🔍 [OTP STATUS] Recent verifications for ${normalized}:`, verifications.length);
    
    res.json({
      success: true,
      debug: {
        phoneNumber: targetNumber,
        normalizedNumber: normalized,
        verificationCount: verifications.length,
        verifications: verifications.map(v => ({
          sid: v.sid,
          status: v.status,
          channel: v.channel,
          dateCreated: v.dateCreated,
          dateUpdated: v.dateUpdated,
          sendCodeAttempts: v.sendCodeAttempts?.length || 0,
          lookup: v.lookup
        }))
      }
    });
    
  } catch (error) {
    console.error('🔍 [OTP STATUS] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test carrier lookup
router.post('/carrier', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const targetNumber = phoneNumber || '0702612079';
    
    // Initialize Twilio client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      return res.status(500).json({
        success: false,
        error: 'Twilio not configured'
      });
    }
    
    const client = twilio(accountSid, authToken);
    
    // Normalize phone number
    const toE164 = (phone) => {
      const digits = String(phone || '').replace(/\D/g, '');
      if (!digits) return '';
      if (digits.startsWith('256')) return `+${digits}`;
      if (digits.startsWith('0')) return `+256${digits.slice(1)}`;
      return `+256${digits}`;
    };
    
    const normalized = toE164(targetNumber);
    
    // Look up carrier information
    const lookup = await client.lookups.v2
      .phoneNumbers(normalized)
      .fetch({ fields: 'line_type_intelligence' });
    
    console.log(`🔍 [CARRIER] Lookup for ${normalized}:`, lookup);
    
    res.json({
      success: true,
      debug: {
        phoneNumber: targetNumber,
        normalizedNumber: normalized,
        lookup: {
          countryCode: lookup.countryCode,
          phoneNumber: lookup.phoneNumber,
          nationalFormat: lookup.nationalFormat,
          valid: lookup.valid,
          lineTypeIntelligence: lookup.lineTypeIntelligence
        }
      }
    });
    
  } catch (error) {
    console.error('🔍 [CARRIER] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
