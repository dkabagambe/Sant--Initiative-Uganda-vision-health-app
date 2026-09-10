const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

// ── List referrals (scoped to logged-in VHT) ─────────────────────────────────
router.get("/list", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { status, limit = 50, offset = 0 } = req.query;
    const healthWorkerId = req.user?.userId;

    const referrals = await sql`
      SELECT
        r.id,
        r.client_name,
        r.client_phone,
        r.client_age,
        r.client_gender,
        r.client_district,
        r.reason,
        r.facility_name,
        r.facility_location,
        r.urgency,
        r.status,
        r.referred_date,
        r.completed_date,
        r.notes,
        r.health_worker_id,
        u.full_name AS health_worker_name,
        r.created_at,
        r.screening_id,
        s.needs_glasses,
        s.needs_referral
      FROM referrals r
      LEFT JOIN users      u ON r.health_worker_id = u.id
      LEFT JOIN screenings s ON r.screening_id     = s.id
      WHERE r.health_worker_id = ${healthWorkerId}
        ${status ? sql`AND r.status = ${status}` : sql``}
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const totalRes = await sql`
      SELECT COUNT(*) AS count FROM referrals
      WHERE health_worker_id = ${healthWorkerId}
      ${status ? sql`AND status = ${status}` : sql``}
    `;

    res.json({
      success: true,
      data: referrals,
      count: referrals.length,
      total: parseInt(totalRes[0].count),
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch referrals", details: error.message });
  }
});

// ── Create referral ───────────────────────────────────────────────────────────
router.post("/create", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const {
      client_name, client_phone, client_age, client_gender, client_district,
      reason, facility_name, facility_location, urgency = "normal",
      notes, screening_id,
    } = req.body;

    const workerId = req.user?.userId;

    const referral = await sql`
      INSERT INTO referrals (
        client_name, client_phone, client_age, client_gender, client_district,
        reason, facility_name, facility_location, urgency, notes,
        health_worker_id, screening_id, referred_date, created_at
      ) VALUES (
        ${client_name || null}, ${client_phone || null}, ${client_age || null},
        ${client_gender || null}, ${client_district || null},
        ${reason || null}, ${facility_name || null}, ${facility_location || null},
        ${urgency}, ${notes || null},
        ${workerId}, ${screening_id || null},
        ${new Date().toISOString().split("T")[0]}, NOW()
      )
      RETURNING *
    `;

    res.json({ success: true, message: "Referral created successfully", data: referral[0] });
  } catch (error) {
    console.error("Create referral error:", error);
    res.status(500).json({ success: false, error: "Failed to create referral", details: error.message });
  }
});

// ── Get referral by ID ────────────────────────────────────────────────────────
router.get("/:id", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const healthWorkerId = req.user?.userId;

    const referral = await sql`
      SELECT r.*, u.full_name AS health_worker_name
      FROM referrals r
      LEFT JOIN users u ON r.health_worker_id = u.id
      WHERE r.id = ${id} AND r.health_worker_id = ${healthWorkerId}
    `;

    if (referral.length === 0) {
      return res.status(404).json({ success: false, error: "Referral not found" });
    }

    res.json({ success: true, data: referral[0] });
  } catch (error) {
    console.error("Get referral error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch referral", details: error.message });
  }
});

// ── Update referral ───────────────────────────────────────────────────────────
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const { facility_name, facility_location, notes, status, urgency, reason } = req.body;

    const referral = await sql`
      UPDATE referrals
      SET
        facility_name     = COALESCE(${facility_name     ?? null}, facility_name),
        facility_location = COALESCE(${facility_location ?? null}, facility_location),
        notes             = COALESCE(${notes             ?? null}, notes),
        status            = COALESCE(${status            ?? null}, status),
        urgency           = COALESCE(${urgency           ?? null}, urgency),
        reason            = COALESCE(${reason            ?? null}, reason)
      WHERE id = ${id} AND health_worker_id = ${req.user?.userId}
      RETURNING *
    `;

    if (referral.length === 0) {
      return res.status(404).json({ success: false, error: "Referral not found" });
    }

    res.json({ success: true, message: "Referral updated successfully", data: referral[0] });
  } catch (error) {
    console.error("Update referral error:", error);
    res.status(500).json({ success: false, error: "Failed to update referral", details: error.message });
  }
});

// ── Update referral status ────────────────────────────────────────────────────
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const { status, notes } = req.body;
    const completedDate = status === "completed"
      ? new Date().toISOString().split("T")[0]
      : null;

    const referral = await sql`
      UPDATE referrals
      SET
        status         = ${status},
        completed_date = CASE WHEN ${status} = 'completed' THEN ${completedDate}::date ELSE completed_date END,
        notes          = COALESCE(${notes ?? null}, notes)
      WHERE id = ${id} AND health_worker_id = ${req.user?.userId}
      RETURNING *
    `;

    if (referral.length === 0) {
      return res.status(404).json({ success: false, error: "Referral not found" });
    }

    if (status === "completed" && referral[0].screening_id) {
      await sql`UPDATE screenings SET needs_referral = false WHERE id = ${referral[0].screening_id}`;
    }

    res.json({ success: true, message: "Referral status updated successfully", data: referral[0] });
  } catch (error) {
    console.error("Update referral status error:", error);
    res.status(500).json({ success: false, error: "Failed to update referral status", details: error.message });
  }
});

// ── Referral stats ────────────────────────────────────────────────────────────
router.get("/stats", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId;

    const stats = await sql`
      SELECT
        COUNT(*)                                              AS total_referrals,
        COUNT(*) FILTER (WHERE status = 'completed')         AS completed_referrals,
        COUNT(*) FILTER (WHERE status = 'pending' OR status IS NULL) AS pending_referrals,
        COUNT(*) FILTER (WHERE urgency = 'high')             AS high_urgency_referrals,
        COUNT(*) FILTER (WHERE urgency = 'normal')           AS normal_urgency_referrals
      FROM referrals
      WHERE health_worker_id = ${healthWorkerId}
    `;

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error("Get referral stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch referral stats", details: error.message });
  }
});

module.exports = router;
