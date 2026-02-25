// Get dashboard statistics for CHW
exports.getDashboardStats = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A'; // Default to Jane for testing

    // Get screening stats
    const screeningStats = await sql`
      SELECT 
        COUNT(*) as total_screenings,
        COUNT(CASE WHEN needs_glasses = 1 THEN 1 END) as clients_needing_glasses,
        COUNT(CASE WHEN needs_referral = 1 THEN 1 END) as clients_referred,
        COUNT(CASE WHEN date(screening_date) >= date('now', '-7 days') THEN 1 END) as screenings_this_week,
        COUNT(CASE WHEN date(screening_date) >= date('now', '-30 days') THEN 1 END) as screenings_this_month,
        COUNT(CASE WHEN date(screening_date) = date('now') THEN 1 END) as screenings_today
      FROM screenings
      WHERE health_worker_id = ${healthWorkerId}
    `;

    // Get clients count (both registered and screened clients)
    const clientStats = await sql`
      SELECT COUNT(*) as total_clients
      FROM (
        SELECT id, full_name, phone_number FROM clients WHERE health_worker_id = ${healthWorkerId}
        UNION
        SELECT DISTINCT 
          client_phone as phone_number,
          client_name as full_name,
          client_phone as id
        FROM screenings 
        WHERE health_worker_id = ${healthWorkerId} 
        AND client_name IS NOT NULL 
        AND client_phone IS NOT NULL
      ) as all_clients
    `;

    // Get clients due for repayment
    const clientsDue = await sql`
      SELECT COUNT(DISTINCT c.id) as clients_due_repayment
      FROM clients c
      JOIN screenings s ON c.id = s.client_id
      JOIN payments p ON s.id = p.screening_id
      WHERE c.health_worker_id = ${healthWorkerId}
      AND p.status = 'pending'
    `;

    // Get inventory count
    const inventoryStats = await sql`
      SELECT COALESCE(SUM(stock_quantity), 0) as total_stock
      FROM products
    `;

    // Get payment stats
    const paymentStats = await sql`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'pending' AND date(due_date) <= date('now') THEN 1 END) as due_today,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' AND date(due_date) <= date('now') THEN amount ELSE 0 END), 0) as expected_today
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
        COUNT(CASE WHEN status = 'pending' AND date(referred_date) < date('now', '-7 days') THEN 1 END) as outstanding_referrals
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
        // Impact Dashboard Stats
        totalScreenings: screeningStats[0].total_screenings || 0,
        totalSales: screeningStats[0].clients_needing_glasses || 0,
        totalReferrals: referralStats[0].total_referrals || 0,
        ncdDetected: screeningStats[0].clients_referred || 0, // NCD cases detected
        repaymentRate: paymentStats[0].total_payments > 0 
          ? Math.round((paymentStats[0].completed_payments / paymentStats[0].total_payments) * 100)
          : 0,
        
        // Dashboard Stats
        weekScreenings: screeningStats[0].screenings_this_week || 0,
        glassesGiven: screeningStats[0].clients_needing_glasses || 0,
        clients: clientStats[0].total_clients || 0,
        clientsDueRepayment: clientsDue[0].clients_due_repayment || 0,
        inventory: inventoryStats[0].total_stock || 0,
        referrals: referralStats[0].pending_referrals || 0,
        referralsOutstanding: referralStats[0].outstanding_referrals || 0,
        paymentsDue: paymentStats[0].due_today || 0,
        expectedAmount: paymentStats[0].expected_today || 0,
        screenings: screeningStats[0],
        payments: paymentStats[0],
        referralsData: referralStats[0],
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
    const { sql } = req.app.locals;
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A';
    const { startDate, endDate, reportType } = req.query;

    if (reportType === 'screenings') {
      let data;
      if (startDate && endDate) {
        data = await sql`
          SELECT 
            s.*,
            p.name as product_name,
            p.power as product_power
          FROM screenings s
          LEFT JOIN products p ON s.recommended_product_id = p.id
          WHERE s.health_worker_id = ${healthWorkerId}
          AND date(s.screening_date) BETWEEN date(${startDate}) AND date(${endDate})
          ORDER BY s.screening_date DESC
        `;
      } else {
        data = await sql`
          SELECT 
            s.*,
            p.name as product_name,
            p.power as product_power
          FROM screenings s
          LEFT JOIN products p ON s.recommended_product_id = p.id
          WHERE s.health_worker_id = ${healthWorkerId}
          ORDER BY s.screening_date DESC
        `;
      }
      res.json({ success: true, data });
      
    } else if (reportType === 'payments') {
      let data;
      if (startDate && endDate) {
        data = await sql`
          SELECT 
            p.*,
            COALESCE(p.client_name, s.client_name) as client_name,
            pr.name as product_name
          FROM payments p
          LEFT JOIN screenings s ON p.screening_id = s.id
          LEFT JOIN products pr ON p.product_id = pr.id
          WHERE (s.health_worker_id = ${healthWorkerId} OR p.screening_id IS NULL)
          AND date(COALESCE(p.payment_date, p.created_at)) BETWEEN date(${startDate}) AND date(${endDate})
          ORDER BY p.created_at DESC
        `;
      } else {
        data = await sql`
          SELECT 
            p.*,
            COALESCE(p.client_name, s.client_name) as client_name,
            pr.name as product_name
          FROM payments p
          LEFT JOIN screenings s ON p.screening_id = s.id
          LEFT JOIN products pr ON p.product_id = pr.id
          WHERE (s.health_worker_id = ${healthWorkerId} OR p.screening_id IS NULL)
          ORDER BY p.created_at DESC
        `;
      }
      res.json({ success: true, data });
      
    } else if (reportType === 'referrals') {
      let data;
      if (startDate && endDate) {
        data = await sql`
          SELECT 
            r.*,
            COALESCE(r.client_name, s.client_name) as client_name,
            COALESCE(r.client_phone, s.client_phone) as client_phone
          FROM referrals r
          LEFT JOIN screenings s ON r.screening_id = s.id
          WHERE r.health_worker_id = ${healthWorkerId}
          AND date(COALESCE(r.referred_date, r.created_at)) BETWEEN date(${startDate}) AND date(${endDate})
          ORDER BY r.created_at DESC
        `;
      } else {
        data = await sql`
          SELECT 
            r.*,
            COALESCE(r.client_name, s.client_name) as client_name,
            COALESCE(r.client_phone, s.client_phone) as client_phone
          FROM referrals r
          LEFT JOIN screenings s ON r.screening_id = s.id
          WHERE r.health_worker_id = ${healthWorkerId}
          ORDER BY r.created_at DESC
        `;
      }
      res.json({ success: true, data });
      
    } else {
      // Summary report (real DB aggregates for selected date range)
      let screeningSummary;
      let referralSummary;
      let paymentSummary;

      if (startDate && endDate) {
        screeningSummary = await sql`
          SELECT
            COUNT(*) as total_screenings,
            COUNT(CASE WHEN needs_glasses = 1 THEN 1 END) as glasses_sold
          FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
          AND date(screening_date) BETWEEN date(${startDate}) AND date(${endDate})
        `;

        referralSummary = await sql`
          SELECT COUNT(*) as referrals_made
          FROM referrals
          WHERE health_worker_id = ${healthWorkerId}
          AND date(COALESCE(referred_date, created_at)) BETWEEN date(${startDate}) AND date(${endDate})
        `;

        paymentSummary = await sql`
          SELECT
            COUNT(*) as total_payments,
            COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_payments,
            COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_revenue,
            COALESCE(SUM(CASE WHEN p.status = 'completed' AND p.payment_type = 'full' THEN p.amount ELSE 0 END), 0) as full_payment_revenue,
            COALESCE(SUM(CASE WHEN p.status = 'completed' AND p.payment_type = 'installment' THEN p.amount ELSE 0 END), 0) as hire_purchase_revenue
          FROM payments p
          LEFT JOIN screenings s ON p.screening_id = s.id
          WHERE (s.health_worker_id = ${healthWorkerId} OR p.screening_id IS NULL)
          AND date(COALESCE(p.payment_date, p.created_at)) BETWEEN date(${startDate}) AND date(${endDate})
        `;
      } else {
        screeningSummary = await sql`
          SELECT
            COUNT(*) as total_screenings,
            COUNT(CASE WHEN needs_glasses = 1 THEN 1 END) as glasses_sold
          FROM screenings
          WHERE health_worker_id = ${healthWorkerId}
        `;

        referralSummary = await sql`
          SELECT COUNT(*) as referrals_made
          FROM referrals
          WHERE health_worker_id = ${healthWorkerId}
        `;

        paymentSummary = await sql`
          SELECT
            COUNT(*) as total_payments,
            COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_payments,
            COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_revenue,
            COALESCE(SUM(CASE WHEN p.status = 'completed' AND p.payment_type = 'full' THEN p.amount ELSE 0 END), 0) as full_payment_revenue,
            COALESCE(SUM(CASE WHEN p.status = 'completed' AND p.payment_type = 'installment' THEN p.amount ELSE 0 END), 0) as hire_purchase_revenue
          FROM payments p
          LEFT JOIN screenings s ON p.screening_id = s.id
          WHERE (s.health_worker_id = ${healthWorkerId} OR p.screening_id IS NULL)
        `;
      }

      const completedPayments = Number(paymentSummary[0]?.completed_payments || 0);
      const totalRevenue = Number(paymentSummary[0]?.total_revenue || 0);

      res.json({
        success: true,
        data: {
          total_screenings: Number(screeningSummary[0]?.total_screenings || 0),
          glasses_sold: Number(screeningSummary[0]?.glasses_sold || 0),
          referrals_made: Number(referralSummary[0]?.referrals_made || 0),
          total_payments: Number(paymentSummary[0]?.total_payments || 0),
          completed_payments: completedPayments,
          total_revenue: totalRevenue,
          average_sale: completedPayments > 0 ? Math.round(totalRevenue / completedPayments) : 0,
          full_payment_revenue: Number(paymentSummary[0]?.full_payment_revenue || 0),
          hire_purchase_revenue: Number(paymentSummary[0]?.hire_purchase_revenue || 0),
        },
      });
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
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A';
    const { limit = 50, offset = 0 } = req.query;

    // First get clients from the clients table
    const registeredClients = await sql`
      SELECT 
        id, full_name, phone_number, age, gender, village, district,
        created_at as last_screening_date,
        0 as total_screenings
      FROM clients
      WHERE health_worker_id = ${healthWorkerId}
    `;

    // Then get clients from screenings (screened clients)
    const screenedClients = await sql`
      SELECT 
        client_name as full_name, client_phone as phone_number, 
        client_age as age, client_gender as gender, client_village as village,
        client_district as district, client_county as county, 
        client_sub_county as sub_county, client_parish as parish,
        MAX(screening_date) as last_screening_date,
        COUNT(*) as total_screenings
      FROM screenings
      WHERE health_worker_id = ${healthWorkerId}
      AND client_name IS NOT NULL
      GROUP BY client_name, client_phone, client_age, client_gender, client_village, client_district, client_county, client_sub_county, client_parish
      ORDER BY MAX(screening_date) DESC
    `;

    // Merge: prefer screened clients, add registered ones not already in screenings
    const seen = new Set();
    const merged = [];

    for (const c of screenedClients) {
      const key = (c.phone_number || c.full_name || '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(c);
      }
    }

    for (const c of registeredClients) {
      const key = (c.phone_number || c.full_name || '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(c);
      }
    }

    const paginated = merged.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: paginated,
      count: paginated.length,
      total: merged.length,
    });
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch clients" });
  }
};
