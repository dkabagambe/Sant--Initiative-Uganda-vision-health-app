// Get dashboard statistics for CHW
exports.getDashboardStats = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user.userId;

    // Get screening stats
    const screeningStats = await sql`
      SELECT 
        COUNT(*) as total_screenings,
        COUNT(CASE WHEN needs_glasses = true THEN 1 END) as clients_needing_glasses,
        COUNT(CASE WHEN needs_referral = true THEN 1 END) as clients_referred,
        COUNT(CASE WHEN screening_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as screenings_this_week,
        COUNT(CASE WHEN screening_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as screenings_this_month,
        COUNT(CASE WHEN screening_date = CURRENT_DATE THEN 1 END) as screenings_today
      FROM screenings
      WHERE health_worker_id = ${healthWorkerId}
    `;

    // Get payment stats
    const paymentStats = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_payments,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount
      FROM payments p
      JOIN screenings s ON p.screening_id = s.id
      WHERE s.health_worker_id = ${healthWorkerId}
    `;

    // Get referral stats
    const referralStats = await sql`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COUNT(CASE WHEN urgency = 'urgent' THEN 1 END) as urgent_referrals
      FROM referrals
      WHERE health_worker_id = ${healthWorkerId}
    `;

    // Get recent activity
    const recentScreenings = await sql`
      SELECT 
        id, client_name, client_age, screening_date, needs_glasses, needs_referral
      FROM screenings
      WHERE health_worker_id = ${healthWorkerId}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    res.json({
      success: true,
      data: {
        screenings: screeningStats[0],
        payments: paymentStats[0],
        referrals: referralStats[0],
        recentActivity: recentScreenings,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard statistics" });
  }
};

// Get inventory summary
exports.getInventorySummary = async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    const inventory = await sql`
      SELECT 
        id, name, power, price,
        stock_quantity, stock_standard, stock_metal, stock_fashion,
        CASE 
          WHEN stock_quantity = 0 THEN 'out_of_stock'
          WHEN stock_quantity < 20 THEN 'critical'
          WHEN stock_quantity < 50 THEN 'low'
          ELSE 'normal'
        END as status
      FROM products
      ORDER BY power ASC
    `;

    const totalStock = await sql`
      SELECT 
        SUM(stock_quantity) as total_pairs,
        SUM(stock_standard) as total_standard,
        SUM(stock_metal) as total_metal,
        SUM(stock_fashion) as total_fashion
      FROM products
    `;

    res.json({
      success: true,
      data: {
        products: inventory,
        totals: totalStock[0],
      },
    });
  } catch (error) {
    console.error("Get inventory summary error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch inventory" });
  }
};

// Get reports data
exports.getReports = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user.userId;
    const { startDate, endDate, reportType } = req.query;

    let dateFilter = sql`TRUE`;
    if (startDate && endDate) {
      dateFilter = sql`screening_date BETWEEN ${startDate} AND ${endDate}`;
    }

    if (reportType === 'screenings') {
      const data = await sql`
        SELECT 
          s.*,
          p.name as product_name,
          p.power as product_power
        FROM screenings s
        LEFT JOIN products p ON s.recommended_product_id = p.id
        WHERE s.health_worker_id = ${healthWorkerId}
        AND ${dateFilter}
        ORDER BY s.screening_date DESC
      `;

      res.json({ success: true, data });
    } else if (reportType === 'payments') {
      const data = await sql`
        SELECT 
          p.*,
          s.client_name,
          pr.name as product_name
        FROM payments p
        JOIN screenings s ON p.screening_id = s.id
        LEFT JOIN products pr ON p.product_id = pr.id
        WHERE s.health_worker_id = ${healthWorkerId}
        ORDER BY p.created_at DESC
      `;

      res.json({ success: true, data });
    } else if (reportType === 'referrals') {
      const data = await sql`
        SELECT 
          r.*,
          s.client_name,
          s.client_phone
        FROM referrals r
        LEFT JOIN screenings s ON r.screening_id = s.id
        WHERE r.health_worker_id = ${healthWorkerId}
        ORDER BY r.created_at DESC
      `;

      res.json({ success: true, data });
    } else {
      // Summary report
      const summary = await sql`
        SELECT 
          COUNT(DISTINCT s.id) as total_screenings,
          COUNT(DISTINCT CASE WHEN s.needs_glasses THEN s.id END) as glasses_sold,
          COUNT(DISTINCT CASE WHEN s.needs_referral THEN s.id END) as referrals_made,
          COALESCE(SUM(p.amount), 0) as total_revenue
        FROM screenings s
        LEFT JOIN payments p ON s.id = p.screening_id AND p.status = 'completed'
        WHERE s.health_worker_id = ${healthWorkerId}
        AND ${dateFilter}
      `;

      res.json({ success: true, data: summary[0] });
    }
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reports" });
  }
};

// Get clients list
exports.getClients = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const clients = await sql`
      SELECT DISTINCT ON (client_phone)
        client_name, client_phone, client_age, client_gender, client_village,
        MAX(screening_date) as last_screening_date,
        COUNT(*) as total_screenings
      FROM screenings
      WHERE health_worker_id = ${healthWorkerId}
      AND client_phone IS NOT NULL
      GROUP BY client_name, client_phone, client_age, client_gender, client_village
      ORDER BY client_phone, MAX(screening_date) DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = await sql`
      SELECT COUNT(DISTINCT client_phone) as count 
      FROM screenings 
      WHERE health_worker_id = ${healthWorkerId}
      AND client_phone IS NOT NULL
    `;

    res.json({
      success: true,
      data: clients,
      count: clients.length,
      total: parseInt(total[0].count),
    });
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch clients" });
  }
};
