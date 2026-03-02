#!/usr/bin/env node
/**
 * Pre-production API smoke test.
 * Run against local or Vercel to verify critical endpoints before production.
 *
 * Usage:
 *   node scripts/smoke-test-api.js                    # default: http://localhost:5000/api
 *   BASE_URL=https://your-app.vercel.app/api node scripts/smoke-test-api.js
 *   node scripts/smoke-test-api.js https://your-app.vercel.app/api
 *
 * Optional auth test (dev bypass number only):
 *   TEST_PHONE=0705686573 node scripts/smoke-test-api.js
 */

const BASE_URL = process.env.BASE_URL || process.argv[2] || "http://localhost:5000/api";

const tests = [];
let passed = 0;
let failed = 0;

function log(msg, type = "info") {
  const prefix = type === "fail" ? "❌" : type === "ok" ? "✅" : "ℹ️";
  console.log(`${prefix} ${msg}`);
}

async function request(method, path, body = null, headers = {}) {
  const url = `${BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const opts = { method, headers: { "Content-Type": "application/json", ...headers } };
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = text;
  }
  return { status: res.status, data, ok: res.ok };
}

async function test(name, fn) {
  tests.push({ name, fn });
}

async function run() {
  console.log("\n🧪 Santé Initiative – API smoke test");
  console.log(`   Base URL: ${BASE_URL}\n`);

  // --- Health ---
  test("GET /health", async () => {
    const { status, data, ok } = await request("GET", "/health");
    if (!ok || status !== 200) {
      throw new Error(`Expected 200, got ${status}`);
    }
    if (!data || data.status !== "OK") {
      throw new Error("Health response missing status OK");
    }
    if (data.database !== "connected") {
      log(`Database status: ${data.database} (may be OK for local dev)`, "info");
    }
    return data;
  });

  // --- Products (public) ---
  test("GET /products", async () => {
    const { status, data, ok } = await request("GET", "/products");
    if (!ok || status !== 200) {
      throw new Error(`Expected 200, got ${status}`);
    }
    if (!data?.success || (!Array.isArray(data?.data) && typeof data?.count !== "number")) {
      throw new Error("Products response should have success and data array (or count)");
    }
    return data;
  });

  // --- Optional: Auth flow (only for dev bypass number to avoid sending real OTP) ---
  const testPhone = process.env.TEST_PHONE || process.env.TEST_PHONE_NUMBER;
  if (testPhone) {
    test("POST /auth/login (send OTP)", async () => {
      const { status, data, ok } = await request("POST", "/auth/login", { phoneNumber: testPhone });
      if (!ok && status !== 200) {
        throw new Error(`Login request failed: ${status}`);
      }
      return data;
    });

    test("POST /auth/verify-otp (dev bypass 123456)", async () => {
      const { status, data, ok } = await request("POST", "/auth/verify-otp", {
        phoneNumber: testPhone,
        otp: "123456",
      });
      if (!ok || status !== 200) {
        throw new Error(`Verify OTP failed: ${status} – use TEST_PHONE=0705686573 for dev bypass`);
      }
      if (!data?.token || !data?.user) {
        throw new Error("Expected token and user in response");
      }
      return data;
    });
  } else {
    log("Skipping auth tests (set TEST_PHONE=0705686573 to test login + verify-otp)", "info");
  }

  // --- Run all ---
  for (const { name, fn } of tests) {
    try {
      await fn();
      log(`${name}`, "ok");
      passed++;
    } catch (err) {
      log(`${name}: ${err.message}`, "fail");
      failed++;
    }
  }

  console.log("\n---");
  console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${tests.length}`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log("Smoke test passed.\n");
}

run().catch((err) => {
  console.error("Smoke test error:", err);
  process.exit(1);
});
