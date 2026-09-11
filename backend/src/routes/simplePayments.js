const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

/**
 * Payments are linked to a VHT via:
 *   payments.screening_id → screenings.health_worker_id   (screening-linked payments)
 *   payments.health_worker_id                             (standalone payments recorded directly)
 *
 * Both columns are checked so no payment is ever invisible.
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
        p.health_worker_id,
        prod.name     AS product_name,
        prod.power    AS product_power,
        prod.price    AS product_price,
        prod.category AS product_category,
        s.client_age,
        s.client_gender,
        s.client_village,
        s.client_district
      FROM payments p
      LEFT JOIN products   prod ON p.product_id  = prod.id
      LEFT JOIN screenings s    ON p.screening_id = s.id
      WHERE (
        s.health_worker_id = ${healthWorkerId}
        OR p.health_worker_id = ${healthWorkerId}
      )
        ${status ? sql`AND p.status = ${status}` : sql``}
      ORDER BY p.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const totalRes = await sql`
      SELECT COUNT(*) AS count
      FROM payments p
      LEFT JOIN screenings s ON p.screening_id = s.id
      WHERE (
        s.health_worker_id = ${healthWorkerId}
        OR p.health_worker_id = ${healthWorkerId}
      )
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
    const healthWorkerId = req.user?.userId;

    // Accept both camelCase (frontend) and snake_case field names
    const clientName   = req.body.client_name   || req.body.clientName   || null;
    const clientPhone  = req.body.client_phone  || req.body.clientPhone  || null;
    const amount       = req.body.amount        || null;
    const paymentMethod   = req.body.payment_method   || req.body.paymentMethod   || "cash";
    const paymentType     = req.body.payment_type     || req.body.paymentType     || "full";
    const productId       = req.body.product_id       || req.body.productId       || null;
    const screeningId     = req.body.screening_id     || req.body.screeningId     || null;
    const dueDate         = req.body.due_date         || req.body.dueDate         || null;
    const totalInstallments = req.body.total_installments || req.body.totalInstallments || 1;
    const mobileMoneyNumber = req.body.mobile_money_number || req.body.mobileMoneyNumber || clientPhone || "0000000000";

    // Validate required fields
    if (!clientName) {
      return res.status(400).json({ success: false, error: "client_name is required" });
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: "Valid amount is required" });
    }

    // Determine initial status: cash payments are immediately completed; mobile money starts pending
    const initialStatus = paymentMethod === "cash" ? "completed" : "pending";
    const paymentDate   = paymentMethod === "cash" ? new Date().toISOString().split("T")[0] : null;
    const verifiedAt    = paymentMethod === "cash" ? new Date().toISOString() : null;

    const payment = await sql`
      INSERT INTO payments (
        client_name, client_phone, amount, payment_method, payment_type,
        product_id, screening_id, health_worker_id,
        due_date, total_installments, mobile_money_number,
        payment_date, verified_at, created_at, updated_at, status
      ) VALUES (
        ${clientName}, ${clientPhone}, ${Number(amount)},
        ${paymentMethod}, ${paymentType},
        ${productId}, ${screeningId}, ${healthWorkerId},
        ${dueDate}, ${Number(totalInstallments)}, ${mobileMoneyNumber},
        ${paymentDate}, ${verifiedAt}, NOW(), NOW(), ${initialStatus}
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
        COUNT(*) FILTER (WHERE p.status = 'overdue')                     AS overdue_payments,
        COUNT(*) FILTER (WHERE p.payment_type = 'full')                  AS full_payments,
        COUNT(*) FILTER (WHERE p.payment_type = 'installment')           AS installment_payments,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_revenue,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status IN ('pending','overdue')), 0) AS pending_amount
      FROM payments p
      LEFT JOIN screenings s ON p.screening_id = s.id
      WHERE (
        s.health_worker_id = ${healthWorkerId}
        OR p.health_worker_id = ${healthWorkerId}
      )
    `;

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payment stats", details: error.message });
  }
});

// ── Get payment status by ID ──────────────────────────────────────────────────
router.get("/:id/status", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;

    const payment = await sql`
      SELECT id, status, payment_date, verified_at, created_at FROM payments WHERE id = ${id}
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
    const healthWorkerId = req.user?.userId;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "completed", "overdue", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const today  = new Date().toISOString().split("T")[0];
    const nowIso = new Date().toISOString();

    // Scope update to payments owned by this VHT (via screening or directly)
    const payment = await sql`
      UPDATE payments p
      SET
        status       = ${status},
        payment_date = CASE WHEN ${status} = 'completed' THEN ${today}::date ELSE p.payment_date END,
        verified_at  = CASE WHEN ${status} = 'completed' THEN ${nowIso}::timestamptz ELSE p.verified_at END,
        updated_at   = NOW()
      FROM (
        SELECT p2.id
        FROM payments p2
        LEFT JOIN screenings s ON p2.screening_id = s.id
        WHERE p2.id = ${id}
          AND (s.health_worker_id = ${healthWorkerId} OR p2.health_worker_id = ${healthWorkerId})
      ) owned
      WHERE p.id = owned.id
      RETURNING p.*
    `;

    if (payment.length === 0) {
      return res.status(404).json({ success: false, error: "Payment not found or not authorised" });
    }

    res.json({ success: true, message: "Payment status updated successfully", data: payment[0] });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ success: false, error: "Failed to update payment status", details: error.message });
  }
});

module.exports = router;
