// Create new referral
exports.createReferral = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A'; // Default to Jane for testing
    const {
      screeningId,
      clientId,
      clientName,
      clientPhone,
      clientAge,
      clientGender,
      clientDistrict,
      reason,
      urgency,
      facilityName,
      facilityLocation,
      notes,
    } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: "Referral reason required" });
    }

    await sql`
      INSERT INTO referrals (
        screening_id, client_id, health_worker_id, client_name,
        client_phone, client_age, client_gender, client_district,
        reason, urgency, facility_name, facility_location, notes
      ) VALUES (
        ${screeningId || null}, ${clientId || null}, ${healthWorkerId}, ${clientName || null},
        ${clientPhone || null}, ${clientAge || null}, ${clientGender || null}, ${clientDistrict || null},
        ${reason}, ${urgency || 'normal'}, ${facilityName || null}, ${facilityLocation || null}, ${notes || null}
      )
    `;

    // Fetch the most recently created referral for this worker
    const referral = await sql`
      SELECT * FROM referrals 
      WHERE health_worker_id = ${healthWorkerId} 
      ORDER BY created_at DESC LIMIT 1
    `;

    res.json({
      success: true,
      message: "Referral created successfully",
      data: referral[0] || {},
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
          r.id, r.screening_id, r.health_worker_id,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_name, r.client_name)
            ELSE r.client_name
          END as client_name,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_phone, r.client_phone)
            ELSE r.client_phone
          END as client_phone,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_age, r.client_age)
            ELSE r.client_age
          END as client_age,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_gender, r.client_gender)
            ELSE r.client_gender
          END as client_gender,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_district, r.client_district)
            ELSE r.client_district
          END as client_district,
          r.reason, r.urgency, r.facility_name, r.facility_location,
          r.status, r.referred_date, r.completed_date, r.notes, r.created_at,
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
          r.id, r.screening_id, r.health_worker_id,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_name, r.client_name)
            ELSE r.client_name
          END as client_name,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_phone, r.client_phone)
            ELSE r.client_phone
          END as client_phone,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_age, r.client_age)
            ELSE r.client_age
          END as client_age,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_gender, r.client_gender)
            ELSE r.client_gender
          END as client_gender,
          CASE 
            WHEN r.screening_id IS NOT NULL THEN COALESCE(s.client_district, r.client_district)
            ELSE r.client_district
          END as client_district,
          r.reason, r.urgency, r.facility_name, r.facility_location,
          r.status, r.referred_date, r.completed_date, r.notes, r.created_at,
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
        COALESCE(r.client_name, s.client_name) as client_name,
        COALESCE(r.client_phone, s.client_phone) as client_phone,
        COALESCE(r.client_age, s.client_age) as client_age,
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

// Update referral details (reason, urgency, facility, notes)
exports.updateReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = req.app.locals.sql;
    const {
      reason,
      urgency,
      facilityName,
      facilityLocation,
      notes,
    } = req.body;

    const existing = await sql`
      SELECT * FROM referrals WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Referral not found" });
    }

    const current = existing[0];

    const nextReason = reason ?? current.reason;
    const nextUrgency = urgency ?? current.urgency;
    const nextFacilityName = facilityName ?? current.facility_name;
    const nextFacilityLocation = facilityLocation ?? current.facility_location;
    const nextNotes = notes ?? current.notes;

    await sql`
      UPDATE referrals
      SET reason = ${nextReason},
          urgency = ${nextUrgency},
          facility_name = ${nextFacilityName},
          facility_location = ${nextFacilityLocation},
          notes = ${nextNotes}
      WHERE id = ${id}
    `;

    const updated = await sql`
      SELECT * FROM referrals WHERE id = ${id}
    `;

    res.json({
      success: true,
      message: "Referral updated successfully",
      data: updated[0],
    });
  } catch (error) {
    console.error("Update referral error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update referral" });
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

    const completedDate = status === 'completed' ? new Date().toISOString().split('T')[0] : null;

    await sql`
      UPDATE referrals 
      SET status = ${status},
          completed_date = ${completedDate}
      WHERE id = ${id}
    `;

    // Fetch the updated referral
    const updated = await sql`
      SELECT * FROM referrals WHERE id = ${id}
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
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A';

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
