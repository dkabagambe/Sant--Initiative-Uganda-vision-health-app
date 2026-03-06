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
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
const TWILIO_SMS_FROM = process.env.TWILIO_SMS_FROM;

// Normalize phone to E.164 (+256...) — handles 0702612079, 256702612079, +256702612079
const toE164 = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('256')) return `+${digits}`;
  if (digits.startsWith('0')) return `+256${digits.slice(1)}`;
  return `+256${digits}`;
};

/**
 * Send OTP via Twilio Verify API
 * @param {string} phoneNumber - Phone in format: 0700123456, 256700123456, or +256700123456
 * @param {string} otp - Ignored, Twilio Verify generates its own OTP
 * @returns {Promise<{success: boolean, error?: string}>}
 */
// Dev bypass — developer number only; use OTP "123456" to avoid wasting Twilio credits
const DEV_BYPASS_NUMBERS = ['0705686573', '+256705686573'];

exports.sendOTP = async (phoneNumber, otp) => {
  const normalized = toE164(phoneNumber);
  if (DEV_BYPASS_NUMBERS.includes(phoneNumber) || normalized === '+256705686573') {
    console.log(`📱 [DEV BYPASS] Skipping OTP send for ${phoneNumber} — use code 123456`);
    return { success: true, devMode: true };
  }

  // If SMS not configured, just log and return success (dev mode)
  if (!twilioService) {
    console.log(`📱 [DEV MODE] OTP for ${phoneNumber}: ${otp}`);
    return { success: true, devMode: true };
  }

  const formattedPhone = normalized || toE164(phoneNumber);
  if (!formattedPhone) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {

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
  const normalized = toE164(phoneNumber);
  // Bypass OTP verification for dev number only — accept "123456"
  if (DEV_BYPASS_NUMBERS.includes(phoneNumber) || normalized === '+256705686573') {
    const valid = code === '123456';
    console.log(`📱 [DEV BYPASS] Verifying OTP for ${phoneNumber}: ${code} → ${valid ? 'approved' : 'rejected'}`);
    return { success: valid, devMode: true };
  }

  if (!twilioService) {
    console.log(`📱 [DEV MODE] Verifying OTP for ${phoneNumber}: ${code}`);
    return { success: true, devMode: true };
  }

  try {
    const formattedPhone = normalized || toE164(phoneNumber);

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

/**
 * Send a generic SMS (e.g. receipts, reminders)
 * Falls back to console logging when Twilio is not configured.
 * @param {string} phoneNumber
 * @param {string} message
 */
exports.sendSMS = async (phoneNumber, message) => {
  // If SMS not configured, just pretend success (dev mode) - no logging spam
  if (!twilioService || (!TWILIO_MESSAGING_SERVICE_SID && !TWILIO_SMS_FROM)) {
    return { success: true, devMode: true };
  }

  try {
    const formattedPhone = toE164(phoneNumber);

    const smsConfig = {
      to: formattedPhone,
      body: message,
    };

    if (TWILIO_MESSAGING_SERVICE_SID) {
      smsConfig.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
    } else {
      smsConfig.from = TWILIO_SMS_FROM;
    }

    const result = await twilioService.client.messages.create(smsConfig);

    console.log('✅ SMS sent via Twilio:', {
      to: formattedPhone,
      sid: result.sid,
      status: result.status,
    });

    return { success: true, sid: result.sid, status: result.status };
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = exports;
