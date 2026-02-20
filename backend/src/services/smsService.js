const twilio = require('twilio');

// Initialize Twilio client
const initializeClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifyServiceSid) {
    console.warn('⚠️  Twilio credentials not configured. SMS will not be sent.');
    return null;
  }

  try {
    const client = twilio(accountSid, authToken);
    return { client, verifyServiceSid };
  } catch (error) {
    console.error('Failed to initialize Twilio:', error);
    return null;
  }
};

const twilioService = initializeClient();

/**
 * Send OTP via Twilio Verify API
 * @param {string} phoneNumber - Phone number in format: 0700123456 or +256700123456
 * @param {string} otp - Ignored, Twilio generates the OTP
 * @returns {Promise<{success: boolean, error?: string}>}
 */
exports.sendOTP = async (phoneNumber, otp) => {
  // If SMS not configured, just log and return success (dev mode)
  if (!twilioService) {
    console.log(`📱 [DEV MODE] OTP for ${phoneNumber}: ${otp}`);
    return { success: true, devMode: true };
  }

  try {
    // Format phone number for Twilio (must start with +)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = `+256${phoneNumber.substring(1)}`;
    } else if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+256${phoneNumber}`;
    }

    const verification = await twilioService.client.verify.v2
      .services(twilioService.verifyServiceSid)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms',
      });

    console.log('✅ OTP sent via Twilio Verify:', {
      phone: formattedPhone,
      status: verification.status,
    });

    return { success: true, verification };
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    console.log('SMS failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verify OTP using Twilio Verify API
 * @param {string} phoneNumber - Phone number
 * @param {string} code - OTP code to verify
 * @returns {Promise<{success: boolean, error?: string}>}
 */
exports.verifyOTP = async (phoneNumber, code) => {
  if (!twilioService) {
    console.log(`📱 [DEV MODE] Verifying OTP for ${phoneNumber}: ${code}`);
    return { success: true, devMode: true };
  }

  try {
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = `+256${phoneNumber.substring(1)}`;
    } else if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+256${phoneNumber}`;
    }

    const verificationCheck = await twilioService.client.verify.v2
      .services(twilioService.verifyServiceSid)
      .verificationChecks.create({
        to: formattedPhone,
        code: code,
      });

    console.log('✅ OTP verified:', {
      phone: formattedPhone,
      status: verificationCheck.status,
    });

    return { 
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status 
    };
  } catch (error) {
    console.error('❌ OTP verification failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send general SMS using Twilio (for non-OTP messages)
 * @param {string} phoneNumber - Phone number
 * @param {string} message - Message to send
 * @returns {Promise<{success: boolean, error?: string}>}
 */
exports.sendSMS = async (phoneNumber, message) => {
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (!twilioService || !twilioPhoneNumber) {
    console.log(`📱 [DEV MODE] SMS to ${phoneNumber}: ${message}`);
    return { success: true, devMode: true };
  }

  try {
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = `+256${phoneNumber.substring(1)}`;
    } else if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+256${phoneNumber}`;
    }

    const result = await twilioService.client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone,
    });

    console.log('✅ SMS sent successfully:', {
      phone: formattedPhone,
      sid: result.sid,
    });

    return { success: true, result };
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = exports;
