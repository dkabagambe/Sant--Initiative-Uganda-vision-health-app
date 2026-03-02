// Get dashboard statistics for CHW
// Use Postgres date syntax when !req.app.locals.db (Neon), SQLite otherwise
function getScreeningStatsQuery(sql, healthWorkerId, isSqlite) {
  if (isSqlite) {
    return sql`
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
  }
  return sql`
    SELECT 
      COUNT(*) as total_screenings,
      COUNT(CASE WHEN needs_glasses = true THEN 1 END) as clients_needing_glasses,
      COUNT(CASE WHEN needs_referral = true THEN 1 END) as clients_referred,
      COUNT(CASE WHEN (screening_date::date) >= (CURRENT_DATE - INTERVAL '7 days') THEN 1 END) as screenings_this_week,
      COUNT(CASE WHEN (screening_date::date) >= (CURRENT_DATE - INTERVAL '30 days') THEN 1 END) as screenings_this_month,
      COUNT(CASE WHEN (screening_date::date) = CURRENT_DATE THEN 1 END) as screenings_today
    FROM screenings
    WHERE health_worker_id = ${healthWorkerId}
  `;
}

function getPaymentStatsQuery(sql, healthWorkerId, isSqlite) {
  if (isSqlite) {
    return sql`
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
  }
  return sql`
    SELECT 
      COUNT(*) as total_payments,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN status = 'pending' AND (p.due_date::date) <= CURRENT_DATE THEN 1 END) as due_today,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
      COALESCE(SUM(CASE WHEN status = 'pending' AND (p.due_date::date) <= CURRENT_DATE THEN amount ELSE 0 END), 0) as expected_today
    FROM payments p
    JOIN screenings s ON p.screening_id = s.id
    WHERE s.health_worker_id = ${healthWorkerId}
  `;
}

function getReferralStatsQuery(sql, healthWorkerId, isSqlite) {
  if (isSqlite) {
    return sql`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COUNT(CASE WHEN status = 'pending' AND date(referred_date) < date('now', '-7 days') THEN 1 END) as outstanding_referrals
      FROM referrals
      WHERE health_worker_id = ${healthWorkerId}
    `;
  }
  return sql`
    SELECT 
      COUNT(*) as total_referrals,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
      COUNT(CASE WHEN status = 'pending' AND (referred_date::date) < (CURRENT_DATE - INTERVAL '7 days') THEN 1 END) as outstanding_referrals
    FROM referrals
    WHERE health_worker_id = ${healthWorkerId}
  `;
}

