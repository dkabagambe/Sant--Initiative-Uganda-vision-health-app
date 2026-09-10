const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

/**
 * Payments are linked to a VHT via:
 *   payments.screening_id → screenings.health_worker_id
 *
 * The payments table has NO health_worker_id column.
 * All VHT-scoped queries must JOIN through screenings.
 */

// ── List payments ────────────────────────────────────────────────────────────
router.get("/list", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { status, limit = 50, offset = 0 } = req.query;
    const healthWorkerId = req.user?.userId;

    const payments = await sql`
      SELECT
        p.id,
        p.client_name,
        p.client_phone,
        p.amount,
        p.payment_method,
        p.payment_type,
        p.installment_number,
        p.total_installments,
        p.due_date,
        p.payment_date,
        p.verified_at,
        p.transaction_id,
        p.offline_id,
        p.is_synced,
        p.created_at,
        p.status,
        prod.name    AS product_name,
        prod.power   AS product_power,
        prod.price   AS product_price,
        prod.category AS product_category,
        s.client_age,
        s.client_gender,
        s.client_village,
        s.client_district
      FROM payments p
      LEFT JOIN products  prod ON p.product_id  = prod.id
      LEFT JOIN screenings  s ON p.screening_id = s.id
      WHERE s.health_worker_id = ${healthWorkerId}
        ${status ? sql`AND p.status = ${status}` : sql``}
      ORDER BY p.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const totalRes = await sql`
      SELECT COUNT(*) AS count
      FROM payments p
      LEFT JOIN screenings s ON p.screening_id = s.id
      WHERE s.health_worker_id = ${healthWorkerId}
      ${status ? sql`AND p.status = ${status}` : sql``}
    `;

    res.json({
      success: true,
      data: payments,
      count: payments.length,
      total: parseInt(totalRes[0].count),
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payments", details: error.message });
  }
});

// ── Create payment ────────────────────────────────────────────────────────────
router.post("/create", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const {
      client_name,
      client_phone,
      amount,
      payment_method = "cash",
      payment_type = "full",
      product_id,
      screening_id,
      due_date,
      total_installments = 1,
      mobile_money_number,
    } = req.body;

    const finalMobileMoneyNumber = mobile_money_number || client_phone || "0000000000";

    const payment = await sql`
      INSERT INTO payments (
        client_name, client_phone, amount, payment_method, payment_type,
        product_id, screening_id, due_date, total_installments,
        mobile_money_number, payment_date, created_at, status
      ) VALUES (
        ${client_name || null}, ${client_phone || null}, ${amount || null},
        ${payment_method}, ${payment_type},
        ${product_id || null}, ${screening_id || null}, ${due_date || null}, ${total_installments},
        ${finalMobileMoneyNumber}, ${new Date().toISOString().split("T")[0]}, NOW(), 'pending'
      )
      RETURNING *
    `;

    res.json({ success: true, message: "Payment created successfully", data: payment[0] });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ success: false, error: "Failed to create payment", details: error.message });
  }
});

// ── Payment stats ─────────────────────────────────────────────────────────────
router.get("/stats", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId;

    const stats = await sql`
      SELECT
        COUNT(*)                                                          AS total_payments,
        COUNT(*) FILTER (WHERE p.status = 'completed')                   AS completed_payments,
        COUNT(*) FILTER (WHERE p.status = 'pending')                     AS pending_payments,
        COUNT(*) FILTER (WHERE p.payment_type = 'full')                  AS full_payments,
        COUNT(*) FILTER (WHERE p.payment_type = 'installment')           AS installment_payments,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_revenue
      FROM payments p
      LEFT JOIN screenings s ON p.screening_id = s.id
      WHERE s.health_worker_id = ${healthWorkerId}
    `;

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payment stats", details: error.message });
  }
});

// ── Get payment status by ID ──────────────────────────────────────────────────
router.get("/:id/status", async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;

    const payment = await sql`
      SELECT status, payment_date, verified_at, created_at FROM payments WHERE id = ${id}
    `;

    if (payment.length === 0) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    res.json({ success: true, data: payment[0] });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({ success: false, error: "Failed to get payment status", details: error.message });
  }
});

// ── Update payment status ─────────────────────────────────────────────────────
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const { status } = req.body;
    const today  = new Date().toISOString().split("T")[0];
    const nowIso = new Date().toISOString();

    const payment = await sql`
      UPDATE payments
      SET
        status       = ${status},
        payment_date = CASE WHEN ${status} = 'completed' THEN ${today}  ELSE payment_date END,
        verified_at  = CASE WHEN ${status} = 'completed' THEN ${nowIso} ELSE verified_at  END,
        updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (payment.length === 0) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    res.json({ success: true, message: "Payment status updated successfully", data: payment[0] });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ success: false, error: "Failed to update payment status", details: error.message });
  }
});

module.exports = router;
