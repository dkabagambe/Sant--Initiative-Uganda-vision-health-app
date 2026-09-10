const express = require("express");
const router = express.Router();

// Simple working dashboard stats endpoint
router.get("/stats", async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId || req.query.healthWorkerId || null;

    const screenings = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM screenings WHERE health_worker_id = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM screenings`;
    const glasses = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_glasses = true AND health_worker_id = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_glasses = true`;
    const referrals = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_referral = true AND health_worker_id = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_referral = true`;
    const clients = healthWorkerId
      ? await sql`SELECT COUNT(DISTINCT client_phone) as total FROM screenings WHERE client_phone IS NOT NULL AND health_worker_id = ${healthWorkerId}`
      : await sql`SELECT COUNT(DISTINCT client_phone) as total FROM screenings WHERE client_phone IS NOT NULL`;
    const payments = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM payments p LEFT JOIN screenings s ON p.screening_id = s.id WHERE COALESCE(s.health_worker_id, p.health_worker_id) = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM payments`;
    const completedPayments = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM payments p LEFT JOIN screenings s ON p.screening_id = s.id WHERE p.status = 'completed' AND COALESCE(s.health_worker_id, p.health_worker_id) = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM payments WHERE status = 'completed'`;
    const pendingPayments = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM payments p LEFT JOIN screenings s ON p.screening_id = s.id WHERE p.status IN ('pending', 'overdue') AND COALESCE(s.health_worker_id, p.health_worker_id) = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM payments WHERE status IN ('pending', 'overdue')`;
    const revenue = healthWorkerId
      ? await sql`SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p LEFT JOIN screenings s ON p.screening_id = s.id WHERE p.status = 'completed' AND COALESCE(s.health_worker_id, p.health_worker_id) = ${healthWorkerId}`
      : await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`;
    const referralCount = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM referrals WHERE health_worker_id = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM referrals`;
    const pendingReferrals = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM referrals WHERE (status = 'pending' OR status IS NULL) AND health_worker_id = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM referrals WHERE status = 'pending' OR status IS NULL`;
    const completedReferrals = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM referrals WHERE status = 'completed' AND health_worker_id = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM referrals WHERE status = 'completed'`;
    const overduePayments = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM payments p LEFT JOIN screenings s ON p.screening_id = s.id WHERE p.status = 'overdue' AND COALESCE(s.health_worker_id, p.health_worker_id) = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM payments WHERE status = 'overdue'`;

    const weekScreenings = healthWorkerId
      ? await sql`
          SELECT COUNT(*) as total FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
          AND COALESCE(screening_date::date, created_at::date) >= CURRENT_DATE - INTERVAL '7 days'
        `
      : await sql`
          SELECT COUNT(*) as total FROM screenings
          WHERE COALESCE(screening_date::date, created_at::date) >= CURRENT_DATE - INTERVAL '7 days'
        `;

    const todayScreenings = healthWorkerId
      ? await sql`
          SELECT COUNT(*) as total FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
          AND COALESCE(screening_date::date, created_at::date) = CURRENT_DATE
        `
      : await sql`
          SELECT COUNT(*) as total FROM screenings
          WHERE COALESCE(screening_date::date, created_at::date) = CURRENT_DATE
        `;

    const inventoryData = healthWorkerId
      ? await sql`
          SELECT COALESCE(SUM(v.stock_quantity), 0) as total_stock
          FROM vht_stock v
          WHERE v.health_worker_id = ${healthWorkerId}
        `
      : await sql`SELECT COALESCE(SUM(stock_quantity), 0) as total_stock FROM products`;

    const glassesGiven = healthWorkerId
      ? await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_glasses = true AND health_worker_id = ${healthWorkerId}`
      : await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_glasses = true`;

    const dueToday = healthWorkerId
      ? await sql`
          SELECT COUNT(*) as total FROM payments p
          LEFT JOIN screenings s ON p.screening_id = s.id
          WHERE p.status IN ('pending', 'overdue')
          AND p.due_date IS NOT NULL
          AND p.due_date <= CURRENT_DATE
          AND COALESCE(s.health_worker_id, p.health_worker_id) = ${healthWorkerId}
        `
      : await sql`
          SELECT COUNT(*) as total FROM payments
          WHERE status IN ('pending', 'overdue') AND due_date IS NOT NULL AND due_date <= CURRENT_DATE
        `;

    const pendingAmount = healthWorkerId
      ? await sql`
          SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p
          LEFT JOIN screenings s ON p.screening_id = s.id
          WHERE p.status IN ('pending', 'overdue')
          AND COALESCE(s.health_worker_id, p.health_worker_id) = ${healthWorkerId}
        `
      : await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status IN ('pending', 'overdue')`;

    res.json({
      success: true,
      data: {
        weekScreenings: Number(weekScreenings[0]?.total || 0),
        glassesGiven: Number(glassesGiven[0]?.total || 0),
        clients: Number(clients[0]?.total || 0),
        clientsDueRepayment: Number(
          (pendingPayments[0]?.total || 0) + (overduePayments[0]?.total || 0),
        ),
        inventory: Number(inventoryData[0]?.total_stock || 0),
        referrals: Number(pendingReferrals[0]?.total || 0),
        referralsOutstanding: Math.max(
          0,
          Number(referralCount[0]?.total || 0) -
            Number(completedReferrals[0]?.total || 0),
        ),
        paymentsDue: Number(dueToday[0]?.total || 0),
        expectedAmount: Number(revenue[0]?.total || 0),

        total_screenings: Number(screenings[0]?.total || 0),
        clients_needing_glasses: Number(glasses[0]?.total || 0),
        clients_referred: Number(referrals[0]?.total || 0),
        total_clients: Number(clients[0]?.total || 0),
        total_payments: Number(payments[0]?.total || 0),
        completed_payments: Number(completedPayments[0]?.total || 0),
        pending_payments: Number(pendingPayments[0]?.total || 0),
        total_revenue: Number(revenue[0]?.total || 0),
        total_referrals: Number(referralCount[0]?.total || 0),
        pending_referrals: Number(pendingReferrals[0]?.total || 0),
        completed_referrals: Number(completedReferrals[0]?.total || 0),
        screenings_this_week: Number(weekScreenings[0]?.total || 0),
        screenings_today: Number(todayScreenings[0]?.total || 0),
        screenings_this_month: Number(screenings[0]?.total || 0),
        due_today: Number(dueToday[0]?.total || 0),
        pending_amount: Number(pendingAmount[0]?.total || 0),
        outstanding_referrals: Number(
          Math.max(
            0,
            Number(referralCount[0]?.total || 0) -
              Number(completedReferrals[0]?.total || 0),
          ),
        ),
        total_stock: Number(inventoryData[0]?.total_stock || 0),
        total_products: 0,
      },
    });
  } catch (error) {
    console.error("Simple dashboard error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
