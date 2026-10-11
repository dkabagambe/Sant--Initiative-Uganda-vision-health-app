/**
 * scripts/seed-demo-accounts.js
 *
 * Creates / refreshes the three Play Store reviewer demo accounts.
 *
 * Schema source-of-truth: live information_schema query run 2026-10-11.
 * NOT NULL columns without defaults (the only ones that can cause failures):
 *   payments : amount, mobile_money_number
 *   referrals: reason
 *   users    : phone_number
 *   vht_stock: health_worker_id, product_id  (PK — always provided)
 *
 * Guarantees:
 *   - DRY_RUN=true prints every statement, exits without touching the DB.
 *   - Live run wraps ALL mutations in a single pg transaction (BEGIN/COMMIT).
 *     Any error triggers ROLLBACK — no half-created state.
 *   - Safe to run twice: users are upserted; child rows are deleted then
 *     re-inserted scoped to the three demo user IDs + client_name 'Demo %'.
 *   - Never touches rows owned by other users.
 */

"use strict";
require("dotenv").config();

// ── Guards ────────────────────────────────────────────────────────────────────
const isDemoEnabled = ["true","1","yes"].includes(
  String(process.env.DEMO_LOGIN_ENABLED || "").toLowerCase()
);
if (!isDemoEnabled) {
  console.error("❌  DEMO_LOGIN_ENABLED is not 'true'. Aborting.");
  process.exit(1);
}

const CHW_PHONE    = process.env.DEMO_CHW_PHONE;
const OUTLET_PHONE = process.env.DEMO_OUTLET_PHONE;
const VSLA_PHONE   = process.env.DEMO_VSLA_PHONE;

if (!CHW_PHONE || !OUTLET_PHONE || !VSLA_PHONE) {
  console.error("❌  DEMO_CHW_PHONE, DEMO_OUTLET_PHONE and DEMO_VSLA_PHONE must all be set.");
  process.exit(1);
}

const dbUrl = (process.env.DATABASE_URL || "").trim();
if (!dbUrl.startsWith("postgres")) {
  console.error("❌  DATABASE_URL is not set or is not a Postgres URL.");
  process.exit(1);
}

const DRY_RUN = ["true","1","yes"].includes(
  String(process.env.DRY_RUN || "").toLowerCase()
);

// ── Phone → 0XXXXXXXXX (10 digits, canonical app format) ─────────────────────
const toCanonical = (p) => {
  const d = String(p).replace(/\D/g, "");
  if (d.startsWith("256") && d.length >= 12) return `0${d.slice(3, 12)}`;
  if (d.startsWith("0")   && d.length === 10) return d;
  if (d.length === 9) return `0${d}`;
  return `0${d.slice(-9)}`;
};

const CHW_PHONE_C    = toCanonical(CHW_PHONE);
const OUTLET_PHONE_C = toCanonical(OUTLET_PHONE);
const VSLA_PHONE_C   = toCanonical(VSLA_PHONE);

