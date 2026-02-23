const twilio = require('twilio');

// Initialize Twilio client
const initializeClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifyServiceSid) {
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
 * @param {string} otp - Ignored, Twilio Verify generates its own OTP
 * @returns {Promise<{success: boolean, error?: string}>}
 */
// Dev bypass numbers — these skip Twilio entirely, use OTP "123456"
const DEV_BYPASS_NUMBERS = ['0705686573', '+256705686573'];

exports.sendOTP = async (phoneNumber, otp) => {
  // Bypass OTP for dev numbers
  if (DEV_BYPASS_NUMBERS.includes(phoneNumber)) {
    console.log(`📱 [DEV BYPASS] Skipping OTP send for ${phoneNumber} — use code 123456`);
    return { success: true, devMode: true };
  }

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
  // Bypass OTP verification for dev numbers — accept "123456"
  if (DEV_BYPASS_NUMBERS.includes(phoneNumber)) {
    const valid = code === '123456';
    console.log(`📱 [DEV BYPASS] Verifying OTP for ${phoneNumber}: ${code} → ${valid ? 'approved' : 'rejected'}`);
    return { success: valid, devMode: true };
  }

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

    console.log('✅ OTP verified via Twilio:', {
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

module.exports = exports;
