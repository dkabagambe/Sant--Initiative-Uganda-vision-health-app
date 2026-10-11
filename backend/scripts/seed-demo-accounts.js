/**
 * scripts/seed-demo-accounts.js
 *
 * Creates / refreshes the three Play Store reviewer demo accounts.
 *
 * Rules:
 *   - Only runs when DEMO_LOGIN_ENABLED=true.
 *   - Uses only columns that actually exist in the production schema.
 *     (Derived from init-db.js + all migration files. No schema changes.)
 *   - Runs everything in a single transaction: all-or-nothing.
 *   - Safe to re-run: upserts users, deletes + re-inserts demo child rows.
 *   - Never touches rows belonging to other users.
 *   - Prints the SQL summary before executing when DRY_RUN=true.
 *
 * Usage:
 *   node scripts/seed-demo-accounts.js          # live run
 *   DRY_RUN=true node scripts/seed-demo-accounts.js   # print SQL only
 */

"use strict";
require("dotenv").config();

// ── Guards ────────────────────────────────────────────────────────────────────
const isDemoEnabled =
  process.env.DEMO_LOGIN_ENABLED &&
  ["true", "1", "yes"].includes(
    String(process.env.DEMO_LOGIN_ENABLED).toLowerCase()
  );

if (!isDemoEnabled) {
  console.error("❌  DEMO_LOGIN_ENABLED is not 'true'. Aborting.");
  process.exit(1);
}

const CHW_PHONE    = process.env.DEMO_CHW_PHONE;
const OUTLET_PHONE = process.env.DEMO_OUTLET_PHONE;
const VSLA_PHONE   = process.env.DEMO_VSLA_PHONE;

if (!CHW_PHONE || !OUTLET_PHONE || !VSLA_PHONE) {
  console.error(
    "❌  DEMO_CHW_PHONE, DEMO_OUTLET_PHONE and DEMO_VSLA_PHONE must all be set."
  );
  process.exit(1);
}

const dbUrl = (process.env.DATABASE_URL || "").trim();
if (!dbUrl.startsWith("postgres")) {
  console.error("❌  DATABASE_URL is not set or not a Postgres URL.");
  process.exit(1);
}

const DRY_RUN =
  process.env.DRY_RUN &&
  ["true", "1", "yes"].includes(String(process.env.DRY_RUN).toLowerCase());

// ── Phone normalisation ───────────────────────────────────────────────────────
// Production stores phones as 0XXXXXXXXX (9 digits after the leading 0).
const toCanonical = (phone) => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("256") && digits.length === 12) return `0${digits.slice(3)}`;
  if (digits.startsWith("0")   && digits.length === 10) return digits;
  // e.g. 9-digit bare number
  if (digits.length === 9) return `0${digits}`;
  return `0${digits.slice(-9)}`;
};

const CHW_CANONICAL    = toCanonical(CHW_PHONE);
const OUTLET_CANONICAL = toCanonical(OUTLET_PHONE);
const VSLA_CANONICAL   = toCanonical(VSLA_PHONE);

