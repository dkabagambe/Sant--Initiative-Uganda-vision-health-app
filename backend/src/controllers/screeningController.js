// Create new screening
exports.createScreening = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    let healthWorkerId = req.user?.userId;

    // Require an authenticated health worker so screenings are attached to the correct person.
    if (!healthWorkerId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        details:
          "Please log in again before creating a screening so it is saved under your profile.",
      });
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
    let fullNotes = notes || "";

    // VHT Workflow Information
    if (equipmentChecked) fullNotes += "\n✓ VHT Equipment Check: Completed";
    if (consentObtained) fullNotes += "\n✓ Consent: Obtained";
    if (educationProvided) fullNotes += "\n✓ Eye Health Education: Provided";
    if (screeningAreaPrepared) fullNotes += "\n✓ Screening Area: Prepared";
    if (testsExplainedToClient) fullNotes += "\n✓ Tests Explained: Confirmed";

    // Key Questions Summary
    if (
      hasEyeConcerns !== undefined ||
      followsMovement !== undefined ||
      hasSevereEyePain !== undefined
    ) {
      fullNotes += "\n--- Key Questions Asked ---";
      if (hasEyeConcerns !== undefined)
        fullNotes += `\nEye Concerns: ${hasEyeConcerns ? "YES" : "NO"}`;
      if (followsMovement !== undefined)
        fullNotes += `\nFollows Movement: ${followsMovement ? "YES" : "NO"}`;
      if (hasSevereEyePain !== undefined)
        fullNotes += `\nSevere Eye Pain: ${hasSevereEyePain ? "YES" : "NO"}`;
      if (hasSuddenVisionLoss !== undefined)
        fullNotes += `\nSudden Vision Loss: ${hasSuddenVisionLoss ? "YES" : "NO"}`;
      if (hasDiabetesHypertension !== undefined)
        fullNotes += `\nDiabetes/Hypertension: ${hasDiabetesHypertension ? "YES" : "NO"}`;
      if (familyHistoryBlindness !== undefined)
        fullNotes += `\nFamily History Blindness: ${familyHistoryBlindness ? "YES" : "NO"}`;
    }

    // Vision Test Results
    if (torchTestPassed !== undefined) {
      fullNotes += `\n--- Vision Tests ---\nTorch Test: ${torchTestPassed ? "Passed" : "Failed"}`;
      if (torchTestAbnormalSigns) {
        fullNotes += ` - ${torchTestAbnormalSigns}`;
      }
    }
    if (distanceVisionResult) {
      fullNotes += `\nDistance Vision: ${distanceVisionResult}`;
    }

    // Reading Glasses Dispensing
    if (glassesDispensed) {
      fullNotes += `\n--- Reading Glasses Dispensed ---\nPower: ${glassesPower || "Not specified"}`;
      fullNotes += `\nFrame Type: ${glassesFrameType || "Not specified"}`;
      if (glassesEducationProvided) fullNotes += "\nClient Education: Provided";
    }

    // Referral Information
    if (needsReferral) {
      fullNotes += `\n--- Referral ---\nReason: ${referralReason || "Not specified"}`;
      if (referralFacility) fullNotes += `\nFacility: ${referralFacility}`;
      if (referralStep) fullNotes += `\nReferral from: ${referralStep}`;
    }

    const nullableBool = (value) =>
      value === undefined ? null : Boolean(value);

    // Create screening
    const screening = await sql`
      INSERT INTO screenings (
        health_worker_id, client_name, client_phone, client_age, client_gender, client_village,
        district, county, sub_county, parish,
        distance_vision_left, distance_vision_right, distance_vision_both, distance_vision_result,
        near_vision_result, near_vision_passed,
        pinhole_test_left, pinhole_test_right,
        torch_test_passed, torch_test_abnormal_signs,
        key_questions_passed, key_questions_referral_reasons,
        glasses_dispensed, glasses_power, glasses_frame_type,
        needs_glasses, needs_referral, referral_reason, referral_urgency, referral_step,
        recommended_product_id, recommended_power, selected_frame_type,
        notes, offline_id, is_synced, screening_date
      ) VALUES (
        ${healthWorkerId}, ${clientName || null}, ${clientPhone || null}, ${clientAge || null}, ${clientGender || null}, ${clientVillage || null},
        ${district || null}, ${county || null}, ${subCounty || null}, ${parish || null},
        ${distanceVisionLeft || null}, ${distanceVisionRight || null}, ${distanceVisionBoth || null}, ${distanceVisionResult || null},
        ${nearVisionResult || null}, ${nearVisionResult === "passed" ? true : nearVisionResult === "failed" ? false : null},
        ${pinholeTestLeft || null}, ${pinholeTestRight || null},
        ${nullableBool(torchTestPassed)}, ${torchTestAbnormalSigns || null},
        ${nullableBool(referralReasonsFromQuestions ? false : null)}, ${referralReasonsFromQuestions ? JSON.stringify(referralReasonsFromQuestions) : null},
        ${Boolean(glassesDispensed)}, ${glassesPower || recommendedPower || null}, ${glassesFrameType || selectedFrameType || null},
        ${Boolean(needsGlasses)}, ${Boolean(needsReferral)}, ${referralReason || null},
        ${req.body.referralUrgency || 'normal'}, ${referralStep || null},
        ${recommendedProductId || null}, ${recommendedPower || glassesPower || null}, ${selectedFrameType || glassesFrameType || null},
        ${fullNotes.trim() || null}, ${offlineId || null}, ${true}, ${new Date().toISOString().split("T")[0]}
      )
      RETURNING *
    `;

    // If needs referral, create referral record
    if (needsReferral && referralReason) {
      await sql`
        INSERT INTO referrals (
          screening_id, health_worker_id, client_name, client_phone,
          client_age, client_gender, client_district, reason, facility_name, urgency, notes
        ) VALUES (
          ${screening[0].id}, ${healthWorkerId}, ${clientName || null}, ${clientPhone || null},
          ${clientAge || null}, ${clientGender || null}, ${district || null},
          ${referralReason}, ${req.body.referralFacility || null},
          ${req.body.referralUrgency || 'normal'},
          ${referralStep ? `Referred from: ${referralStep}` : null}
        )
      `;
    }

    // Deduct from this VHT's stock when glasses are dispensed.
    // Wrapped in its own try/catch so a missing vht_stock row never kills the screening save.
    if (
      (glassesDispensed || needsGlasses) &&
      recommendedProductId &&
      (glassesFrameType || selectedFrameType)
    ) {
      try {
        const frameType = glassesFrameType || selectedFrameType;

        // Use explicit column names — avoid sql() identifier interpolation which
        // breaks on Neon/Vercel postgres when mixed with other parameters.
        if (frameType === "metal" || frameType === "Metal Frame (Durable)") {
          await sql`
            UPDATE vht_stock
            SET stock_quantity = GREATEST(stock_quantity - 1, 0),
                stock_metal    = GREATEST(stock_metal    - 1, 0)
            WHERE health_worker_id = ${healthWorkerId}
              AND product_id       = ${recommendedProductId}
          `;
        } else if (frameType === "plastic" || frameType === "Plastic Frame (Comfortable)") {
          await sql`
            UPDATE vht_stock
            SET stock_quantity  = GREATEST(stock_quantity  - 1, 0),
                stock_standard  = GREATEST(stock_standard  - 1, 0)
            WHERE health_worker_id = ${healthWorkerId}
              AND product_id       = ${recommendedProductId}
          `;
        } else if (frameType === "halfrim" || frameType === "Half-Rim Frame (Lightweight)") {
          await sql`
            UPDATE vht_stock
            SET stock_quantity = GREATEST(stock_quantity - 1, 0),
                stock_standard = GREATEST(stock_standard - 1, 0)
            WHERE health_worker_id = ${healthWorkerId}
              AND product_id       = ${recommendedProductId}
          `;
        } else if (frameType === "fashion") {
          await sql`
            UPDATE vht_stock
            SET stock_quantity = GREATEST(stock_quantity - 1, 0),
                stock_fashion  = GREATEST(stock_fashion  - 1, 0)
            WHERE health_worker_id = ${healthWorkerId}
              AND product_id       = ${recommendedProductId}
          `;
        } else {
          await sql`
            UPDATE vht_stock
            SET stock_quantity = GREATEST(stock_quantity - 1, 0),
                stock_standard = GREATEST(stock_standard - 1, 0)
            WHERE health_worker_id = ${healthWorkerId}
              AND product_id       = ${recommendedProductId}
          `;
        }
      } catch (stockError) {
        // Non-fatal — vht_stock row may not exist yet for this VHT/product combination
        console.warn("Stock deduction skipped (non-fatal):", stockError.message);
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
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all screenings for a health worker
exports.getScreenings = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId;

    if (!healthWorkerId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
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
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch screenings" });
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
      return res
        .status(404)
        .json({ success: false, error: "Screening not found" });
    }

    res.json({
      success: true,
      data: screening[0],
    });
  } catch (error) {
    console.error("Get screening error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch screening" });
  }
};

// Get screening statistics
exports.getScreeningStats = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId;

    if (!healthWorkerId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const stats = await sql`
      SELECT 
        COUNT(*) as total_screenings,
        COUNT(CASE WHEN needs_glasses = true OR glasses_dispensed = true THEN 1 END) as clients_needing_glasses,
        COUNT(CASE WHEN needs_referral = true THEN 1 END) as clients_referred,
        COUNT(CASE WHEN COALESCE(screening_date::date, created_at::date) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as screenings_this_week,
        COUNT(CASE WHEN COALESCE(screening_date::date, created_at::date) >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as screenings_this_month
      FROM screenings
      WHERE health_worker_id = ${healthWorkerId}
    `;

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Get screening stats error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch statistics" });
  }
};
