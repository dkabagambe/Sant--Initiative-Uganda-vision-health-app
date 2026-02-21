// Create new referral
exports.createReferral = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A'; // Default to Jane for testing
    const {
      screeningId,
      clientId,
      clientName,
      reason,
      urgency,
      facilityName,
      facilityLocation,
      notes,
    } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: "Referral reason required" });
    }

    const referral = await sql`
      INSERT INTO referrals (
        screening_id, client_id, health_worker_id, client_name,
        reason, urgency, facility_name, facility_location, notes
      ) VALUES (
        ${screeningId || null}, ${clientId || null}, ${healthWorkerId}, ${clientName || null},
        ${reason}, ${urgency || 'normal'}, ${facilityName || null}, ${facilityLocation || null}, ${notes || null}
      )
      RETURNING *
    `;

    res.json({
      success: true,
      message: "Referral created successfully",
      data: referral[0],
    });
  } catch (error) {
    console.error("Create referral error:", error);
    res.status(500).json({ success: false, error: "Failed to create referral" });
  }
};

// Get all referrals
exports.getReferrals = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A'; // Default to Jane for testing
    const { status, limit = 50, offset = 0 } = req.query;

    let referrals;
    if (status) {
      referrals = await sql`
        SELECT 
          r.*,
          s.client_name,
          s.client_phone,
          s.client_age,
          u.full_name as health_worker_name
        FROM referrals r
        LEFT JOIN screenings s ON r.screening_id = s.id
        LEFT JOIN users u ON r.health_worker_id = u.id
        WHERE r.health_worker_id = ${healthWorkerId}
        AND r.status = ${status}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      referrals = await sql`
        SELECT 
          r.*,
          s.client_name,
          s.client_phone,
          s.client_age,
          u.full_name as health_worker_name
        FROM referrals r
        LEFT JOIN screenings s ON r.screening_id = s.id
        LEFT JOIN users u ON r.health_worker_id = u.id
        WHERE r.health_worker_id = ${healthWorkerId}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const total = await sql`
      SELECT COUNT(*) as count FROM referrals WHERE health_worker_id = ${healthWorkerId}
    `;

    res.json({
      success: true,
      data: referrals,
      count: referrals.length,
      total: parseInt(total[0].count),
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch referrals" });
  }
};

// Get referral by ID
exports.getReferralById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = req.app.locals.sql;

    const referral = await sql`
      SELECT 
        r.*,
        s.client_name,
        s.client_phone,
        s.client_age,
        s.client_village,
        u.full_name as health_worker_name,
        u.phone_number as health_worker_phone
      FROM referrals r
      LEFT JOIN screenings s ON r.screening_id = s.id
      LEFT JOIN users u ON r.health_worker_id = u.id
      WHERE r.id = ${id}
    `;

    if (referral.length === 0) {
      return res.status(404).json({ success: false, error: "Referral not found" });
    }

    res.json({
      success: true,
      data: referral[0],
    });
  } catch (error) {
    console.error("Get referral error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch referral" });
  }
};

// Update referral status
exports.updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const sql = req.app.locals.sql;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const updated = await sql`
      UPDATE referrals 
      SET status = ${status},
          completed_date = ${status === 'completed' ? sql`CURRENT_DATE` : sql`NULL`},
          notes = ${notes || sql`notes`}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, error: "Referral not found" });
    }

    res.json({
      success: true,
      message: "Referral status updated",
      data: updated[0],
    });
  } catch (error) {
    console.error("Update referral status error:", error);
    res.status(500).json({ success: false, error: "Failed to update referral" });
  }
};

// Get referral statistics
exports.getReferralStats = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user.userId;

    const stats = await sql`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COUNT(CASE WHEN urgency = 'urgent' THEN 1 END) as urgent_referrals
      FROM referrals
      WHERE health_worker_id = ${healthWorkerId}
    `;

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Get referral stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch statistics" });
  }
};