// ── DRY RUN ───────────────────────────────────────────────────────────────────
if (DRY_RUN) {
  console.log("=== DRY RUN — statements that will run inside one transaction ===\n");

  console.log("-- BEGIN\n");

  console.log("-- [1] UPSERT 3 demo users");
  console.log(`--     users columns used: phone_number, full_name, first_name, last_name,`);
  console.log(`--       role, district, sub_county, village, organization_name, business_name`);
  console.log(`--     CHW    : phone=${CHW_PHONE_C}  role=health_worker`);
  console.log(`--     Outlet : phone=${OUTLET_PHONE_C} role=outlet`);
  console.log(`--     VSLA   : phone=${VSLA_PHONE_C}  role=vsla`);
  console.log(`--     ON CONFLICT (phone_number) DO UPDATE SET name/role/district/...\n`);

  console.log("-- [2] DELETE old demo child rows (scoped to demo user IDs + client_name ILIKE 'Demo %')");
  console.log("--     DELETE FROM payments  WHERE health_worker_id IN (chw,outlet,vsla) AND client_name ILIKE 'Demo %'");
  console.log("--     DELETE FROM referrals WHERE health_worker_id IN (chw,vsla)        AND client_name ILIKE 'Demo %'");
  console.log("--     DELETE FROM screenings WHERE health_worker_id IN (chw,vsla)       AND client_name ILIKE 'Demo %'");
  console.log("--     DELETE FROM vht_stock  WHERE health_worker_id IN (chw,outlet)\n");

  console.log("-- [3] INSERT 3 CHW screenings");
  console.log("--     columns: health_worker_id, client_name, client_phone, client_age,");
  console.log("--       client_gender, client_village, client_district, equipment_checked,");
  console.log("--       consent_obtained, education_provided, has_eye_concerns,");
  console.log("--       distance_vision_left, distance_vision_right, near_vision_result,");
  console.log("--       needs_glasses, glasses_dispensed, glasses_power, glasses_frame_type,");
  console.log("--       recommended_product_id, screening_date, is_synced, notes\n");

  console.log("-- [4] INSERT 1 pending referral (linked to CHW screening 0)");
  console.log("--     columns: screening_id, health_worker_id, client_name, client_phone,");
  console.log("--       client_age, client_gender, client_district, reason, urgency,");
  console.log("--       facility_name, status, referred_date\n");

  console.log("-- [5] INSERT vht_stock for CHW (qty=15) and Outlet (qty=40)");
  console.log("--     columns: health_worker_id, product_id, stock_quantity,");
  console.log("--       stock_standard, stock_metal, stock_fashion");
  console.log("--     ON CONFLICT (health_worker_id, product_id) DO UPDATE SET ...\n");

  console.log("-- [6] INSERT 3 CHW payments");
  console.log("--     columns: screening_id, product_id, health_worker_id, client_name,");
  console.log("--       client_phone, amount, currency, mobile_money_number, status,");
  console.log("--       payment_method, payment_type, payment_date, created_at");
  console.log("--     mobile_money_number: '0700000199' (fictional, NOT NULL required)\n");

  console.log("-- [7] INSERT 3 Outlet payments (no screening_id)");
  console.log("--     same columns as [6], mobile_money_number='0700000199'\n");

  console.log("-- [8] INSERT 3 VSLA screenings");
  console.log("--     same columns as [3] but no glasses/vision fields\n");

  console.log("-- COMMIT\n");
  console.log(`Phones: CHW=${CHW_PHONE_C}  Outlet=${OUTLET_PHONE_C}  VSLA=${VSLA_PHONE_C}`);
  console.log("\nRe-run without DRY_RUN=true to apply.");
  process.exit(0);
}