exports.getDashboardStats = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const isSqlite = !!req.app.locals.db;
    let healthWorkerId = req.user?.userId;
    
    // Get a valid CHW ID for testing if no authenticated user
    if (!healthWorkerId) {
      const chwUsers = await sql`SELECT id FROM users WHERE role = 'CHW' LIMIT 1`;
      healthWorkerId = chwUsers.length > 0 ? chwUsers[0].id : null;
    }

    let screeningStats = [{ total_screenings: 0, clients_needing_glasses: 0, clients_referred: 0, screenings_this_week: 0, screenings_this_month: 0, screenings_today: 0 }];
    let clientStats = [{ total_clients: 0 }];
    let clientsDue = [{ clients_due_repayment: 0 }];
    let inventoryStats = [{ total_stock: 0 }];
    let paymentStats = [{ total_payments: 0, completed_payments: 0, pending_payments: 0, due_today: 0, total_revenue: 0, pending_amount: 0, expected_today: 0 }];
    let referralStats = [{ total_referrals: 0, pending_referrals: 0, completed_referrals: 0, outstanding_referrals: 0 }];
    let recentScreenings = [];

    try {
      screeningStats = await getScreeningStatsQuery(sql, healthWorkerId, isSqlite);
      if (!screeningStats || !screeningStats[0]) screeningStats = [{ total_screenings: 0, clients_needing_glasses: 0, clients_referred: 0, screenings_this_week: 0, screenings_this_month: 0, screenings_today: 0 }];
    } catch (e) {
      console.warn('Dashboard screening stats error:', e.message);
    }

    try {
      clientStats = await sql`
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
      if (!clientStats || !clientStats[0]) clientStats = [{ total_clients: 0 }];
    } catch (e) {
      console.warn('Dashboard client stats error:', e.message);
    }

    try {
      // Count distinct clients (by phone) with pending payments; avoid clients table and s.client_id (may not exist in production)
      clientsDue = await sql`
        SELECT COUNT(DISTINCT COALESCE(p.client_phone, s.client_phone)) as clients_due_repayment
        FROM payments p
        JOIN screenings s ON p.screening_id = s.id
        WHERE s.health_worker_id = ${healthWorkerId}
        AND p.status = 'pending'
      `;
      if (!clientsDue || !clientsDue[0]) clientsDue = [{ clients_due_repayment: 0 }];
    } catch (e) {
      console.warn('Dashboard clients due error:', e.message);
    }

    try {
      inventoryStats = await sql`
        SELECT COALESCE(SUM(stock_quantity), 0) as total_stock
        FROM products
      `;
      if (!inventoryStats || !inventoryStats[0]) inventoryStats = [{ total_stock: 0 }];
    } catch (e) {
      console.warn('Dashboard inventory error:', e.message);
    }

    try {
      paymentStats = await getPaymentStatsQuery(sql, healthWorkerId, isSqlite);
      if (!paymentStats || !paymentStats[0]) paymentStats = [{ total_payments: 0, completed_payments: 0, pending_payments: 0, due_today: 0, total_revenue: 0, pending_amount: 0, expected_today: 0 }];
    } catch (e) {
      console.warn('Dashboard payment stats error:', e.message);
    }

    try {
      referralStats = await getReferralStatsQuery(sql, healthWorkerId, isSqlite);
      if (!referralStats || !referralStats[0]) referralStats = [{ total_referrals: 0, pending_referrals: 0, completed_referrals: 0, outstanding_referrals: 0 }];
    } catch (e) {
      console.warn('Dashboard referral stats error:', e.message);
    }

    try {
      recentScreenings = await sql`
        SELECT 
          id, client_name, client_age, screening_date, needs_glasses, needs_referral
        FROM screenings
        WHERE health_worker_id = ${healthWorkerId}
        ORDER BY created_at DESC
        LIMIT 5
      `;
      if (!Array.isArray(recentScreenings)) recentScreenings = [];
    } catch (e) {
      console.warn('Dashboard recent screenings error:', e.message);
    }

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

// Get inventory summary (scoped to logged-in VHT's stock)
exports.getInventorySummary = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    let healthWorkerId = req.user?.userId;
    
    // Get a valid CHW ID for testing if no authenticated user
    if (!healthWorkerId) {
      const chwUsers = await sql`SELECT id FROM users WHERE role = 'CHW' LIMIT 1`;
      healthWorkerId = chwUsers.length > 0 ? chwUsers[0].id : null;
    }

    if (!healthWorkerId) {
      // For testing, return all products without scoping to specific worker
      const allProducts = await sql`
        SELECT 
          id, name, power, price, stock_quantity, stock_standard, stock_metal, stock_fashion,
          category, description, created_at, updated_at
        FROM products
        ORDER BY category, power
      `;
      return res.json({ success: true, data: allProducts });
    }

    const inventory = await sql`
      SELECT 
        p.id, p.name, p.power, p.price,
        COALESCE(v.stock_quantity, 0) as stock_quantity,
        COALESCE(v.stock_standard, 0) as stock_standard,
        COALESCE(v.stock_metal, 0) as stock_metal,
        COALESCE(v.stock_fashion, 0) as stock_fashion,
        CASE 
          WHEN COALESCE(v.stock_quantity, 0) = 0 THEN 'out_of_stock'
          WHEN COALESCE(v.stock_quantity, 0) < 20 THEN 'critical'
          WHEN COALESCE(v.stock_quantity, 0) < 50 THEN 'low'
          ELSE 'normal'
        END as status
      FROM products p
      LEFT JOIN vht_stock v ON v.product_id = p.id AND v.health_worker_id = ${healthWorkerId}
      ORDER BY p.power ASC
    `;

    const totalStock = await sql`
      SELECT 
        COALESCE(SUM(v.stock_quantity), 0) as total_pairs,
        COALESCE(SUM(v.stock_standard), 0) as total_standard,
        COALESCE(SUM(v.stock_metal), 0) as total_metal,
        COALESCE(SUM(v.stock_fashion), 0) as total_fashion
      FROM vht_stock v
      WHERE v.health_worker_id = ${healthWorkerId}
    `;

    res.json({
      success: true,
      data: {
        products: inventory,
        totals: totalStock[0] || { total_pairs: 0, total_standard: 0, total_metal: 0, total_fashion: 0 },
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
    let healthWorkerId = req.user?.userId;
    
    // Get a valid CHW ID for testing if no authenticated user
    if (!healthWorkerId) {
      const chwUsers = await sql`SELECT id FROM users WHERE role = 'CHW' LIMIT 1`;
      healthWorkerId = chwUsers.length > 0 ? chwUsers[0].id : null;
    }
    const { startDate, endDate, reportType } = req.query;

    // If no healthWorkerId, return all data for testing
    if (!healthWorkerId) {
      return res.json({ 
        success: true, 
        data: [], 
        message: "No authenticated user - empty report data for testing" 
      });
    }

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
    let healthWorkerId = req.user?.userId;
    
    // Get a valid CHW ID for testing if no authenticated user
    if (!healthWorkerId) {
      const chwUsers = await sql`SELECT id FROM users WHERE role = 'CHW' LIMIT 1`;
      healthWorkerId = chwUsers.length > 0 ? chwUsers[0].id : null;
    }
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
