const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

/**
 * GET /api/simple-dashboard/stats
 *
 * Returns live dashboard statistics scoped to the logged-in VHT.
 *
 * Key schema facts this query relies on:
 *   - screenings.health_worker_id  → links screenings to a VHT
 *   - payments.screening_id        → links payments to a screening (no health_worker_id on payments)
 *   - referrals.health_worker_id   → links referrals to a VHT
 *   - vht_stock.health_worker_id   → per-VHT stock allocation
 *   - needs_glasses OR glasses_dispensed = true → glasses were given to the client
 */
router.get("/stats", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId;

    if (!healthWorkerId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    // Run all queries in parallel for speed
    const [
      screeningsRes,
      weekScreeningsRes,
      todayScreeningsRes,
      glassesRes,
      referralScreeningsRes,
      clientsRes,
      paymentsRes,
      completedPaymentsRes,
      pendingPaymentsRes,
      overduePaymentsRes,
      revenueRes,
      dueTodayRes,
      referralCountRes,
      pendingReferralsRes,
      completedReferralsRes,
      vhtStockRes,
    ] = await Promise.all([
      // Total screenings by this VHT
      sql`SELECT COUNT(*) AS total FROM screenings WHERE health_worker_id = ${healthWorkerId}`,

      // Screenings in the last 7 days
      sql`SELECT COUNT(*) AS total FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
          AND COALESCE(screening_date::date, created_at::date) >= CURRENT_DATE - INTERVAL '7 days'`,

      // Screenings today
      sql`SELECT COUNT(*) AS total FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
          AND COALESCE(screening_date::date, created_at::date) = CURRENT_DATE`,

      // Glasses given this week — count where glasses were dispensed or client needs glasses in the last 7 days
      sql`SELECT COUNT(*) AS total FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
          AND (needs_glasses = true OR glasses_dispensed = true)
          AND COALESCE(screening_date::date, created_at::date) >= CURRENT_DATE - INTERVAL '7 days'`,

      // Clients referred (from screenings)
      sql`SELECT COUNT(*) AS total FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
          AND needs_referral = true`,

      // Distinct clients screened (phone preferred; fallback to name)
      sql`SELECT COUNT(DISTINCT COALESCE(NULLIF(client_phone,''), client_name)) AS total
          FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
          AND (client_phone IS NOT NULL OR client_name IS NOT NULL)`,

      // Total payments linked to this VHT's screenings
      sql`SELECT COUNT(*) AS total
          FROM payments p
          JOIN screenings s ON p.screening_id = s.id
          WHERE s.health_worker_id = ${healthWorkerId}`,

      // Completed payments
      sql`SELECT COUNT(*) AS total
          FROM payments p
          JOIN screenings s ON p.screening_id = s.id
          WHERE s.health_worker_id = ${healthWorkerId}
          AND p.status = 'completed'`,

      // Pending payments
      sql`SELECT COUNT(*) AS total
          FROM payments p
          JOIN screenings s ON p.screening_id = s.id
          WHERE s.health_worker_id = ${healthWorkerId}
          AND p.status IN ('pending', 'overdue')`,

      // Overdue payments
      sql`SELECT COUNT(*) AS total
          FROM payments p
          JOIN screenings s ON p.screening_id = s.id
          WHERE s.health_worker_id = ${healthWorkerId}
          AND p.status = 'overdue'`,

      // Revenue from completed payments
      sql`SELECT COALESCE(SUM(p.amount), 0) AS total
          FROM payments p
          JOIN screenings s ON p.screening_id = s.id
          WHERE s.health_worker_id = ${healthWorkerId}
          AND p.status = 'completed'`,

      // Payments due today or overdue
      sql`SELECT COUNT(*) AS total
          FROM payments p
          JOIN screenings s ON p.screening_id = s.id
          WHERE s.health_worker_id = ${healthWorkerId}
          AND p.status IN ('pending', 'overdue')
          AND p.due_date IS NOT NULL
          AND p.due_date::date <= CURRENT_DATE`,

      // All referrals by this VHT
      sql`SELECT COUNT(*) AS total FROM referrals WHERE health_worker_id = ${healthWorkerId}`,

      // Pending referrals
      sql`SELECT COUNT(*) AS total FROM referrals
          WHERE health_worker_id = ${healthWorkerId}
          AND (status = 'pending' OR status IS NULL)`,

      // Completed referrals
      sql`SELECT COUNT(*) AS total FROM referrals
          WHERE health_worker_id = ${healthWorkerId}
          AND status = 'completed'`,

      // VHT stock — GREATEST(..., 0) guards against negative stock
      sql`SELECT GREATEST(COALESCE(SUM(stock_quantity), 0), 0) AS total_stock
          FROM vht_stock
          WHERE health_worker_id = ${healthWorkerId}`,
    ]);

    // If VHT has no vht_stock rows, fall back to global products pool
    let inventoryTotal = Number(vhtStockRes[0]?.total_stock || 0);
    const hasVhtStock = await sql`
      SELECT COUNT(*) AS cnt FROM vht_stock WHERE health_worker_id = ${healthWorkerId}
    `;
    if (Number(hasVhtStock[0]?.cnt || 0) === 0) {
      const globalStock = await sql`SELECT COALESCE(SUM(stock_quantity), 0) AS total FROM products`;
      inventoryTotal = Number(globalStock[0]?.total || 0);
    }

    const weekScreenings   = Number(weekScreeningsRes[0]?.total || 0);
    const glassesGiven     = Number(glassesRes[0]?.total || 0);
    const clients          = Number(clientsRes[0]?.total || 0);
    const pendingPay       = Number(pendingPaymentsRes[0]?.total || 0);
    const overduePay       = Number(overduePaymentsRes[0]?.total || 0);
    const pendingReferrals = Number(pendingReferralsRes[0]?.total || 0);
    const referralCount    = Number(referralCountRes[0]?.total || 0);
    const completedRef     = Number(completedReferralsRes[0]?.total || 0);
    const dueToday         = Number(dueTodayRes[0]?.total || 0);
    const revenue          = Number(revenueRes[0]?.total || 0);
    const totalScreenings  = Number(screeningsRes[0]?.total || 0);
    const referralScreen   = Number(referralScreeningsRes[0]?.total || 0);
    const completedPay     = Number(completedPaymentsRes[0]?.total || 0);
    const totalPayments    = Number(paymentsRes[0]?.total || 0);
    const todayScreenings  = Number(todayScreeningsRes[0]?.total || 0);

    res.json({
      success: true,
      data: {
        // Fields used by CHWDashboard.tsx (main dashboard)
        weekScreenings,
        glassesGiven,
        clients,
        clientsDueRepayment: pendingPay + overduePay,
        inventory: inventoryTotal,
        referrals: pendingReferrals,
        referralsOutstanding: Math.max(0, referralCount - completedRef),
        paymentsDue: dueToday,
        expectedAmount: revenue,

        // Fields used by CHWDashboardScreen.tsx (tab dashboard)
        screenings_this_week:     weekScreenings,
        screenings_today:         todayScreenings,
        screenings_this_month:    totalScreenings,
        total_screenings:         totalScreenings,
        clients_needing_glasses:  glassesGiven,
        clients_referred:         referralScreen,
        total_clients:            clients,
        total_payments:           totalPayments,
        completed_payments:       completedPay,
        pending_payments:         pendingPay,
        total_revenue:            revenue,
        total_referrals:          referralCount,
        pending_referrals:        pendingReferrals,
        completed_referrals:      completedRef,
        due_today:                dueToday,
        pending_amount:           Number((await sql`
          SELECT COALESCE(SUM(p.amount), 0) AS total
          FROM payments p
          JOIN screenings s ON p.screening_id = s.id
          WHERE s.health_worker_id = ${healthWorkerId}
          AND p.status IN ('pending', 'overdue')
        `)[0]?.total || 0),
        outstanding_referrals:    Math.max(0, referralCount - completedRef),
        total_stock:              inventoryTotal,
        total_products:           0,
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
