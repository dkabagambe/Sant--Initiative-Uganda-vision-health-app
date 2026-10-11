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

/** True only when running in production. */
const isProduction = () =>
  String(process.env.NODE_ENV).toLowerCase() === 'production';

/**
 * Send OTP via Twilio Verify API
 * @param {string} phoneNumber - Phone in format: 0700123456, 256700123456, or +256700123456
 * @param {string} otp - Ignored, Twilio Verify generates its own OTP
 * @returns {Promise<{success: boolean, error?: string}>}
 */
// ─── Developer bypass ────────────────────────────────────────────────────────
// Developer account +256705686573 always accepts a fixed OTP (DEV_BYPASS_OTP,
// falling back to '123456' when the env var is unset).
//
// Activation rules:
//   Production  : ON only when DEV_BYPASS_ENABLED is explicitly "true"/"1"/"yes".
//                 Unset or any other value → OFF.
//   Non-production: ON by default; OFF only when DEV_BYPASS_ENABLED is
//                 explicitly "false"/"0"/"no".
//
// The bypass OTP is read from DEV_BYPASS_OTP at call-time so it can be
// rotated without a code change.
const DEV_BYPASS_NUMBERS = ['0705686573', '+256705686573', '256705686573'];

const isDevBypassEnabled = () => {
  const val = process.env.DEV_BYPASS_ENABLED;
  if (isProduction()) {
    // Production: require explicit opt-in
    return ['true', '1', 'yes'].includes(String(val).toLowerCase());
  }
  // Non-production: default ON, only OFF when explicitly disabled
  if (!val) return true;
  return !['false', '0', 'no'].includes(String(val).toLowerCase());
};

/** The OTP accepted by the developer bypass (rotatable via env var). */
const getDevBypassOtp = () => process.env.DEV_BYPASS_OTP || '123456';

const isDevBypassNumber = (phoneNumber) => {
  if (!isDevBypassEnabled()) return false;
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
  if (!enabled) return null;

  const normalized = toE164(phoneNumber);

  for (const role of DEMO_ROLES) {
    const envPhone = process.env[`DEMO_${role}_PHONE`];
    if (!envPhone) continue;
    const envNormalized = toE164(envPhone);
    if (envNormalized && envNormalized === normalized) {
      return {
        phone: envNormalized,
        otp: process.env[`DEMO_${role}_OTP`] || '',
        role,
      };
    }
  }

  return null;
};

/** Exported for use in authController */
exports.getDemoEntry = getDemoEntry;

// ── Startup diagnostic (visible in Render / Vercel logs on every cold start) ──
;(() => {
  const prod = isProduction();
  const devOn = isDevBypassEnabled();
  console.log(`[smsService] NODE_ENV=${process.env.NODE_ENV ?? '(unset)'} production=${prod}`);
  console.log(`[DEV BYPASS] DEV_BYPASS_ENABLED=${process.env.DEV_BYPASS_ENABLED ?? '(unset)'} DEV_BYPASS_OTP=${process.env.DEV_BYPASS_OTP ? '(set)' : '(unset=default)'} → bypass ${devOn ? 'ACTIVE' : 'INACTIVE'}`);
  const on = isDemoEnabled();
  console.log(`[DEMO] DEMO_LOGIN_ENABLED=${process.env.DEMO_LOGIN_ENABLED ?? '(unset)'} → bypass ${on ? 'ACTIVE' : 'INACTIVE'}`);
  if (on) {
    for (const role of DEMO_ROLES) {
      const hasPhone = !!(process.env[`DEMO_${role}_PHONE`]);
      const hasOtp   = !!(process.env[`DEMO_${role}_OTP`]);
      console.log(`[DEMO]   ${role}: phone=${hasPhone ? '(set)' : '(UNSET!)'}  otp=${hasOtp ? '(set)' : '(UNSET!)'}`);
    }
  }
})();

exports.sendOTP = async (phoneNumber, otp) => {
  // ── Developer bypass ─────────────────────────────────────────────────────────
  if (isDevBypassNumber(phoneNumber)) {
    console.log(`[DEV BYPASS] sendOTP ${toE164(phoneNumber)} → skipped (dev bypass active)`);
    return { success: true, devMode: true };
  }

  // ── Demo bypass ───────────────────────────────────────────────────────────────
  const demoEntry = getDemoEntry(phoneNumber);
  if (demoEntry) {
    console.log(`[DEMO LOGIN] sendOTP role=${demoEntry.role} → skipped (demo bypass active)`);
    return { success: true, demoMode: true };
  }

  // ── Twilio ────────────────────────────────────────────────────────────────────
  if (!twilioService) {
    // In production with no Twilio config, fail closed — never silently approve.
    if (isProduction()) {
      console.error('[smsService] sendOTP: Twilio not configured in production — rejecting');
      return { success: false, error: 'SMS service is not configured' };
    }
    // Non-production dev fallback
    console.log(`[DEV MODE] sendOTP ${toE164(phoneNumber)} → approved (no Twilio in dev)`);
    return { success: true, devMode: true };
  }

  const formattedPhone = toE164(phoneNumber);
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

    console.log(`[smsService] sendOTP ${formattedPhone} → ${verification.status}`);
    return { success: true, verification };
  } catch (error) {
    console.error(`[smsService] sendOTP failed: ${error.message}`);
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

  // ── Developer bypass ──────────────────────────────────────────────────────────
  if (isDevBypassNumber(phoneNumber)) {
    const valid = code === getDevBypassOtp();
    console.log(`[DEV BYPASS] verifyOTP ${normalized} → ${valid ? 'approved' : 'rejected'}`);
    return { success: valid, devMode: true };
  }

  // ── Demo bypass ───────────────────────────────────────────────────────────────
  const demoEntry = getDemoEntry(phoneNumber);
  if (demoEntry) {
    const valid = demoEntry.otp && code === demoEntry.otp;
    console.log(`[DEMO LOGIN] verifyOTP role=${demoEntry.role} → ${valid ? 'approved' : 'rejected'}`);
    return { success: valid, demoMode: true };
  }

  // ── Twilio ────────────────────────────────────────────────────────────────────
  if (!twilioService) {
    // In production with no Twilio config, fail closed — never silently approve.
    if (isProduction()) {
      console.error('[smsService] verifyOTP: Twilio not configured in production — rejecting');
      return { success: false, error: 'SMS service is not configured' };
    }
    // Non-production dev fallback
    console.log(`[DEV MODE] verifyOTP ${normalized} → approved (no Twilio in dev)`);
    return { success: true, devMode: true };
  }

  try {
    const verificationCheck = await twilioService.client.verify.v2
      .services(twilioService.verifyServiceSid)
      .verificationChecks.create({
        to: normalized,
        code: code,
      });

    const approved = verificationCheck.status === 'approved';
    console.log(`[smsService] verifyOTP ${normalized} → ${verificationCheck.status}`);
    return { success: approved, status: verificationCheck.status };
  } catch (error) {
    console.error(`[smsService] verifyOTP failed: ${error.message}`);
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

    console.log(`[smsService] sendSMS ${formattedPhone} → ${result.status} (sid: ${result.sid})`);
    return { success: true, sid: result.sid, status: result.status };
  } catch (error) {
    console.error(`[smsService] sendSMS failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = exports;