// ── Live run ──────────────────────────────────────────────────────────────────
// Use the pg driver directly so we can use a real BEGIN/COMMIT transaction.
// @neondatabase/serverless works over HTTP and does not support multi-statement
// transactions through the tagged-template interface.
const { Pool } = require("pg");
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function run() {
  console.log("🌱  Seeding Play Store demo accounts…\n");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── [1] Upsert 3 demo users ───────────────────────────────────────────────
    // Only columns confirmed present on the live DB.
    const upsertUser = async (phone, fullName, firstName, lastName, role, district, extra) => {
      const res = await client.query(`
        INSERT INTO users (
          phone_number, full_name, first_name, last_name, role, district,
          sub_county, village, organization_name, business_name
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
      `, [
        phone, fullName, firstName, lastName, role, district,
        extra.sub_county    || null,
        extra.village       || null,
        extra.org_name      || null,
        extra.business_name || null,
      ]);
      return res.rows[0];
    };

    const chwUser    = await upsertUser(CHW_PHONE_C,    "Demo Nalubega Fatuma", "Fatuma", "Nalubega", "health_worker", "Wakiso",  { sub_county: "Nansana", village: "Demo Village A" });
    const outletUser = await upsertUser(OUTLET_PHONE_C, "Demo Ssemakula Brian", "Brian",  "Ssemakula","outlet",        "Kampala", { business_name: "Demo Optics Centre" });
    const vslaUser   = await upsertUser(VSLA_PHONE_C,   "Demo Akello Grace",    "Grace",  "Akello",   "vsla",          "Gulu",    { org_name: "Demo Sunrise Savings Group" });

    // ── [2] Delete old demo child rows ────────────────────────────────────────
    await client.query(`DELETE FROM payments  WHERE health_worker_id = ANY($1::uuid[]) AND client_name ILIKE 'Demo %'`, [[chwUser.id, outletUser.id, vslaUser.id]]);
    await client.query(`DELETE FROM referrals WHERE health_worker_id = ANY($1::uuid[]) AND client_name ILIKE 'Demo %'`, [[chwUser.id, vslaUser.id]]);
    await client.query(`DELETE FROM screenings WHERE health_worker_id = ANY($1::uuid[]) AND client_name ILIKE 'Demo %'`, [[chwUser.id, vslaUser.id]]);
    await client.query(`DELETE FROM vht_stock  WHERE health_worker_id = ANY($1::uuid[])`, [[chwUser.id, outletUser.id]]);

    // ── Ensure a product exists for FK + stock references ─────────────────────
    let prodRes = await client.query(`SELECT id, name FROM products ORDER BY price ASC LIMIT 1`);
    let productId;
    if (prodRes.rows.length === 0) {
      const p = await client.query(`
        INSERT INTO products (name, power, price, stock_quantity, category)
        VALUES ('Reading Glasses +1.50', '+1.50', 15000, 50, 'reading_glasses')
        RETURNING id, name
      `);
      productId = p.rows[0].id;
      console.log(`   Created product: ${p.rows[0].name}`);
    } else {
      productId = prodRes.rows[0].id;
    }

    // ── [3] CHW screenings ────────────────────────────────────────────────────
    const chwClients = [
      { name: "Demo Apio Margaret",  phone: "0770000001", age: 52, gender: "Female", village: "Demo Bunamwaya" },
      { name: "Demo Okello Peter",   phone: "0770000002", age: 67, gender: "Male",   village: "Demo Lungujja"  },
      { name: "Demo Nabukenya Rose", phone: "0770000003", age: 44, gender: "Female", village: "Demo Kireka"    },
    ];

    const screeningIds = [];
    for (const c of chwClients) {
      const r = await client.query(`
        INSERT INTO screenings (
          health_worker_id, client_name, client_phone, client_age, client_gender,
          client_village, client_district,
          equipment_checked, consent_obtained, education_provided, has_eye_concerns,
          distance_vision_left, distance_vision_right, near_vision_result,
          needs_glasses, glasses_dispensed, glasses_power, glasses_frame_type,
          recommended_product_id, screening_date, is_synced, notes
        ) VALUES (
          $1,$2,$3,$4,$5,
          $6,'Wakiso',
          true,true,true,true,
          '6/9','6/12','N8',
          true,true,'+1.50','standard',
          $7, CURRENT_DATE - INTERVAL '7 days', true,
          'Demo screening — fictional data only'
        ) RETURNING id
      `, [chwUser.id, c.name, c.phone, c.age, c.gender, c.village, productId]);
      screeningIds.push(r.rows[0].id);
    }

    // ── [4] Pending referral ──────────────────────────────────────────────────
    const refRes = await client.query(`
      INSERT INTO referrals (
        screening_id, health_worker_id,
        client_name, client_phone, client_age, client_gender, client_district,
        reason, urgency, facility_name, status, referred_date
      ) VALUES (
        $1,$2,
        'Demo Apio Margaret','0770000001',52,'Female','Wakiso',
        'Suspected cataract — needs specialist review',
        'urgent','Demo District Hospital','pending',
        CURRENT_DATE - INTERVAL '3 days'
      ) RETURNING id
    `, [screeningIds[0], chwUser.id]);

    // ── [5] VHT stock ─────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO vht_stock (health_worker_id, product_id, stock_quantity, stock_standard, stock_metal, stock_fashion)
      VALUES ($1,$2,15,6,6,3)
      ON CONFLICT (health_worker_id, product_id) DO UPDATE SET
        stock_quantity=15, stock_standard=6, stock_metal=6, stock_fashion=3
    `, [chwUser.id, productId]);

    await client.query(`
      INSERT INTO vht_stock (health_worker_id, product_id, stock_quantity, stock_standard, stock_metal, stock_fashion)
      VALUES ($1,$2,40,16,14,10)
      ON CONFLICT (health_worker_id, product_id) DO UPDATE SET
        stock_quantity=40, stock_standard=16, stock_metal=14, stock_fashion=10
    `, [outletUser.id, productId]);

    // ── [6] CHW payments (mobile_money_number is NOT NULL — use fictional value) ──
    // cash payments get same fictional number (field is required regardless of method)
    const DEMO_MMNO = "0700000199";
    await client.query(`
      INSERT INTO payments (
        screening_id, product_id, health_worker_id,
        client_name, client_phone, amount, currency,
        mobile_money_number, status, payment_method, payment_type,
        payment_date, created_at
      ) VALUES
        ($1,$2,$3,'Demo Okello Peter',  '0770000002',15000,'UGX',$4,'completed','mobile_money','full', CURRENT_DATE-INTERVAL '6 days',NOW()),
        ($5,$2,$3,'Demo Nabukenya Rose','0770000003',15000,'UGX',$4,'completed','mobile_money','full', CURRENT_DATE-INTERVAL '4 days',NOW()),
        ($6,$2,$3,'Demo Apio Margaret', '0770000001', 7500,'UGX',$4,'pending',  'cash',        'installment', NULL,                  NOW())
    `, [screeningIds[1], productId, chwUser.id, DEMO_MMNO, screeningIds[2], screeningIds[0]]);

    // ── [7] Outlet payments ───────────────────────────────────────────────────
    await client.query(`
      INSERT INTO payments (
        product_id, health_worker_id,
        client_name, client_phone, amount, currency,
        mobile_money_number, status, payment_method, payment_type,
        payment_date, created_at
      ) VALUES
        ($1,$2,'Demo Mugenyi Daniel', '0780000011',15000,'UGX',$3,'completed','mobile_money','full', CURRENT_DATE-INTERVAL '2 days',NOW()),
        ($1,$2,'Demo Nakato Sarah',   '0780000012',15000,'UGX',$3,'completed','mobile_money','full', CURRENT_DATE-INTERVAL '5 days',NOW()),
        ($1,$2,'Demo Byamugisha John','0780000013', 7500,'UGX',$3,'pending',  'cash',        'installment', NULL,                  NOW())
    `, [productId, outletUser.id, DEMO_MMNO]);

    // ── [8] VSLA screenings ───────────────────────────────────────────────────
    const vslaMembers = [
      { name: "Demo Amito Judith",  phone: "0790000021", age: 38, gender: "Female" },
      { name: "Demo Oryem Charles", phone: "0790000022", age: 45, gender: "Male"   },
      { name: "Demo Lamwaka Peace", phone: "0790000023", age: 29, gender: "Female" },
    ];
    for (const m of vslaMembers) {
      await client.query(`
        INSERT INTO screenings (
          health_worker_id, client_name, client_phone, client_age, client_gender,
          client_district, needs_glasses, screening_date, is_synced, notes
        ) VALUES ($1,$2,$3,$4,$5,'Gulu',false,CURRENT_DATE-INTERVAL '10 days',true,'Demo VSLA member record — fictional data only')
      `, [vslaUser.id, m.name, m.phone, m.age, m.gender]);
    }

    // ── COMMIT ────────────────────────────────────────────────────────────────
    await client.query("COMMIT");

    // Print summary only after successful commit
    console.log(`✓ CHW    user upserted : ${chwUser.phone_number}  (id: ${chwUser.id})`);
    console.log(`✓ Outlet user upserted : ${outletUser.phone_number}  (id: ${outletUser.id})`);
    console.log(`✓ VSLA   user upserted : ${vslaUser.phone_number}  (id: ${vslaUser.id})`);
    console.log(`✓ 3 CHW screenings inserted`);
    console.log(`✓ 1 pending referral inserted (id: ${refRes.rows[0].id})`);
    console.log(`✓ VHT stock: CHW=15, Outlet=40`);
    console.log(`✓ 3 CHW payments inserted (2 completed, 1 pending)`);
    console.log(`✓ 3 Outlet payments inserted (2 completed, 1 pending)`);
    console.log(`✓ 3 VSLA member screenings inserted`);
    console.log("\n✅  Demo seed committed successfully.\n");
    console.log(`   CHW    login : ${CHW_PHONE_C}  → role: health_worker`);
    console.log(`   Outlet login : ${OUTLET_PHONE_C} → role: outlet`);
    console.log(`   VSLA   login : ${VSLA_PHONE_C}  → role: vsla`);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n❌  Seed FAILED — transaction rolled back. Database is unchanged.");
    console.error("    Error:", err.message);
    if (err.message.includes("column") && err.message.includes("does not exist")) {
      console.error("    Hint: run 'DRY_RUN=true node scripts/seed-demo-accounts.js' to review column names.");
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
