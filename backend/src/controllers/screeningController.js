// Create new screening
exports.createScreening = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user.userId;
    const {
      clientName,
      clientPhone,
      clientAge,
      clientGender,
      clientVillage,
      distanceVisionLeft,
      distanceVisionRight,
      distanceVisionBoth,
      nearVisionResult,
      pinholeTestLeft,
      pinholeTestRight,
      needsGlasses,
      needsReferral,
      referralReason,
      recommendedProductId,
      recommendedPower,
      selectedFrameType,
      notes,
      offlineId,
    } = req.body;

    // Create screening
    const screening = await sql`
      INSERT INTO screenings (
        health_worker_id, client_name, client_phone, client_age, client_gender, client_village,
        distance_vision_left, distance_vision_right, distance_vision_both,
        near_vision_result, pinhole_test_left, pinhole_test_right,
        needs_glasses, needs_referral, referral_reason,
        recommended_product_id, recommended_power, selected_frame_type,
        notes, offline_id, is_synced
      ) VALUES (
        ${healthWorkerId}, ${clientName}, ${clientPhone}, ${clientAge}, ${clientGender}, ${clientVillage},
        ${distanceVisionLeft || null}, ${distanceVisionRight || null}, ${distanceVisionBoth || null},
        ${nearVisionResult || null}, ${pinholeTestLeft || null}, ${pinholeTestRight || null},
        ${needsGlasses || false}, ${needsReferral || false}, ${referralReason || null},
        ${recommendedProductId || null}, ${recommendedPower || null}, ${selectedFrameType || null},
        ${notes || null}, ${offlineId || null}, true
      )
      RETURNING *
    `;

    // If needs referral, create referral record
    if (needsReferral && referralReason) {
      await sql`
        INSERT INTO referrals (
          screening_id, health_worker_id, reason, urgency
        ) VALUES (
          ${screening[0].id}, ${healthWorkerId}, ${referralReason}, 'normal'
        )
      `;
    }

    // Update product stock if glasses recommended
    if (needsGlasses && recommendedProductId && selectedFrameType) {
      const frameColumn = selectedFrameType === 'standard' ? 'stock_standard' :
                         selectedFrameType === 'metal' ? 'stock_metal' : 'stock_fashion';
      
      await sql`
        UPDATE products 
        SET stock_quantity = stock_quantity - 1,
            ${sql(frameColumn)} = ${sql(frameColumn)} - 1
        WHERE id = ${recommendedProductId}
      `;
    }

    res.json({
      success: true,
      message: "Screening created successfully",
      screeningId: screening[0].id,
      data: screening[0],
    });
  } catch (error) {
    console.error("Create screening error:", error);
    res.status(500).json({ success: false, error: "Failed to create screening" });
  }
};

// Get all screenings for a health worker
exports.getScreenings = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A'; // Default to Jane for testing
    const { limit = 50, offset = 0 } = req.query;

    const screenings = await sql`
      SELECT 
        s.*,
        p.name as product_name,
        p.power as product_power,
        p.price as product_price
      FROM screenings s
      LEFT JOIN products p ON s.recommended_product_id = p.id
      WHERE s.health_worker_id = ${healthWorkerId}
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = await sql`
      SELECT COUNT(*) as count FROM screenings WHERE health_worker_id = ${healthWorkerId}
    `;

    res.json({
      success: true,
      data: screenings,
      count: screenings.length,
      total: parseInt(total[0].count),
    });
  } catch (error) {
    console.error("Get screenings error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch screenings" });
  }
};

// Get screening by ID
exports.getScreeningById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = req.app.locals.sql;

    const screening = await sql`
      SELECT 
        s.*,
        p.name as product_name,
        p.power as product_power,
        p.price as product_price,
        u.full_name as health_worker_name
      FROM screenings s
      LEFT JOIN products p ON s.recommended_product_id = p.id
      LEFT JOIN users u ON s.health_worker_id = u.id
      WHERE s.id = ${id}
    `;

    if (screening.length === 0) {
      return res.status(404).json({ success: false, error: "Screening not found" });
    }

    res.json({
      success: true,
      data: screening[0],
    });
  } catch (error) {
    console.error("Get screening error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch screening" });
  }
};

// Get screening statistics
exports.getScreeningStats = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user.userId;

    const stats = await sql`
      SELECT 
        COUNT(*) as total_screenings,
        COUNT(CASE WHEN needs_glasses = true THEN 1 END) as clients_needing_glasses,
        COUNT(CASE WHEN needs_referral = true THEN 1 END) as clients_referred,
        COUNT(CASE WHEN screening_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as screenings_this_week,
        COUNT(CASE WHEN screening_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as screenings_this_month
      FROM screenings
      WHERE health_worker_id = ${healthWorkerId}
    `;

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Get screening stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch statistics" });
  }
};
