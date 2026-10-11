/**
 * seed-demo-accounts.js
 *
 * Creates / refreshes the three Play Store reviewer demo accounts (CHW, Outlet, VSLA)
 * with realistic but entirely fictional data.
 *
 * Rules:
 *   - Only runs when DEMO_LOGIN_ENABLED=true.
 *   - Reads phone numbers from DEMO_CHW_PHONE, DEMO_OUTLET_PHONE, DEMO_VSLA_PHONE.
 *   - Never touches real production users.
 *   - Safe to run multiple times (idempotent via INSERT … ON CONFLICT DO UPDATE).
 *   - All personal data is obviously fictional.
 *
 * Usage:
 *   node scripts/seed-demo-accounts.js
 */

require("dotenv").config();

const isDemoEnabled =
  process.env.DEMO_LOGIN_ENABLED &&
  ["true", "1", "yes"].includes(
    String(process.env.DEMO_LOGIN_ENABLED).toLowerCase()
  );

if (!isDemoEnabled) {
  console.error(
    "❌ DEMO_LOGIN_ENABLED is not set to true. Aborting demo seed."
  );
  process.exit(1);
}

const { neon } = require("@neondatabase/serverless");
const dbUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();
if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(dbUrl);

// Phone numbers from env (no defaults — fail loudly if not configured)
const CHW_PHONE = process.env.DEMO_CHW_PHONE;
const OUTLET_PHONE = process.env.DEMO_OUTLET_PHONE;
const VSLA_PHONE = process.env.DEMO_VSLA_PHONE;

if (!CHW_PHONE || !OUTLET_PHONE || !VSLA_PHONE) {
  console.error(
    "❌ DEMO_CHW_PHONE, DEMO_OUTLET_PHONE and DEMO_VSLA_PHONE must all be set."
  );
  process.exit(1);
}

// Normalise to 0XXXXXXXXX (canonical storage format used by the app)
const toCanonical = (phone) => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("256")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0")) return digits;
  return `0${digits}`;
};

const CHW_CANONICAL = toCanonical(CHW_PHONE);
const OUTLET_CANONICAL = toCanonical(OUTLET_PHONE);
const VSLA_CANONICAL = toCanonical(VSLA_PHONE);

