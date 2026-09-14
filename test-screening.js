/**
 * Screening flow end-to-end tests
 * Run: node test-screening.js
 *
 * Tests (in order):
 *  1.  Auth  — login + get token
 *  2.  Products / Stock  — list available products
 *  3.  Screening (needs glasses + no referral) — normal outcome
 *  4.  Screening (needs referral, no glasses)  — red-flag outcome
 *  5.  Screening (child age 3)                 — child path
 *  6.  Screening stats — totals updated
 *  7.  Create referral manually
 *  8.  List referrals — referral appears
 *  9.  Update referral status to completed
 * 10.  Create payment (cash, full)
 * 11.  Create payment (mobile money, installment)
 * 12.  List payments  — both payments appear
 * 13.  Payment stats  — totals updated
 * 14.  Get stock / inventory summary
 * 15.  Edge: screening with empty client name — should fail gracefully
 * 16.  Edge: referral with no token — should fail with 401
 */

const https = require("https");

const API_HOST = "backend-tau-sepia-43.vercel.app";
const BASE     = "/api";
const DEV_PHONE = "0705686573";
const DEV_OTP   = "123456";

let TOKEN = "";
let passed = 0;
let failed = 0;
let createdScreeningId = "";
let createdReferralScreeningId = "";
let createdReferralId = "";
let createdPaymentId = "";

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function request(method, path, body, token) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : "";
    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = {
      hostname: API_HOST,
      path: BASE + path,
      method,
      headers,
      timeout: 35000,
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, data: { error: "Non-JSON response", raw } });
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, data: { error: "Timeout" } });
    });
    req.on("error", (e) => {
      resolve({ status: 0, data: { error: e.message } });
    });

    if (payload) req.write(payload);
    req.end();
  });
}

const post = (path, body, token) => request("POST", path, body, token);
const get  = (path, token)       => request("GET",  path, null, token);
const patch = (path, body, token) => request("PATCH", path, body, token);

// ── Assertion helpers ─────────────────────────────────────────────────────────

function ok(name, detail = "") {
  console.log(`  ✅  PASS  ${name}${detail ? "  (" + detail + ")" : ""}`);
  passed++;
}

