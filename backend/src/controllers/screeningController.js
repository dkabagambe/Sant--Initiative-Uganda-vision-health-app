// Create new screening
exports.createScreening = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    let healthWorkerId = req.user?.userId;
    
    // If no health worker ID (e.g., testing), get a valid one
    if (!healthWorkerId) {
      const workers = await sql`SELECT id FROM users WHERE role = 'health_worker' LIMIT 1`;
      if (workers.length > 0) {
        healthWorkerId = workers[0].id;
      } else {
        return res.status(400).json({
          success: false,
          error: "No health worker available",
          details: "Please ensure there is at least one health worker in the system"
        });
      }
    }
    
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

      // VHT Workflow Steps
      equipmentChecked,
      consentObtained,
      educationProvided,

      // VHT Key Questions
      hasEyeConcerns,
      followsMovement,
      hasSevereEyePain,
      hasSuddenVisionLoss,
      hasDiabetesHypertension,
      familyHistoryBlindness,
      referralReasonsFromQuestions,

      // VHT Screening Preparation
      screeningAreaPrepared,
      testsExplainedToClient,

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

      // VHT Reading Glasses
      glassesDispensed,
      glassesPower,
      glassesFrameType,
      glassesEducationProvided,

      // Results
      needsGlasses,
      needsReferral,
      referralReason,
      referralFacility,
      referralStep,
      recommendedProductId,
      recommendedPower,
      selectedFrameType,
      notes,
      offlineId,
    } = req.body;

    // Build notes with all test information
    let fullNotes = notes || '';

    // VHT Workflow Information
    if (equipmentChecked) fullNotes += '\n✓ VHT Equipment Check: Completed';
    if (consentObtained) fullNotes += '\n✓ Consent: Obtained';
    if (educationProvided) fullNotes += '\n✓ Eye Health Education: Provided';
    if (screeningAreaPrepared) fullNotes += '\n✓ Screening Area: Prepared';
    if (testsExplainedToClient) fullNotes += '\n✓ Tests Explained: Confirmed';

    // Key Questions Summary
    if (hasEyeConcerns !== undefined || followsMovement !== undefined || hasSevereEyePain !== undefined) {
      fullNotes += '\n--- Key Questions Asked ---';
      if (hasEyeConcerns !== undefined) fullNotes += `\nEye Concerns: ${hasEyeConcerns ? 'YES' : 'NO'}`;
      if (followsMovement !== undefined) fullNotes += `\nFollows Movement: ${followsMovement ? 'YES' : 'NO'}`;
      if (hasSevereEyePain !== undefined) fullNotes += `\nSevere Eye Pain: ${hasSevereEyePain ? 'YES' : 'NO'}`;
      if (hasSuddenVisionLoss !== undefined) fullNotes += `\nSudden Vision Loss: ${hasSuddenVisionLoss ? 'YES' : 'NO'}`;
      if (hasDiabetesHypertension !== undefined) fullNotes += `\nDiabetes/Hypertension: ${hasDiabetesHypertension ? 'YES' : 'NO'}`;
      if (familyHistoryBlindness !== undefined) fullNotes += `\nFamily History Blindness: ${familyHistoryBlindness ? 'YES' : 'NO'}`;
    }

    // Vision Test Results
    if (torchTestPassed !== undefined) {
      fullNotes += `\n--- Vision Tests ---\nTorch Test: ${torchTestPassed ? 'Passed' : 'Failed'}`;
      if (torchTestAbnormalSigns) {
        fullNotes += ` - ${torchTestAbnormalSigns}`;
      }
    }
    if (distanceVisionResult) {
      fullNotes += `\nDistance Vision: ${distanceVisionResult}`;
    }

    // Reading Glasses Dispensing
    if (glassesDispensed) {
      fullNotes += `\n--- Reading Glasses Dispensed ---\nPower: ${glassesPower || 'Not specified'}`;
      fullNotes += `\nFrame Type: ${glassesFrameType || 'Not specified'}`;
      if (glassesEducationProvided) fullNotes += '\nClient Education: Provided';
    }

    // Referral Information
    if (needsReferral) {
      fullNotes += `\n--- Referral ---\nReason: ${referralReason || 'Not specified'}`;
      if (referralFacility) fullNotes += `\nFacility: ${referralFacility}`;
      if (referralStep) fullNotes += `\nReferral from: ${referralStep}`;
    }

    const nullableBool = (value) => value === undefined ? null : Boolean(value);

    // Create screening
    const screening = await sql`
      INSERT INTO screenings (
        health_worker_id, client_name, client_phone, client_age, client_gender, client_village,
        client_district, client_county, client_sub_county, client_parish,
        equipment_checked, consent_obtained, education_provided,
        has_eye_concerns, follows_movement, has_severe_eye_pain, has_sudden_vision_loss,
        has_diabetes_hypertension, family_history_blindness, referral_reasons_from_questions,
        screening_area_prepared, tests_explained_to_client,
        distance_vision_left, distance_vision_right, distance_vision_both,
        near_vision_result, pinhole_test_left, pinhole_test_right,
        torch_test_passed, torch_test_abnormal_signs,
        glasses_dispensed, glasses_power, glasses_frame_type, glasses_education_provided,
        needs_glasses, needs_referral, referral_reason, referral_facility,
        recommended_product_id, recommended_power, selected_frame_type,
        notes, offline_id, is_synced, screening_date
      ) VALUES (
        ${healthWorkerId}, ${clientName || null}, ${clientPhone || null}, ${clientAge || null}, ${clientGender || null}, ${clientVillage || null},
        ${district || null}, ${county || null}, ${subCounty || null}, ${parish || null},
        ${Boolean(equipmentChecked)}, ${Boolean(consentObtained)}, ${Boolean(educationProvided)},
        ${nullableBool(hasEyeConcerns)}, ${nullableBool(followsMovement)}, ${nullableBool(hasSevereEyePain)}, ${nullableBool(hasSuddenVisionLoss)},
        ${nullableBool(hasDiabetesHypertension)}, ${nullableBool(familyHistoryBlindness)}, ${referralReasonsFromQuestions ? JSON.stringify(referralReasonsFromQuestions) : null},
        ${Boolean(screeningAreaPrepared)}, ${Boolean(testsExplainedToClient)},
        ${distanceVisionLeft || null}, ${distanceVisionRight || null}, ${distanceVisionBoth || null},
        ${nearVisionResult || null}, ${pinholeTestLeft || null}, ${pinholeTestRight || null},
        ${nullableBool(torchTestPassed)}, ${torchTestAbnormalSigns || null},
        ${Boolean(glassesDispensed)}, ${glassesPower || null}, ${glassesFrameType || null}, ${Boolean(glassesEducationProvided)},
        ${Boolean(needsGlasses)}, ${Boolean(needsReferral)}, ${referralReason || null}, ${referralFacility || null},
        ${recommendedProductId || null}, ${recommendedPower || null}, ${selectedFrameType || null},
        ${fullNotes.trim() || null}, ${offlineId || null}, ${true}, ${new Date().toISOString().split('T')[0]}
      )
      RETURNING *
    `;

    // If needs referral, create referral record
    if (needsReferral && referralReason) {
      await sql`
        INSERT INTO referrals (
          screening_id, health_worker_id, client_name, client_phone,
          client_age, client_gender, client_district, reason, facility_name, urgency
        ) VALUES (
          ${screening[0].id}, ${healthWorkerId}, ${clientName || null}, ${clientPhone || null},
          ${clientAge || null}, ${clientGender || null}, ${district || null}, ${referralReason}, ${referralFacility || null}, 'normal'
        )
      `;
    }

    // Deduct from this VHT's stock when glasses are dispensed
    if ((glassesDispensed || needsGlasses) && recommendedProductId && (glassesFrameType || selectedFrameType)) {
      const frameType = glassesFrameType || selectedFrameType;

      // Normalize frame type names
      let stockColumn = 'stock_standard';
      if (frameType === 'metal' || frameType === 'Metal Frame (Durable)') {
        stockColumn = 'stock_metal';
      } else if (frameType === 'plastic' || frameType === 'Plastic Frame (Comfortable)' || frameType === 'halfrim' || frameType === 'Half-Rim Frame (Lightweight)') {
        stockColumn = 'stock_metal'; // Use metal for half-rim too, or adjust as needed
      } else if (frameType === 'fashion') {
        stockColumn = 'stock_fashion';
      }

      await sql`
        UPDATE vht_stock
        SET stock_quantity = stock_quantity - 1,
            ${sql(stockColumn)} = ${sql(stockColumn)} - 1
        WHERE health_worker_id = ${healthWorkerId} AND product_id = ${recommendedProductId}
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
