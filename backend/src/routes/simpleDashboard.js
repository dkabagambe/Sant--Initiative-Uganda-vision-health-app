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
    
    // This week screenings (compatible with both databases)
    const weekScreenings = await sql`
      SELECT COUNT(*) as total FROM screenings 
      WHERE screening_date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    
    // Today screenings (compatible with both databases)
    const todayScreenings = await sql`
      SELECT COUNT(*) as total FROM screenings 
      WHERE screening_date = CURRENT_DATE
    `;
    
    // Get inventory data
    const inventoryData = await sql`
      SELECT COALESCE(SUM(stock_quantity), 0) as total_stock FROM products
    `;

    // Calculate glasses given (count of screenings where glasses were provided)
    const glassesGiven = await sql`
      SELECT COUNT(*) as total FROM screenings 
      WHERE needs_glasses = true
    `;

    res.json({
      success: true,
      data: {
        // Match frontend expected field names exactly
        weekScreenings: parseInt(weekScreenings[0]?.total || 0),
        glassesGiven: parseInt(glassesGiven[0]?.total || 0),
        clients: parseInt(clients[0]?.total || 0),
        clientsDueRepayment: parseInt(pendingPayments[0]?.total || 0),
        inventory: parseInt(inventoryData[0]?.total_stock || 0),
        referrals: parseInt(pendingReferrals[0]?.total || 0),
        referralsOutstanding: 0, // Can be calculated later
        paymentsDue: parseInt(pendingPayments[0]?.total || 0),
        expectedAmount: parseInt(revenue[0]?.total || 0),
        
        // Also include the original data for other uses
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
        screenings_this_month: parseInt(screenings[0]?.total || 0),
        due_today: 0,
        pending_amount: 0,
        completed_referrals: 0,
        outstanding_referrals: 0,
        total_stock: parseInt(inventoryData[0]?.total_stock || 0),
        total_products: 0,
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