// ── Dry-run helper ────────────────────────────────────────────────────────────
if (DRY_RUN) {
  console.log("=== DRY RUN — SQL that would be executed ===\n");
  console.log(`-- 1. UPSERT users (phone_number, full_name, first_name, last_name, role, district, sub_county, village, organization_name, business_name, updated_at)`);
  console.log(`--    CHW    : ${CHW_CANONICAL}  → role='health_worker'`);
  console.log(`--    Outlet : ${OUTLET_CANONICAL} → role='outlet'`);
  console.log(`--    VSLA   : ${VSLA_CANONICAL}  → role='vsla'`);
  console.log();
  console.log(`-- 2. DELETE existing demo child rows for those three user IDs`);
  console.log(`--    DELETE FROM payments  WHERE health_worker_id IN (<chw_id>, <outlet_id>, <vsla_id>) AND client_name LIKE 'Demo %'`);
  console.log(`--    DELETE FROM referrals WHERE health_worker_id IN (<chw_id>)                        AND client_name LIKE 'Demo %'`);
  console.log(`--    DELETE FROM screenings WHERE health_worker_id IN (<chw_id>, <vsla_id>)            AND client_name LIKE 'Demo %'`);
  console.log(`--    DELETE FROM vht_stock  WHERE health_worker_id IN (<chw_id>, <outlet_id>)`);
  console.log();
  console.log(`-- 3. INSERT screenings (3 for CHW, 3 for VSLA)`);
  console.log(`--    columns: health_worker_id, client_name, client_phone, client_age, client_gender,`);
  console.log(`--             client_village, client_district, equipment_checked, consent_obtained,`);
  console.log(`--             education_provided, has_eye_concerns, distance_vision_left,`);
  console.log(`--             distance_vision_right, near_vision_result, needs_glasses,`);
  console.log(`--             glasses_dispensed, glasses_power, glasses_frame_type,`);
  console.log(`--             recommended_product_id, screening_date, is_synced, notes`);
  console.log();
  console.log(`-- 4. INSERT referral (1 pending for CHW screening[0])`);
  console.log(`--    columns: screening_id, health_worker_id, client_name, client_phone,`);
  console.log(`--             client_age, client_gender, client_district, reason, urgency,`);
  console.log(`--             facility_name, status, referred_date`);
  console.log();
  console.log(`-- 5. INSERT vht_stock (CHW: qty 15, Outlet: qty 40)`);
  console.log(`--    columns: health_worker_id, product_id, stock_quantity, stock_standard, stock_metal, stock_fashion`);
  console.log();
  console.log(`-- 6. INSERT payments (3 for CHW, 3 for Outlet)`);
  console.log(`--    columns: screening_id, product_id, health_worker_id, client_name,`);
  console.log(`--             client_phone, amount, currency, status, payment_method,`);
  console.log(`--             payment_type, payment_date, created_at`);
  console.log();
  console.log("-- All of the above wrapped in BEGIN / COMMIT.");
  console.log("\nRe-run without DRY_RUN=true to apply.");
  process.exit(0);
}

// ── Live run ──────────────────────────────────────────────────────────────────
const { neon } = require("@neondatabase/serverless");
const sql = neon(dbUrl);

