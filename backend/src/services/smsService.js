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
// ─── Developer bypass (existing — DO NOT CHANGE) ─────────────────────────────
// Developer account +256705686573 always accepts OTP 123456.
// This block must not be modified; its behaviour is covered by regression tests.
const DEV_BYPASS_NUMBERS = ['0705686573', '+256705686573', '256705686573'];

const isDevBypassNumber = (phoneNumber) => {
  const normalized = toE164(phoneNumber);
  return (
    DEV_BYPASS_NUMBERS.includes(phoneNumber) ||
    normalized === '+256705686573'
  );
};

// ─── Play Store demo account bypass (separate whitelist) ─────────────────────
// Enabled only when DEMO_LOGIN_ENABLED=true.
// Numbers and OTPs are read from env vars — never hardcoded.
// Demo accounts are completely independent of the developer bypass above.
const isDemoEnabled = () =>
  process.env.DEMO_LOGIN_ENABLED &&
  ['true', '1', 'yes'].includes(
    String(process.env.DEMO_LOGIN_ENABLED).toLowerCase()
  );

const DEMO_ROLES = ['CHW', 'OUTLET', 'VSLA'];

/**
 * Returns the demo entry for a phone number, or null if not a demo number.
 * Compares in E.164 format so +256700000101, 256700000101 and 0700000101 all match.
 * { phone: '+256...', otp: '######', role: 'CHW'|'OUTLET'|'VSLA' }
 */
const getDemoEntry = (phoneNumber) => {
  const enabled = isDemoEnabled();
  const normalized = toE164(phoneNumber);

  // Always log the feature-flag state so it's visible in Render/Vercel logs
  console.log(
    `[DEMO] flag=${enabled ? 'ON' : 'OFF'} | checking: ${normalized}`
  );

  if (!enabled) return null;

  for (const role of DEMO_ROLES) {
    const envPhone = process.env[`DEMO_${role}_PHONE`];
    if (!envPhone) {
      console.log(`[DEMO] DEMO_${role}_PHONE not set — skipping`);
      continue;
    }
    const envNormalized = toE164(envPhone);
    console.log(`[DEMO] comparing ${normalized} vs ${envNormalized} (${role})`);
    if (envNormalized && envNormalized === normalized) {
      console.log(`[DEMO] ✓ matched role=${role}`);
      return {
        phone: envNormalized,
        otp: process.env[`DEMO_${role}_OTP`] || '',
        role,
      };
    }
  }

  console.log(`[DEMO] no match for ${normalized}`);
  return null;
};

/** Exported for use in authController */
exports.getDemoEntry = getDemoEntry;

// ── Startup diagnostic (visible in Render / Vercel logs on every cold start) ──
;(() => {
  const on = isDemoEnabled();
  console.log(`[DEMO] DEMO_LOGIN_ENABLED=${process.env.DEMO_LOGIN_ENABLED ?? '(unset)'} → bypass ${on ? 'ACTIVE' : 'INACTIVE'}`);
  if (on) {
    for (const role of DEMO_ROLES) {
      const p = process.env[`DEMO_${role}_PHONE`];
      const hasOtp = !!(process.env[`DEMO_${role}_OTP`]);
      console.log(`[DEMO]   ${role}: phone=${p ?? '(unset)'}  otp=${hasOtp ? '(set)' : '(UNSET!)'}`);
    }
  }
})();

exports.sendOTP = async (phoneNumber, otp) => {
  const normalized = toE164(phoneNumber);
  // ── Developer bypass (unchanged) ────────────────────────────────────────────
  if (isDevBypassNumber(phoneNumber)) {
    console.log(`📱 [DEV BYPASS] Skipping OTP send for ${phoneNumber} — use code 123456`);
    return { success: true, devMode: true };
  }

  // ── Demo bypass (new — Play Store reviewers) ─────────────────────────────────
  const demoEntry = getDemoEntry(phoneNumber);
  if (demoEntry) {
    console.log(`📱 [DEMO LOGIN] Skipping SMS for demo number ${normalized} (role: ${demoEntry.role})`);
    return { success: true, demoMode: true };
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
  // ── Developer bypass (unchanged) ─────────────────────────────────────────────
  // Bypass OTP verification for dev number only — accept "123456"
  if (isDevBypassNumber(phoneNumber)) {
    const valid = code === '123456';
    console.log(`📱 [DEV BYPASS] Verifying OTP for ${phoneNumber}: ${code} → ${valid ? 'approved' : 'rejected'}`);
    return { success: valid, devMode: true };
  }

  // ── Demo bypass (new — Play Store reviewers) ──────────────────────────────────
  const demoEntry = getDemoEntry(phoneNumber);
  if (demoEntry) {
    const valid = demoEntry.otp && code === demoEntry.otp;
    console.log(
      `📱 [DEMO LOGIN] OTP check for ${normalized} (role: ${demoEntry.role}): ${code} → ${valid ? 'approved' : 'rejected'}`
    );
    return { success: valid, demoMode: true };
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