async function run() {
  console.log("🌱 Seeding Play Store demo accounts…\n");

  // ── 1. Upsert demo users ──────────────────────────────────────────────────
  // CHW demo user
  const [chwUser] = await sql`
    INSERT INTO users (
      phone_number, full_name, first_name, last_name,
      role, district, sub_county, village,
      is_active, created_at, updated_at
    ) VALUES (
      ${CHW_CANONICAL}, 'Demo Nalubega Fatuma', 'Fatuma', 'Nalubega',
      'health_worker', 'Wakiso', 'Nansana', 'Demo Village A',
      true, NOW(), NOW()
    )
    ON CONFLICT (phone_number) DO UPDATE SET
      full_name   = EXCLUDED.full_name,
      first_name  = EXCLUDED.first_name,
      last_name   = EXCLUDED.last_name,
      role        = EXCLUDED.role,
      is_active   = true,
      updated_at  = NOW()
    RETURNING id, phone_number, role
  `;
  console.log(`✓ CHW demo user: ${chwUser.phone_number} (id: ${chwUser.id})`);

  // Outlet demo user
  const [outletUser] = await sql`
    INSERT INTO users (
      phone_number, full_name, first_name, last_name,
      role, business_name, district,
      is_active, created_at, updated_at
    ) VALUES (
      ${OUTLET_CANONICAL}, 'Demo Ssemakula Brian', 'Brian', 'Ssemakula',
      'outlet', 'Demo Optics Centre', 'Kampala',
      true, NOW(), NOW()
    )
    ON CONFLICT (phone_number) DO UPDATE SET
      full_name    = EXCLUDED.full_name,
      first_name   = EXCLUDED.first_name,
      last_name    = EXCLUDED.last_name,
      role         = EXCLUDED.role,
      business_name = EXCLUDED.business_name,
      is_active    = true,
      updated_at   = NOW()
    RETURNING id, phone_number, role
  `;
  console.log(
    `✓ Outlet demo user: ${outletUser.phone_number} (id: ${outletUser.id})`
  );

  // VSLA demo user
  const [vslaUser] = await sql`
    INSERT INTO users (
      phone_number, full_name, first_name, last_name,
      role, organization_name, district,
      is_active, created_at, updated_at
    ) VALUES (
      ${VSLA_CANONICAL}, 'Demo Akello Grace', 'Grace', 'Akello',
      'vsla', 'Demo Sunrise Savings Group', 'Gulu',
      true, NOW(), NOW()
    )
    ON CONFLICT (phone_number) DO UPDATE SET
      full_name         = EXCLUDED.full_name,
      first_name        = EXCLUDED.first_name,
      last_name         = EXCLUDED.last_name,
      role              = EXCLUDED.role,
      organization_name = EXCLUDED.organization_name,
      is_active         = true,
      updated_at        = NOW()
    RETURNING id, phone_number, role
  `;
  console.log(
    `✓ VSLA demo user: ${vslaUser.phone_number} (id: ${vslaUser.id})`
  );

  // ── 2. CHW demo data ────────────────────────────────────────────────────────
  // Ensure at least one product exists for FK references
  let productRows = await sql`SELECT id, power FROM products LIMIT 5`;
  if (productRows.length === 0) {
    // Insert minimal demo product so FKs don't fail
    await sql`
      INSERT INTO products (name, power, price, stock_quantity, category)
      VALUES ('Demo Reading Glasses +1.00', '+1.00', 5000, 20, 'reading_glasses')
      ON CONFLICT DO NOTHING
    `;
    productRows = await sql`SELECT id, power FROM products LIMIT 5`;
  }
  const productId = productRows[0].id;

  // Delete pre-existing demo screenings/referrals/payments for CHW to allow fresh seed
  await sql`
    DELETE FROM payments  WHERE health_worker_id = ${chwUser.id}
      AND client_name ILIKE 'Demo %'
  `;
  await sql`
    DELETE FROM referrals WHERE health_worker_id = ${chwUser.id}
      AND client_name ILIKE 'Demo %'
  `;
  await sql`
    DELETE FROM screenings WHERE health_worker_id = ${chwUser.id}
      AND client_name ILIKE 'Demo %'
  `;

  // Completed screenings (CHW)
  const chwClients = [
    { name: "Demo Apio Margaret", phone: "0770000001", age: 52, gender: "Female", village: "Demo Bunamwaya" },
    { name: "Demo Okello Peter",  phone: "0770000002", age: 67, gender: "Male",   village: "Demo Lungujja"  },
    { name: "Demo Nabukenya Rose",phone: "0770000003", age: 44, gender: "Female", village: "Demo Kireka"    },
  ];

  const screeningIds = [];
  for (const c of chwClients) {
    const [sc] = await sql`
      INSERT INTO screenings (
        health_worker_id,
        client_name, client_phone, client_age, client_gender,
        client_village, client_district,
        equipment_checked, consent_obtained, education_provided,
        has_eye_concerns, distance_vision_left, distance_vision_right,
        near_vision_result, needs_glasses, glasses_dispensed,
        glasses_power, glasses_frame_type, recommended_product_id,
        screening_date, is_synced, notes
      ) VALUES (
        ${chwUser.id},
        ${c.name}, ${c.phone}, ${c.age}, ${c.gender},
        ${c.village}, 'Wakiso',
        true, true, true,
        true, '6/9', '6/12',
        'N8', true, true,
        '+1.50', 'standard', ${productId},
        CURRENT_DATE - INTERVAL '7 days', true,
        'Demo screening — fictional data only'
      )
      RETURNING id
    `;
    screeningIds.push(sc.id);
  }
  console.log(`✓ ${screeningIds.length} CHW demo screenings inserted`);

  // Pending referral (CHW)
  const [referralRow] = await sql`
    INSERT INTO referrals (
      screening_id, health_worker_id,
      client_name, client_phone, client_age, client_gender, client_district,
      reason, urgency, facility_name, status, referred_date
    ) VALUES (
      ${screeningIds[0]}, ${chwUser.id},
      'Demo Apio Margaret', '0770000001', 52, 'Female', 'Wakiso',
      'Suspected cataract — needs specialist review', 'urgent',
      'Demo District Hospital', 'pending', CURRENT_DATE - INTERVAL '3 days'
    )
    RETURNING id
  `;
  console.log(`✓ CHW demo referral inserted (id: ${referralRow.id})`);

  // VHT stock for CHW
  await sql`
    INSERT INTO vht_stock (health_worker_id, product_id, stock_quantity)
    VALUES (${chwUser.id}, ${productId}, 15)
    ON CONFLICT (health_worker_id, product_id) DO UPDATE SET stock_quantity = 15
  `;
  console.log("✓ CHW demo stock set");

  // Payments: 2 completed, 1 pending (CHW)
  await sql`
    INSERT INTO payments (
      screening_id, product_id, health_worker_id,
      client_name, client_phone, amount, currency,
      status, payment_method, payment_type, payment_date, created_at
    ) VALUES
    (${screeningIds[1]}, ${productId}, ${chwUser.id},
     'Demo Okello Peter', '0770000002', 5000, 'UGX',
     'completed', 'cash', 'full', CURRENT_DATE - INTERVAL '6 days', NOW()),
    (${screeningIds[2]}, ${productId}, ${chwUser.id},
     'Demo Nabukenya Rose', '0770000003', 5000, 'UGX',
     'completed', 'mobile_money', 'full', CURRENT_DATE - INTERVAL '4 days', NOW()),
    (${screeningIds[0]}, ${productId}, ${chwUser.id},
     'Demo Apio Margaret', '0770000001', 2500, 'UGX',
     'pending', 'cash', 'installment', NULL, NOW())
  `;
  console.log("✓ CHW demo payments inserted");

  // ── 3. Outlet demo data ────────────────────────────────────────────────────
  // Outlet uses the same products table; add a stock entry
  await sql`
    INSERT INTO vht_stock (health_worker_id, product_id, stock_quantity)
    VALUES (${outletUser.id}, ${productId}, 40)
    ON CONFLICT (health_worker_id, product_id) DO UPDATE SET stock_quantity = 40
  `;

  // Demo outlet payments (sales)
  await sql`
    DELETE FROM payments WHERE health_worker_id = ${outletUser.id}
      AND client_name ILIKE 'Demo %'
  `;
  await sql`
    INSERT INTO payments (
      product_id, health_worker_id,
      client_name, client_phone, amount, currency,
      status, payment_method, payment_type, payment_date, created_at
    ) VALUES
    (${productId}, ${outletUser.id},
     'Demo Mugenyi Daniel', '0780000011', 8000, 'UGX',
     'completed', 'cash', 'full', CURRENT_DATE - INTERVAL '2 days', NOW()),
    (${productId}, ${outletUser.id},
     'Demo Nakato Sarah', '0780000012', 8000, 'UGX',
     'completed', 'mobile_money', 'full', CURRENT_DATE - INTERVAL '5 days', NOW()),
    (${productId}, ${outletUser.id},
     'Demo Byamugisha John', '0780000013', 4000, 'UGX',
     'pending', 'cash', 'installment', NULL, NOW())
  `;
  console.log("✓ Outlet demo stock & payments inserted");

  // ── 4. VSLA demo data ───────────────────────────────────────────────────────
  // VSLA data lives in the users / organization fields for now;
  // any VSLA-specific group members are modelled as screenings attributed to the VSLA user.
  await sql`
    DELETE FROM screenings WHERE health_worker_id = ${vslaUser.id}
      AND client_name ILIKE 'Demo %'
  `;
  const vslaMembers = [
    { name: "Demo Amito Judith", phone: "0790000021", age: 38, gender: "Female" },
    { name: "Demo Oryem Charles", phone: "0790000022", age: 45, gender: "Male" },
    { name: "Demo Lamwaka Peace", phone: "0790000023", age: 29, gender: "Female" },
  ];
  for (const m of vslaMembers) {
    await sql`
      INSERT INTO screenings (
        health_worker_id,
        client_name, client_phone, client_age, client_gender,
        client_district, needs_glasses, screening_date, is_synced, notes
      ) VALUES (
        ${vslaUser.id},
        ${m.name}, ${m.phone}, ${m.age}, ${m.gender},
        'Gulu', false, CURRENT_DATE - INTERVAL '10 days', true,
        'Demo VSLA member record — fictional data only'
      )
    `;
  }
  console.log("✓ VSLA demo member records inserted");

  console.log("\n✅ Demo seed complete.");
  console.log(`   CHW   : ${CHW_CANONICAL}`);
  console.log(`   Outlet: ${OUTLET_CANONICAL}`);
  console.log(`   VSLA  : ${VSLA_CANONICAL}`);
}

run().catch((err) => {
  console.error("❌ Demo seed failed:", err.message);
  process.exit(1);
});
