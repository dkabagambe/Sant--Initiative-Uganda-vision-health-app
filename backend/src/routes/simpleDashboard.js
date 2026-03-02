const express = require('express');
const router = express.Router();

// Simple working dashboard stats endpoint
router.get('/stats', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    // Get all the stats in simple queries
    const screenings = await sql`SELECT COUNT(*) as total FROM screenings`;
    const glasses = await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_glasses = true`;
    const referrals = await sql`SELECT COUNT(*) as total FROM screenings WHERE needs_referral = true`;
    const clients = await sql`SELECT COUNT(DISTINCT client_phone) as total FROM screenings`;
    const payments = await sql`SELECT COUNT(*) as total FROM payments`;
    const completedPayments = await sql`SELECT COUNT(*) as total FROM payments WHERE status = 'completed'`;
    const pendingPayments = await sql`SELECT COUNT(*) as total FROM payments WHERE status = 'pending'`;
    const revenue = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'`;
    const referralCount = await sql`SELECT COUNT(*) as total FROM referrals`;
    const pendingReferrals = await sql`SELECT COUNT(*) as total FROM referrals WHERE status = 'pending'`;
    
    // This week screenings
    const weekScreenings = await sql`
      SELECT COUNT(*) as total FROM screenings 
      WHERE screening_date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    
    // Today screenings
    const todayScreenings = await sql`
      SELECT COUNT(*) as total FROM screenings 
      WHERE screening_date = CURRENT_DATE
    `;

    res.json({
      success: true,
      data: {
        total_screenings: parseInt(screenings[0]?.total || 0),
        clients_needing_glasses: parseInt(glasses[0]?.total || 0),
        clients_referred: parseInt(referrals[0]?.total || 0),
        total_clients: parseInt(clients[0]?.total || 0),
        total_payments: parseInt(payments[0]?.total || 0),
        completed_payments: parseInt(completedPayments[0]?.total || 0),
        pending_payments: parseInt(pendingPayments[0]?.total || 0),
        total_revenue: parseInt(revenue[0]?.total || 0),
        total_referrals: parseInt(referralCount[0]?.total || 0),
        pending_referrals: parseInt(pendingReferrals[0]?.total || 0),
        screenings_this_week: parseInt(weekScreenings[0]?.total || 0),
        screenings_today: parseInt(todayScreenings[0]?.total || 0),
        screenings_this_month: parseInt(screenings[0]?.total || 0), // Using total for now
        due_today: 0, // Can be calculated later
        pending_amount: 0, // Can be calculated later
        completed_referrals: 0, // Can be calculated later
        outstanding_referrals: 0, // Can be calculated later
        total_stock: 0, // Can be calculated later
        total_products: 0, // Can be calculated later
      }
    });
    
  } catch (error) {
    console.error('Simple dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