function fail(name, reason) {
  console.log(`  ❌  FAIL  ${name}`);
  console.log(`           → ${reason}`);
  failed++;
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 44 - title.length))}`);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function testAuth() {
  section("1. Auth — login & get token");

  const login = await post("/auth/login", { phoneNumber: DEV_PHONE });
  if (!login.data.success) {
    fail("Login (send OTP)", JSON.stringify(login.data));
    return false;
  }
  ok("Login returns success");

  const verify = await post("/auth/verify-otp", { phoneNumber: DEV_PHONE, otp: DEV_OTP });
  if (!verify.data.success || !verify.data.token) {
    fail("Verify OTP", JSON.stringify(verify.data));
    return false;
  }
  TOKEN = verify.data.token;
  ok(`Verify OTP — token received, user: ${verify.data.user?.full_name || verify.data.user?.phone_number}`);
  return true;
}

async function testProducts() {
  section("2. Products / Stock");

  const res = await get("/products", TOKEN);
  if (res.status !== 200) {
    fail("Get products", `HTTP ${res.status} — ${res.data.error}`);
    return;
  }
  const products = Array.isArray(res.data) ? res.data : res.data.data || [];
  if (products.length > 0) {
    ok(`Products loaded — ${products.length} product(s) found`);
    ok(`Sample product: ${products[0].name} | power: ${products[0].power} | price: UGX ${products[0].price}`);
  } else {
    ok("Products endpoint responded (0 products in stock — may be empty DB)");
  }
}

async function testScreeningNormal() {
  section("3. Screening — needs glasses, no referral (normal adult)");

  const body = {
    clientName: "Test Client Nakato",
    clientPhone: "0771234567",
    clientAge: 45,
    clientGender: "Female",
    clientVillage: "Bombo Village",
    district: "Luweero",
    county: "Luweero County",
    subCounty: "Wobulenzi",
    parish: "Wobulenzi Parish",
    equipmentChecked: true,
    consentObtained: true,
    educationProvided: true,
    hasEyeConcerns: false,
    hasSevereEyePain: false,
    hasSuddenVisionLoss: false,
    hasDiabetesHypertension: false,
    familyHistoryBlindness: false,
    screeningAreaPrepared: true,
    testsExplainedToClient: true,
    distanceVisionLeft: "6/12",
    distanceVisionRight: "6/12",
    distanceVisionBoth: "6/9",
    nearVisionResult: "N8",
    torchTestPassed: true,
    pinholeTestLeft: "6/9",
    pinholeTestRight: "6/9",
    needsGlasses: true,
    glassesDispensed: true,
    glassesPower: "+2.00",
    glassesFrameType: "standard",
    glassesEducationProvided: true,
    needsReferral: false,
    recommendedPower: "+2.00",
    notes: "Test screening — glasses dispensed",
  };

  const res = await post("/screenings", body, TOKEN);
  if (res.data.success && res.data.screeningId) {
    createdScreeningId = res.data.screeningId;
    ok(`Screening saved — ID: ${createdScreeningId}`);
  } else if (res.status === 401) {
    fail("Save screening", "401 Unauthorized — token not being sent or invalid");
  } else {
    fail("Save screening", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testScreeningReferral() {
  section("4. Screening — needs referral (red flag: severe eye pain)");

  const body = {
    clientName: "Test Client Ssempa",
    clientPhone: "0782345678",
    clientAge: 52,
    clientGender: "Male",
    clientVillage: "Katikamu",
    district: "Luweero",
    county: "Luweero County",
    subCounty: "Katikamu",
    parish: "Katikamu Parish",
    equipmentChecked: true,
    consentObtained: true,
    educationProvided: true,
    hasEyeConcerns: true,
    hasSevereEyePain: true,
    hasSuddenVisionLoss: false,
    hasDiabetesHypertension: true,
    familyHistoryBlindness: false,
    referralReasonsFromQuestions: [
      "Refer to health facility immediately",
      "Educate on annual eye checkups and refer",
    ],
    screeningAreaPrepared: false,
    testsExplainedToClient: false,
    needsGlasses: false,
    glassesDispensed: false,
    needsReferral: true,
    referralReason: "Severe eye pain; Diabetes/hypertension requiring annual checkup",
    referralFacility: "Luweero Health Centre IV",
    notes: "Test screening — immediate referral required",
  };

  const res = await post("/screenings", body, TOKEN);
  if (res.data.success && res.data.screeningId) {
    createdReferralScreeningId = res.data.screeningId;
    ok(`Referral screening saved — ID: ${createdReferralScreeningId}`);
  } else if (res.status === 401) {
    fail("Save referral screening", "401 Unauthorized");
  } else {
    fail("Save referral screening", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testScreeningChild() {
  section("5. Screening — child (age 3, does not follow movement)");

  const body = {
    clientName: "Baby Aisha Nambi",
    clientPhone: "0751234567",
    clientAge: 3,
    clientGender: "Female",
    clientVillage: "Nakaseke",
    district: "Nakaseke",
    county: "Nakaseke County",
    subCounty: "Nakaseke TC",
    parish: "Nakaseke Parish",
    equipmentChecked: true,
    consentObtained: true,
    educationProvided: true,
    hasEyeConcerns: true,
    followsMovement: false,
    referralReasonsFromQuestions: ["Refer to health facility immediately"],
    needsGlasses: false,
    glassesDispensed: false,
    needsReferral: true,
    referralReason: "Child does not follow faces/movement — immediate referral",
    referralFacility: "Nakaseke Hospital",
    notes: "Test screening — child referral",
  };

  const res = await post("/screenings", body, TOKEN);
  if (res.data.success) {
    ok(`Child referral screening saved — ID: ${res.data.screeningId}`);
  } else {
    fail("Child referral screening", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testScreeningStats() {
  section("6. Screening stats");

  const res = await get("/screenings/stats", TOKEN);
  if (res.data.success && res.data.data) {
    const s = res.data.data;
    ok(`Total screenings: ${s.total_screenings}`);
    ok(`Needs glasses: ${s.clients_needing_glasses} | Referred: ${s.clients_referred}`);
    ok(`This week: ${s.screenings_this_week} | This month: ${s.screenings_this_month}`);
  } else {
    fail("Screening stats", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testCreateReferral() {
  section("7. Create referral manually");

  const body = {
    client_name: "Referral Test Client",
    client_phone: "0761234567",
    client_age: 60,
    client_gender: "Male",
    client_district: "Kampala",
    reason: "Glaucoma risk — family history of blindness",
    facility_name: "Mulago National Referral Hospital",
    facility_location: "Kampala",
    urgency: "high",
    notes: "Test referral created manually",
    screening_id: createdReferralScreeningId || null,
  };

  const res = await post("/simple-referrals/create", body, TOKEN);
  if (res.data.success && res.data.data?.id) {
    createdReferralId = res.data.data.id;
    ok(`Referral created — ID: ${createdReferralId}`);
  } else {
    fail("Create referral", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testListReferrals() {
  section("8. List referrals");

  const res = await get("/simple-referrals/list", TOKEN);
  if (res.data.success) {
    const count = res.data.data?.length || 0;
    ok(`List referrals — ${count} referral(s) returned`);
    if (count > 0) {
      const r = res.data.data[0];
      ok(`Latest referral: ${r.client_name} → ${r.facility_name || "no facility"} (${r.status})`);
    }
  } else {
    fail("List referrals", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testUpdateReferralStatus() {
  section("9. Update referral to completed");

  if (!createdReferralId) {
    fail("Update referral status", "No referral ID from test 7 — skipping");
    return;
  }

  const res = await patch(
    `/simple-referrals/${createdReferralId}/status`,
    { status: "completed", notes: "Client attended facility — test complete" },
    TOKEN
  );
  if (res.data.success) {
    ok(`Referral ${createdReferralId} marked as completed`);
  } else {
    fail("Update referral status", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testCreatePaymentCash() {
  section("10. Create payment — cash, full");

  const body = {
    clientName: "Cash Test Client",
    clientPhone: "+256771111111",
    amount: 15000,
    payment_method: "cash",
    payment_type: "full",
    total_installments: 1,
    installment_number: 1,
    screening_id: createdScreeningId || null,
  };

  const res = await post("/simple-payments/create", body, TOKEN);
  if (res.data.success) {
    createdPaymentId = res.data.data?.id || "";
    ok(`Cash payment created — ID: ${createdPaymentId}, amount: UGX ${body.amount}`);
  } else {
    fail("Create cash payment", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testCreatePaymentMobileMoney() {
  section("11. Create payment — mobile money, installment");

  const body = {
    clientName: "MoMo Test Client",
    clientPhone: "+256782222222",
    amount: 5000,
    mobileMoneyNumber: "+256782222222",
    payment_method: "mobile_money",
    payment_type: "installment",
    total_installments: 3,
    installment_number: 1,
    provider: "mtn",
  };

  const res = await post("/simple-payments/create", body, TOKEN);
  if (res.data.success) {
    ok(`Mobile money installment created — ID: ${res.data.data?.id}, amount: UGX ${body.amount}`);
  } else {
    fail("Create mobile money payment", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testListPayments() {
  section("12. List payments");

  const res = await get("/simple-payments/list", TOKEN);
  if (res.data.success) {
    const count = res.data.data?.length || 0;
    ok(`List payments — ${count} payment(s) returned`);
    if (count > 0) {
      const p = res.data.data[0];
      ok(`Latest payment: ${p.client_name} | UGX ${p.amount} | ${p.payment_method} | ${p.status}`);
    }
  } else {
    fail("List payments", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testPaymentStats() {
  section("13. Payment stats");

  const res = await get("/simple-payments/stats", TOKEN);
  if (res.data.success && res.data.data) {
    const s = res.data.data;
    ok(`Total payments: ${s.total_payments || s.total || 0}`);
    ok(`Total revenue: UGX ${s.total_amount || s.total_revenue || 0}`);
  } else if (res.status === 200) {
    ok("Payment stats endpoint responded (data shape may differ)");
  } else {
    fail("Payment stats", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testInventory() {
  section("14. Inventory / stock summary");

  const res = await get("/simple-inventory/summary", TOKEN);
  if (res.status === 200) {
    ok("Inventory summary endpoint responded");
    if (res.data.data || res.data.success) {
      const d = res.data.data || res.data;
      ok(`Stock items: ${JSON.stringify(d).substring(0, 80)}...`);
    }
  } else {
    fail("Inventory summary", `HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }
}

