/**
 * __tests__/demo-login.test.js
 *
 * Tests for the Play Store demo login bypass.
 *
 * Coverage:
 *   1. Demo number + correct OTP → success
 *   2. Demo number + wrong OTP   → failure
 *   3. Non-demo number           → unaffected (goes to Twilio path)
 *   4. DEMO_LOGIN_ENABLED=false  → demo bypass inactive
 *   5. Developer bypass (+256705686573 / 123456) → still works exactly as before
 */

"use strict";

// ── Helper: load a fresh copy of smsService with controlled env vars ──────────
// Sets env vars before requiring the module (so module-level init picks them up),
// and returns a restore() function to reset env after each test.
function loadSmsServiceWithEnv(envOverrides) {
  jest.resetModules();

  const saved = {};
  for (const [k, v] of Object.entries(envOverrides)) {
    saved[k] = process.env[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }

  const svc = require("../src/services/smsService");

  const restore = () => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }
  };

  return { svc, restore };
}

// ── Shared demo env ───────────────────────────────────────────────────────────
const DEMO_ENV_ON = {
  DEMO_LOGIN_ENABLED:        "true",
  DEMO_CHW_PHONE:            "+256700000101",
  DEMO_CHW_OTP:              "472819",
  DEMO_OUTLET_PHONE:         "+256700000102",
  DEMO_OUTLET_OTP:           "583920",
  DEMO_VSLA_PHONE:           "+256700000103",
  DEMO_VSLA_OTP:             "694031",
  // Keep Twilio uninitialised so non-demo numbers fall to generic dev-mode pass
  TWILIO_ACCOUNT_SID:        "",
  TWILIO_AUTH_TOKEN:         "",
  TWILIO_VERIFY_SERVICE_SID: "",
};

const DEMO_ENV_OFF = { ...DEMO_ENV_ON, DEMO_LOGIN_ENABLED: "false" };

// ─────────────────────────────────────────────────────────────────────────────
describe("Demo Login — sendOTP", () => {
  test("demo CHW phone returns success without calling Twilio", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.sendOTP("+256700000101", null);
      expect(result.success).toBe(true);
      expect(result.demoMode).toBe(true);
    } finally { restore(); }
  });

  test("demo Outlet phone (local format) returns success", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.sendOTP("0700000102", null);
      expect(result.success).toBe(true);
      expect(result.demoMode).toBe(true);
    } finally { restore(); }
  });

  test("demo VSLA phone (256-prefix) returns success", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.sendOTP("256700000103", null);
      expect(result.success).toBe(true);
      expect(result.demoMode).toBe(true);
    } finally { restore(); }
  });

  test("demo sendOTP does NOT set devMode (not the developer account)", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.sendOTP("+256700000101", null);
      expect(result.devMode).toBeUndefined();
    } finally { restore(); }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Demo Login — verifyOTP", () => {
  test("demo CHW number + correct OTP → approved", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("+256700000101", "472819");
      expect(result.success).toBe(true);
      expect(result.demoMode).toBe(true);
    } finally { restore(); }
  });

  test("demo Outlet number + correct OTP → approved", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("0700000102", "583920");
      expect(result.success).toBe(true);
      expect(result.demoMode).toBe(true);
    } finally { restore(); }
  });

  test("demo VSLA number + correct OTP → approved", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("256700000103", "694031");
      expect(result.success).toBe(true);
      expect(result.demoMode).toBe(true);
    } finally { restore(); }
  });

  test("demo CHW number + WRONG OTP → rejected", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("+256700000101", "000000");
      expect(result.success).toBe(false);
      expect(result.demoMode).toBe(true);
    } finally { restore(); }
  });

  test("demo Outlet number + WRONG OTP → rejected", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("0700000102", "999999");
      expect(result.success).toBe(false);
    } finally { restore(); }
  });

  test("demo VSLA number + a different role's OTP → rejected", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("256700000103", "472819"); // CHW OTP used on VSLA
      expect(result.success).toBe(false);
    } finally { restore(); }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Demo Login — feature flag OFF", () => {
  test("sendOTP for demo number falls through when flag is off (no demoMode)", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_OFF);
    try {
      const result = await svc.sendOTP("+256700000101", null);
      expect(result.demoMode).toBeUndefined();
    } finally { restore(); }
  });

  test("verifyOTP for demo number falls through when flag is off (no demoMode)", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_OFF);
    try {
      const result = await svc.verifyOTP("+256700000101", "472819");
      expect(result.demoMode).toBeUndefined();
    } finally { restore(); }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Non-demo numbers — unaffected", () => {
  test("a normal number verifyOTP is not treated as demo", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("+256712345678", "472819");
      expect(result.demoMode).toBeUndefined();
    } finally { restore(); }
  });

  test("a normal number sendOTP does not return demoMode", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.sendOTP("+256712345678", null);
      expect(result.demoMode).toBeUndefined();
    } finally { restore(); }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("Developer bypass regression — +256705686573 / OTP 123456", () => {
  test("developer number sendOTP → devMode:true (unchanged)", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.sendOTP("+256705686573", null);
      expect(result.success).toBe(true);
      expect(result.devMode).toBe(true);
      expect(result.demoMode).toBeUndefined();
    } finally { restore(); }
  });

  test("developer number + OTP 123456 → approved (unchanged)", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("+256705686573", "123456");
      expect(result.success).toBe(true);
      expect(result.devMode).toBe(true);
      expect(result.demoMode).toBeUndefined();
    } finally { restore(); }
  });

  test("developer number + wrong OTP → rejected (unchanged)", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.verifyOTP("+256705686573", "999999");
      expect(result.success).toBe(false);
      expect(result.devMode).toBe(true);
      expect(result.demoMode).toBeUndefined();
    } finally { restore(); }
  });

  test("developer number local format 0705686573 → devMode:true (unchanged)", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_ON);
    try {
      const result = await svc.sendOTP("0705686573", null);
      expect(result.success).toBe(true);
      expect(result.devMode).toBe(true);
    } finally { restore(); }
  });

  test("developer number works even when DEMO_LOGIN_ENABLED=false", async () => {
    const { svc, restore } = loadSmsServiceWithEnv(DEMO_ENV_OFF);
    try {
      const result = await svc.verifyOTP("+256705686573", "123456");
      expect(result.success).toBe(true);
      expect(result.devMode).toBe(true);
    } finally { restore(); }
  });
});