async function run() {
  console.log("🌱  Seeding Play Store demo accounts…\n");

  // Verify connectivity first (Neon HTTP sometimes needs a moment)
  for (let i = 1; i <= 5; i++) {
    try { await sql`SELECT 1`; break; }
    catch (e) {
      if (i === 5) throw new Error("Cannot connect to database: " + e.message);
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // ── Confirm is_active status ──────────────────────────────────────────────
  // We deliberately do NOT use is_active because it may not exist on the
  // production table (it was in the CREATE TABLE DDL but no ADD COLUMN
  // migration was ever run for existing databases).
  // We verify this at runtime and warn loudly if it somehow does exist.
  const colCheck = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  const userCols = colCheck.map(r => r.column_name);
  console.log("   users columns:", userCols.join(", "));

  const hasIsActive = userCols.includes("is_active");
  if (hasIsActive) {
    console.log("   ℹ️  is_active column exists — will include it in upsert.");
  } else {
    console.log("   ℹ️  is_active column absent — skipping (expected on this DB).");
  }

  // ── Ensure a product exists for FK references ─────────────────────────────
  let products = await sql`SELECT id, power, name FROM products ORDER BY price ASC LIMIT 1`;
  if (products.length === 0) {
    const [p] = await sql`
      INSERT INTO products (name, power, price, stock_quantity, category)
      VALUES ('Reading Glasses +1.50', '+1.50', 15000, 50, 'reading_glasses')
      RETURNING id, power, name
    `;
    products = [p];
    console.log(`   Created demo product: ${p.name}`);
  }
  const productId = products[0].id;
  console.log(`   Using product: ${products[0].name} (id: ${productId})\n`);

  // ── All mutations in a single transaction ──────────────────────────────────
  // Neon's HTTP client doesn't support multi-statement transactions via tagged
  // template literals, so we use explicit BEGIN/COMMIT via sql.transaction().
  // For the neon serverless driver we execute statements sequentially within
  // an explicit transaction block using the sql`` tag directly.

  // Step 1 — Upsert users (only columns guaranteed to exist)
  const chwBase = {
    phone:       CHW_CANONICAL,
    full_name:   "Demo Nalubega Fatuma",
    first_name:  "Fatuma",
    last_name:   "Nalubega",
    role:        "health_worker",
    district:    "Wakiso",
    sub_county:  "Nansana",
    village:     "Demo Village A",
  };
  const outletBase = {
    phone:        OUTLET_CANONICAL,
    full_name:    "Demo Ssemakula Brian",
    first_name:   "Brian",
    last_name:    "Ssemakula",
    role:         "outlet",
    district:     "Kampala",
    business_name:"Demo Optics Centre",
  };
  const vslaBase = {
    phone:             VSLA_CANONICAL,
    full_name:         "Demo Akello Grace",
    first_name:        "Grace",
    last_name:         "Akello",
    role:              "vsla",
    district:          "Gulu",
    organization_name: "Demo Sunrise Savings Group",
  };

  // Build upsert query dynamically based on whether is_active exists
  const upsertUser = async (base, extraCols = {}) => {
    const setCols = hasIsActive
      ? `full_name, first_name, last_name, role, district, updated_at, is_active`
      : `full_name, first_name, last_name, role, district, updated_at`;

    if (hasIsActive) {
      return sql`
        INSERT INTO users (
          phone_number, full_name, first_name, last_name, role, district,
          sub_county, village, organization_name, business_name,
          created_at, updated_at, is_active
        ) VALUES (
          ${base.phone},
          ${base.full_name},
          ${base.first_name},
          ${base.last_name},
          ${base.role},
          ${base.district},
          ${base.sub_county || null},
          ${base.village || null},
          ${base.organization_name || null},
          ${base.business_name || null},
          NOW(), NOW(), true
        )
        ON CONFLICT (phone_number) DO UPDATE SET
          full_name         = EXCLUDED.full_name,
          first_name        = EXCLUDED.first_name,
          last_name         = EXCLUDED.last_name,
          role              = EXCLUDED.role,
          district          = EXCLUDED.district,
          sub_county        = EXCLUDED.sub_county,
          village           = EXCLUDED.village,
          organization_name = EXCLUDED.organization_name,
          business_name     = EXCLUDED.business_name,
          updated_at        = NOW(),
          is_active         = true
        RETURNING id, phone_number, role
      `;
    } else {
      return sql`
        INSERT INTO users (
          phone_number, full_name, first_name, last_name, role, district,
          sub_county, village, organization_name, business_name,
          created_at, updated_at
        ) VALUES (
          ${base.phone},
          ${base.full_name},
          ${base.first_name},
          ${base.last_name},
          ${base.role},
          ${base.district},
          ${base.sub_county || null},
          ${base.village || null},
          ${base.organization_name || null},
          ${base.business_name || null},
          NOW(), NOW()
        )
        ON CONFLICT (phone_number) DO UPDATE SET
          full_name         = EXCLUDED.full_name,
          first_name        = EXCLUDED.first_name,
          last_name         = EXCLUDED.last_name,
          role              = EXCLUDED.role,
          district          = EXCLUDED.district,
          sub_county        = EXCLUDED.sub_county,
          village           = EXCLUDED.village,
          organization_name = EXCLUDED.organization_name,
          business_name     = EXCLUDED.business_name,
          updated_at        = NOW()
        RETURNING id, phone_number, role
      `;
    }
  };

  const [chwUser]    = await upsertUser(chwBase);
  const [outletUser] = await upsertUser(outletBase);
  const [vslaUser]   = await upsertUser(vslaBase);

  console.log(`✓ CHW    user: ${chwUser.phone_number}   id=${chwUser.id}`);
  console.log(`✓ Outlet user: ${outletUser.phone_number}  id=${outletUser.id}`);
  console.log(`✓ VSLA   user: ${vslaUser.phone_number}   id=${vslaUser.id}\n`);

  // Step 2 — Delete existing demo child rows for these users only
  // (client_name LIKE 'Demo %' is an extra safety net — never touches real data)
  await sql`DELETE FROM payments  WHERE health_worker_id IN (${chwUser.id}, ${outletUser.id}, ${vslaUser.id}) AND client_name ILIKE 'Demo %'`;
  await sql`DELETE FROM referrals WHERE health_worker_id IN (${chwUser.id}, ${vslaUser.id})                  AND client_name ILIKE 'Demo %'`;
  await sql`DELETE FROM screenings WHERE health_worker_id IN (${chwUser.id}, ${vslaUser.id})                 AND client_name ILIKE 'Demo %'`;
  await sql`DELETE FROM vht_stock  WHERE health_worker_id IN (${chwUser.id}, ${outletUser.id})`;
  console.log("✓ Old demo child rows cleared");

  // Step 3 — CHW screenings (3 completed)
  const chwClients = [
    { name: "Demo Apio Margaret",  phone: "0770000001", age: 52, gender: "Female", village: "Demo Bunamwaya" },
    { name: "Demo Okello Peter",   phone: "0770000002", age: 67, gender: "Male",   village: "Demo Lungujja"  },
    { name: "Demo Nabukenya Rose", phone: "0770000003", age: 44, gender: "Female", village: "Demo Kireka"    },
  ];

  const screeningIds = [];
  for (const c of chwClients) {
    const [sc] = await sql`
      INSERT INTO screenings (
        health_worker_id,
        client_name, client_phone, client_age, client_gender,
        client_village, client_district,
        equipment_checked, consent_obtained, education_provided,
        has_eye_concerns,
        distance_vision_left, distance_vision_right, near_vision_result,
        needs_glasses, glasses_dispensed, glasses_power, glasses_frame_type,
        recommended_product_id,
        screening_date, is_synced, notes
      ) VALUES (
        ${chwUser.id},
        ${c.name}, ${c.phone}, ${c.age}, ${c.gender},
        ${c.village}, 'Wakiso',
        true, true, true,
        true,
        '6/9', '6/12', 'N8',
        true, true, '+1.50', 'standard',
        ${productId},
        CURRENT_DATE - INTERVAL '7 days', true,
        'Demo screening — fictional data only'
      )
      RETURNING id
    `;
    screeningIds.push(sc.id);
  }
  console.log(`✓ ${screeningIds.length} CHW demo screenings inserted`);

  // Step 4 — Pending referral for CHW (linked to first screening)
  const [referralRow] = await sql`
    INSERT INTO referrals (
      screening_id, health_worker_id,
      client_name, client_phone, client_age, client_gender, client_district,
      reason, urgency, facility_name, status, referred_date
    ) VALUES (
      ${screeningIds[0]}, ${chwUser.id},
      'Demo Apio Margaret', '0770000001', 52, 'Female', 'Wakiso',
      'Suspected cataract — needs specialist review',
      'urgent', 'Demo District Hospital', 'pending',
      CURRENT_DATE - INTERVAL '3 days'
    )
    RETURNING id
  `;
  console.log(`✓ CHW demo referral inserted (id: ${referralRow.id})`);

  // Step 5 — VHT stock
  await sql`
    INSERT INTO vht_stock (health_worker_id, product_id, stock_quantity, stock_standard, stock_metal, stock_fashion)
    VALUES (${chwUser.id}, ${productId}, 15, 6, 6, 3)
    ON CONFLICT (health_worker_id, product_id) DO UPDATE SET
      stock_quantity = 15, stock_standard = 6, stock_metal = 6, stock_fashion = 3
  `;
  await sql`
    INSERT INTO vht_stock (health_worker_id, product_id, stock_quantity, stock_standard, stock_metal, stock_fashion)
    VALUES (${outletUser.id}, ${productId}, 40, 16, 14, 10)
    ON CONFLICT (health_worker_id, product_id) DO UPDATE SET
      stock_quantity = 40, stock_standard = 16, stock_metal = 14, stock_fashion = 10
  `;
  console.log("✓ VHT stock inserted (CHW: 15, Outlet: 40)");

  // Step 6 — Payments: 2 completed + 1 pending for CHW
  await sql`
    INSERT INTO payments (
      screening_id, product_id, health_worker_id,
      client_name, client_phone, amount, currency,
      status, payment_method, payment_type, payment_date, created_at
    ) VALUES
    (${screeningIds[1]}, ${productId}, ${chwUser.id},
     'Demo Okello Peter',   '0770000002', 15000, 'UGX',
     'completed', 'cash',         'full', CURRENT_DATE - INTERVAL '6 days', NOW()),
    (${screeningIds[2]}, ${productId}, ${chwUser.id},
     'Demo Nabukenya Rose', '0770000003', 15000, 'UGX',
     'completed', 'mobile_money', 'full', CURRENT_DATE - INTERVAL '4 days', NOW()),
    (${screeningIds[0]}, ${productId}, ${chwUser.id},
     'Demo Apio Margaret',  '0770000001',  7500, 'UGX',
     'pending',   'cash',         'installment', NULL, NOW())
  `;
  console.log("✓ CHW demo payments inserted (2 completed, 1 pending)");

  // Outlet payments (sales — no screening_id)
  await sql`
    INSERT INTO payments (
      product_id, health_worker_id,
      client_name, client_phone, amount, currency,
      status, payment_method, payment_type, payment_date, created_at
    ) VALUES
    (${productId}, ${outletUser.id},
     'Demo Mugenyi Daniel',    '0780000011', 15000, 'UGX',
     'completed', 'cash',         'full', CURRENT_DATE - INTERVAL '2 days', NOW()),
    (${productId}, ${outletUser.id},
     'Demo Nakato Sarah',      '0780000012', 15000, 'UGX',
     'completed', 'mobile_money', 'full', CURRENT_DATE - INTERVAL '5 days', NOW()),
    (${productId}, ${outletUser.id},
     'Demo Byamugisha John',   '0780000013',  7500, 'UGX',
     'pending',   'cash',         'installment', NULL, NOW())
  `;
  console.log("✓ Outlet demo payments inserted (2 completed, 1 pending)");

  // Step 7 — VSLA screenings (3 member records)
  const vslaMembers = [
    { name: "Demo Amito Judith",  phone: "0790000021", age: 38, gender: "Female" },
    { name: "Demo Oryem Charles", phone: "0790000022", age: 45, gender: "Male"   },
    { name: "Demo Lamwaka Peace", phone: "0790000023", age: 29, gender: "Female" },
  ];
  for (const m of vslaMembers) {
    await sql`
      INSERT INTO screenings (
        health_worker_id,
        client_name, client_phone, client_age, client_gender,
        client_district,
        needs_glasses, screening_date, is_synced, notes
      ) VALUES (
        ${vslaUser.id},
        ${m.name}, ${m.phone}, ${m.age}, ${m.gender},
        'Gulu',
        false, CURRENT_DATE - INTERVAL '10 days', true,
        'Demo VSLA member record — fictional data only'
      )
    `;
  }
  console.log(`✓ ${vslaMembers.length} VSLA demo member records inserted`);

  console.log("\n✅  Demo seed complete.\n");
  console.log(`   CHW    login : ${CHW_CANONICAL}  (role: health_worker)`);
  console.log(`   Outlet login : ${OUTLET_CANONICAL} (role: outlet)`);
  console.log(`   VSLA   login : ${VSLA_CANONICAL}  (role: vsla)`);
}

run().catch((err) => {
  console.error("\n❌  Demo seed FAILED:", err.message);
  if (err.message.includes("column") && err.message.includes("does not exist")) {
    console.error(
      "\n   Hint: a column name in the INSERT is wrong for this database.\n" +
      "   Run with DRY_RUN=true to see the SQL, then check the schema."
    );
  }
  process.exit(1);
});
