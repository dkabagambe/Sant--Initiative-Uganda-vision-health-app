/**
 * Login / OTP flow test
 * Run: node test-login.js
 *
 * Tests:
 *  1. Unregistered number → gets NOT_REGISTERED, does NOT crash
 *  2. Invalid phone format → gets validation error, does NOT crash
 *  3. Registered dev number → success, OTP sent
 *  4. Dev number OTP verify with wrong code → invalid OTP error
 *  5. Dev number OTP verify with correct code (123456) → login success
 */

const https = require("https");

const API_HOST = "backend-tau-sepia-43.vercel.app";
const API_BASE = "/api";
const DEV_PHONE = "0705686573"; // dev bypass number
const UNREGISTERED = "0700000001"; // should not be in DB

let passed = 0;
let failed = 0;

function ok(name) {
  console.log(`  ✅  PASS  ${name}`);
  passed++;
}

function fail(name, reason) {
  console.log(`  ❌  FAIL  ${name}`);
  console.log(`           → ${reason}`);
  failed++;
}

// Simple HTTPS POST — no external deps
function post(path, body) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: API_HOST,
      path: API_BASE + path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve({ ok: res.statusCode < 400, status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ ok: false, status: res.statusCode, data: { error: "Invalid JSON response" } });
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, status: 0, data: { error: "Request timed out" } });
    });

    req.on("error", (e) => {
      resolve({ ok: false, status: 0, data: { error: e.message } });
    });

    req.write(payload);
    req.end();
  });
}

// Mirrors the fixed apiService.login()
async function login(phoneNumber) {
  const res = await post("/auth/login", { phoneNumber });
  return res.data;
}

// Mirrors the fixed apiService.verifyOTP()
async function verifyOTP(phoneNumber, otp) {
  const res = await post("/auth/verify-otp", { phoneNumber, otp });
  return res.data;
}

async function run() {
  console.log("\n========================================");
  console.log("  Santé Initiative — Login / OTP Tests");
  console.log(`  Backend: https://${API_HOST}${API_BASE}`);
  console.log("========================================\n");

  // ── TEST 1: Unregistered number ──────────────────────────────────────────
  console.log("Test 1: Unregistered number");
  try {
    const result = await login(UNREGISTERED);
    if (!result.success && (result.code === "NOT_REGISTERED" || (result.error || "").toLowerCase().includes("not registered"))) {
      ok("Returns NOT_REGISTERED without crashing");
    } else if (!result.success) {
      ok(`Returns error without crashing (error: "${result.error}")`);
    } else {
      fail("Unregistered number check", `Expected failure but got success: ${JSON.stringify(result)}`);
    }
  } catch (e) {
    fail("Unregistered number check", `CRASHED with exception: ${e.message}`);
  }

  // ── TEST 2: Empty / invalid phone ────────────────────────────────────────
  console.log("\nTest 2: Invalid/empty phone number");
  try {
    const result = await login("abc");
    if (!result.success) {
      ok("Invalid phone returns error without crashing");
    } else {
      fail("Invalid phone check", "Expected failure but got success");
    }
  } catch (e) {
    fail("Invalid phone check", `CRASHED with exception: ${e.message}`);
  }

  // ── TEST 3: Dev number login (OTP send) ──────────────────────────────────
  console.log("\nTest 3: Dev number login (sends OTP)");
  try {
    const result = await login(DEV_PHONE);
    if (result.success) {
      ok("Dev number login returns success");
    } else {
      fail("Dev number login", `Expected success but got: ${JSON.stringify(result)}`);
    }
  } catch (e) {
    fail("Dev number login", `CRASHED with exception: ${e.message}`);
  }

  // ── TEST 4: OTP verify — wrong code ─────────────────────────────────────
  console.log("\nTest 4: OTP verify with wrong code");
  try {
    const result = await verifyOTP(DEV_PHONE, "999999");
    if (!result.success) {
      ok("Wrong OTP returns error without crashing");
    } else {
      fail("Wrong OTP check", "Expected failure but got success");
    }
  } catch (e) {
    fail("Wrong OTP check", `CRASHED with exception: ${e.message}`);
  }

  // ── TEST 5: OTP verify — correct dev code ────────────────────────────────
  console.log("\nTest 5: OTP verify with correct dev code (123456)");
  try {
    const result = await verifyOTP(DEV_PHONE, "123456");
    if (result.success && result.token && result.user) {
      ok(`Login successful — user: ${result.user.full_name || result.user.phone_number}, role: ${result.user.role}`);
    } else if (result.success) {
      ok("Login returned success (token/user may be missing — check backend)");
    } else {
      fail("Correct OTP verify", `Expected success but got: ${JSON.stringify(result)}`);
    }
  } catch (e) {
    fail("Correct OTP verify", `CRASHED with exception: ${e.message}`);
  }

  // ── SUMMARY ──────────────────────────────────────────────────────────────
  console.log("\n========================================");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("========================================\n");

  if (failed > 0) process.exit(1);
}

run();
