const express = require("express");
const router = express.Router();

// Simple working dashboard stats endpoint
router.get("/stats", async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    const screenings = await sql`SELECT COUNT(*) as total FROM screenings`;
    const glasses =
      await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_glasses = true`;
    const referrals =
      await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_referral = true`;
    const clients =
      await sql`SELECT COUNT(DISTINCT client_phone) as total FROM screenings WHERE client_phone IS NOT NULL`;
    const payments = await sql`SELECT COUNT(*) as total FROM payments`;
    const completedPayments =
      await sql`SELECT COUNT(*) as total FROM payments WHERE status = 'completed'`;
    const pendingPayments =
      await sql`SELECT COUNT(*) as total FROM payments WHERE status IN ('pending', 'overdue')`;
    const revenue =
      await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`;
    const referralCount = await sql`SELECT COUNT(*) as total FROM referrals`;
    const pendingReferrals =
      await sql`SELECT COUNT(*) as total FROM referrals WHERE status = 'pending' OR status IS NULL`;
    const completedReferrals =
      await sql`SELECT COUNT(*) as total FROM referrals WHERE status = 'completed'`;
    const overduePayments =
      await sql`SELECT COUNT(*) as total FROM payments WHERE status = 'overdue'`;

    const weekScreenings = await sql`
      SELECT COUNT(*) as total FROM screenings
      WHERE screening_date >= CURRENT_DATE - INTERVAL '7 days'
    `;

    const todayScreenings = await sql`
      SELECT COUNT(*) as total FROM screenings
      WHERE screening_date = CURRENT_DATE
    `;

    const inventoryData = await sql`
      SELECT COALESCE(SUM(stock_quantity), 0) as total_stock FROM products
    `;

    const glassesGiven = await sql`
      SELECT COUNT(*) as total FROM screenings
      WHERE needs_glasses = true
    `;

    const dueToday = await sql`
      SELECT COUNT(*) as total FROM payments
      WHERE status IN ('pending', 'overdue') AND due_date IS NOT NULL AND due_date <= CURRENT_DATE
    `;

    const pendingAmount = await sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments
      WHERE status IN ('pending', 'overdue')
    `;

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
