/**
 * One-time seed for production (Neon). Call once to populate products so the app shows data.
 * Protected by SEED_SECRET (set in Vercel env). No auth token required.
 */
const express = require("express");
const router = express.Router();

function checkSecret(req) {
  const secret = req.headers["x-seed-secret"] || req.body?.secret;
  const expected = process.env.SEED_SECRET;
  if (!expected) return { ok: false, status: 500, error: "SEED_SECRET not set. Add it in Vercel → Project → Settings → Environment Variables." };
  if (secret !== expected) return { ok: false, status: 401, error: "Invalid or missing secret. Use header: x-seed-secret: YOUR_SEED_SECRET" };
  return { ok: true };
}

router.post("/", async (req, res) => {
  try {
    const auth = checkSecret(req);
    if (!auth.ok) return res.status(auth.status).json({ success: false, error: auth.error });

    const sql = req.app.locals.sql;
    if (!sql) {
      return res.status(500).json({
        success: false,
        error: "Database not available (SQLite only?). Seed only runs with Postgres (Neon).",
      });
    }

    // Ensure UUID extension (Postgres)
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Ensure products table exists (match init-db schema)
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        power VARCHAR(20),
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'UGX',
        stock_quantity INTEGER DEFAULT 0,
        stock_standard INTEGER DEFAULT 0,
        stock_metal INTEGER DEFAULT 0,
        stock_fashion INTEGER DEFAULT 0,
        category VARCHAR(50) DEFAULT 'reading_glasses',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const existing = await sql`SELECT COUNT(*) as count FROM products`;
    const count = parseInt(existing[0]?.count || "0", 10);

    if (count > 0) {
      return res.status(200).json({
        success: true,
        message: "Products already exist. No seed needed.",
        productsCount: count,
      });
    }

    await sql`
      INSERT INTO products (name, description, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion) VALUES
      ('Reading Glasses +1.00', 'Low power for early presbyopia', '+1.00', 15000.00, 78, 30, 28, 20),
      ('Reading Glasses +1.50', 'For mild difficulty with near vision', '+1.50', 15000.00, 95, 40, 35, 20),
      ('Reading Glasses +2.00', 'Standard reading glasses', '+2.00', 15000.00, 142, 60, 52, 30),
      ('Reading Glasses +2.50', 'For moderate presbyopia', '+2.50', 15000.00, 87, 35, 32, 20),
      ('Reading Glasses +3.00', 'High power for advanced presbyopia', '+3.00', 15000.00, 64, 25, 24, 15),
      ('Reading Glasses +3.50', 'Very high power for severe presbyopia', '+3.50', 18000.00, 42, 18, 14, 10)
    `;

    const after = await sql`SELECT COUNT(*) as count FROM products`;
    const newCount = parseInt(after[0]?.count || "0", 10);

    res.status(200).json({
      success: true,
      message: "Products seeded successfully. Reload the app to see inventory and data.",
      productsCount: newCount,
    });
  } catch (err) {
    console.error("Seed production error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Seed failed",
    });
  }
});

/**
 * Seed sample screenings + 1 payment for every user so all users see dashboard data.
 * Skips users who already have screenings. Call once: POST /api/seed-production/sample-activity with x-seed-secret header.
 */
router.post("/sample-activity", async (req, res) => {
  try {
    const auth = checkSecret(req);
    if (!auth.ok) return res.status(auth.status).json({ success: false, error: auth.error });

    const sql = req.app.locals.sql;
    if (!sql) {
      return res.status(500).json({ success: false, error: "Database not available." });
    }

    const users = await sql`SELECT id FROM users ORDER BY created_at ASC`;
    const products = await sql`SELECT id, price FROM products ORDER BY power ASC LIMIT 1`;
    if (!users?.length || !products?.length) {
      return res.status(400).json({
        success: false,
        error: "Need at least one user and one product. Run POST /api/seed-production first.",
      });
    }

    const productId = products[0].id;
    const productPrice = Number(products[0].price) || 15000;
    let seeded = 0;
    let skipped = 0;

    for (const row of users) {
      const userId = row.id;
      const existing = await sql`SELECT COUNT(*) as count FROM screenings WHERE health_worker_id = ${userId}`;
      if (parseInt(existing[0]?.count || "0", 10) > 0) {
        skipped++;
        continue;
      }

      const s1 = await sql`
        INSERT INTO screenings (
          health_worker_id, client_name, client_phone, client_age, client_gender, client_village,
          near_vision_result, needs_glasses, needs_referral, recommended_product_id, recommended_power, notes
        ) VALUES (
          ${userId}, 'Sample Client One', '0701234567', 45, 'female', 'Kampala',
          'passed', true, false, ${productId}, '+2.00', 'Sample screening – glasses dispensed'
        )
        RETURNING id
      `;
      const screeningId1 = s1[0]?.id;

      await sql`
        INSERT INTO screenings (
          health_worker_id, client_name, client_phone, client_age, client_gender,
          near_vision_result, needs_glasses, needs_referral, notes
        ) VALUES (
          ${userId}, 'Sample Client Two', '0707654321', 52, 'male',
          'refer', false, true, 'Sample screening – referred'
        )
      `;

      if (screeningId1) {
        await sql`
          INSERT INTO payments (screening_id, product_id, client_name, client_phone, amount, currency, mobile_money_number, status)
          VALUES (${screeningId1}, ${productId}, 'Sample Client One', '0701234567', ${productPrice}, 'UGX', '0701234567', 'completed')
        `;
      }
      seeded++;
    }

    res.status(200).json({
      success: true,
      message: `Sample activity: ${seeded} user(s) seeded, ${skipped} already had data. All users can see dashboard data.`,
      seeded,
      skipped,
    });
  } catch (err) {
    console.error("Seed sample activity error:", err);
    res.status(500).json({ success: false, error: err.message || "Seed failed" });
  }
});

module.exports = router;