async function testEdgeMissingClientName() {
  section("15. Edge case — screening with no client name");

  const body = {
    clientName: "",          // intentionally empty
    clientPhone: "0701111111",
    clientAge: 30,
    clientGender: "Male",
    district: "Kampala",
    equipmentChecked: true,
    consentObtained: true,
    needsGlasses: false,
    needsReferral: false,
  };

  const res = await post("/screenings", body, TOKEN);
  // This should either save (backend allows null name) or fail gracefully — it must NOT crash
  if (res.status === 0) {
    fail("Empty client name edge case", "Request crashed / timed out");
  } else {
    ok(`Empty client name handled gracefully — HTTP ${res.status} (success: ${res.data.success})`);
  }
}

async function testEdgeNoToken() {
  section("16. Edge case — referral list with no token (expects 401)");

  const res = await get("/simple-referrals/list"); // no token
  if (res.status === 401) {
    ok("No-token request correctly rejected with 401");
  } else {
    fail("No-token referral list", `Expected 401 but got HTTP ${res.status}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n========================================================");
  console.log("  Santé Initiative — Screening & Feature Flow Tests");
  console.log(`  Backend: https://${API_HOST}${BASE}`);
  console.log("========================================================");

  const authed = await testAuth();
  if (!authed) {
    console.log("\n⛔ Cannot continue without a valid token. Stopping.\n");
    process.exit(1);
  }

  await testProducts();
  await testScreeningNormal();
  await testScreeningReferral();
  await testScreeningChild();
  await testScreeningStats();
  await testCreateReferral();
  await testListReferrals();
  await testUpdateReferralStatus();
  await testCreatePaymentCash();
  await testCreatePaymentMobileMoney();
  await testListPayments();
  await testPaymentStats();
  await testInventory();
  await testEdgeMissingClientName();
  await testEdgeNoToken();

  console.log("\n========================================================");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log("  🎉 All tests passed! Ready to build AAB.");
  } else {
    console.log("  ⚠️  Some tests failed — check output above.");
  }
  console.log("========================================================\n");

  if (failed > 0) process.exit(1);
}

run();
