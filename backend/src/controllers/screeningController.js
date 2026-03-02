// Create new screening
exports.createScreening = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId || 'B7B5C0E1921DF64ED91C21AB6B592E5A';
    
    // Extract and normalize field names (frontend uses camelCase, DB uses snake_case)
    const {
      clientName,
      clientPhone,
      clientAge,
      clientGender,
      clientVillage,
      district,
      county,
      subCounty,
      parish,
      // Vision test results - handle both old and new field names
      distanceVisionLeft,
      distanceVisionRight,
      distanceVisionBoth,
      distanceVisionResult,
      nearVisionResult,
      pinholeTestLeft,
      pinholeTestRight,
      torchTestPassed,
      torchTestAbnormalSigns,
      // Results
      needsGlasses,
      needsReferral,
      referralReason,
      referralStep,
      recommendedProductId,
      recommendedPower,
      selectedFrameType,
      notes,
      offlineId,
    } = req.body;

    // Build notes with all test information
    let fullNotes = notes || '';
    if (torchTestPassed !== undefined) {
      fullNotes += `\nTorch Test: ${torchTestPassed ? 'Passed' : 'Failed'}`;
      if (torchTestAbnormalSigns) {
        fullNotes += ` - ${torchTestAbnormalSigns}`;
      }
    }
    if (distanceVisionResult) {
      fullNotes += `\nDistance Vision: ${distanceVisionResult}`;
    }
    if (referralStep) {
      fullNotes += `\nReferral from: ${referralStep}`;
    }

    // Create screening
    const screening = await sql`
      INSERT INTO screenings (
        health_worker_id, client_name, client_phone, client_age, client_gender, client_village,
        client_district, client_county, client_sub_county, client_parish,
        distance_vision_left, distance_vision_right, distance_vision_both,
        near_vision_result, pinhole_test_left, pinhole_test_right,
        needs_glasses, needs_referral, referral_reason,
        recommended_product_id, recommended_power, selected_frame_type,
        notes, offline_id, is_synced
      ) VALUES (
        ${healthWorkerId}, ${clientName || null}, ${clientPhone || null}, ${clientAge || null}, ${clientGender || null}, ${clientVillage || null},
        ${district || null}, ${county || null}, ${subCounty || null}, ${parish || null},
        ${distanceVisionLeft || null}, ${distanceVisionRight || null}, ${distanceVisionBoth || null},
        ${nearVisionResult || null}, ${pinholeTestLeft || null}, ${pinholeTestRight || null},
        ${needsGlasses ? 1 : 0}, ${needsReferral ? 1 : 0}, ${referralReason || null},
        ${recommendedProductId || null}, ${recommendedPower || null}, ${selectedFrameType || null},
        ${fullNotes.trim() || null}, ${offlineId || null}, ${1}
      )
      RETURNING *
    `;

    // If needs referral, create referral record
    if (needsReferral && referralReason) {
      await sql`
        INSERT INTO referrals (
          screening_id, health_worker_id, client_name, client_phone, 
          client_age, client_gender, client_district, reason, urgency
        ) VALUES (
          ${screening[0].id}, ${healthWorkerId}, ${clientName || null}, ${clientPhone || null},
          ${clientAge || null}, ${clientGender || null}, ${district || null}, ${referralReason}, 'normal'
        )
      `;
    }

    // Deduct from this VHT's stock when glasses are dispensed
    if (needsGlasses && recommendedProductId && selectedFrameType) {
      if (selectedFrameType === 'standard') {
        await sql`
          UPDATE vht_stock
          SET stock_quantity = stock_quantity - 1,
              stock_standard = stock_standard - 1
          WHERE health_worker_id = ${healthWorkerId} AND product_id = ${recommendedProductId}
        `;
      } else if (selectedFrameType === 'metal') {
        await sql`
          UPDATE vht_stock
          SET stock_quantity = stock_quantity - 1,
              stock_metal = stock_metal - 1
          WHERE health_worker_id = ${healthWorkerId} AND product_id = ${recommendedProductId}
        `;
      } else if (selectedFrameType === 'fashion') {
        await sql`
          UPDATE vht_stock
          SET stock_quantity = stock_quantity - 1,
              stock_fashion = stock_fashion - 1
          WHERE health_worker_id = ${healthWorkerId} AND product_id = ${recommendedProductId}
        `;
      }
    }

    res.json({
      success: true,
      message: "Screening created successfully",
      screeningId: screening[0].id,
      data: screening[0],
    });
  } catch (error) {
    console.error("Create screening error:", error);
    console.error("Request body:", req.body);
    console.error("Error details:", error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      error: "Failed to create screening",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all screenings for a health worker
exports.getScreenings = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    let healthWorkerId = req.user?.userId;
    
    // Get a valid CHW ID for testing if no authenticated user
    if (!healthWorkerId) {
      const chwUsers = await sql`SELECT id FROM users WHERE role = 'CHW' LIMIT 1`;
      healthWorkerId = chwUsers.length > 0 ? chwUsers[0].id : null;
    }
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
    let healthWorkerId = req.user?.userId;
    
    // Get a valid CHW ID for testing if no authenticated user
    if (!healthWorkerId) {
      const chwUsers = await sql`SELECT id FROM users WHERE role = 'CHW' LIMIT 1`;
      healthWorkerId = chwUsers.length > 0 ? chwUsers[0].id : null;
    }

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
