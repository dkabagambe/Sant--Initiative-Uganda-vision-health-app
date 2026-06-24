const express = require('express');
const router = express.Router();

// List clients needing follow-up (pending referrals + glasses dispensed)
router.get('/pending', async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    const pendingReferrals = await sql`
      SELECT
        r.id,
        r.client_name,
        r.client_phone,
        r.client_age,
        r.client_gender,
        r.client_district,
        r.reason,
        r.facility_name,
        r.facility_location,
        r.status,
        r.referred_date,
        r.screening_id,
        'referral' as follow_up_type,
        r.created_at
      FROM referrals r
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    const glassesClients = await sql`
      SELECT
        s.id as screening_id,
        s.client_name,
        s.client_phone,
        s.client_age,
        s.client_gender,
        s.client_district,
        s.glasses_power,
        s.screening_date,
        'glasses' as follow_up_type,
        s.created_at
      FROM screenings s
      WHERE s.glasses_dispensed = true
        AND s.client_name IS NOT NULL
      ORDER BY s.created_at DESC
      LIMIT 50
    `;

    res.json({
      success: true,
      data: {
        referrals: pendingReferrals,
        glasses: glassesClients,
      },
    });
  } catch (error) {
    console.error('Get pending follow-ups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending follow-ups',
      details: error.message,
    });
  }
});

// Record a community follow-up visit
router.post('/create', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const {
      follow_up_type,
      screening_id,
      referral_id,
      client_name,
      client_phone,
      client_age,
      client_district,
      attended_facility,
      treatment_received,
      barriers,
      glasses_in_use,
      glasses_help,
      has_headaches,
      glasses_condition,
      education_reinforced,
      needs_referral,
      notes,
      health_worker_id,
    } = req.body;

    let workerId = health_worker_id;
    if (!workerId) {
      const workers = await sql`SELECT id FROM users WHERE role = 'health_worker' LIMIT 1`;
      if (workers.length > 0) workerId = workers[0].id;
    }

    const followUp = await sql`
      INSERT INTO follow_ups (
        follow_up_type, screening_id, referral_id,
        client_name, client_phone, client_age, client_district,
        attended_facility, treatment_received, barriers,
        glasses_in_use, glasses_help, has_headaches, glasses_condition,
        education_reinforced, needs_referral, notes,
        health_worker_id, visit_date, created_at
      ) VALUES (
        ${follow_up_type || null}, ${screening_id || null}, ${referral_id || null},
        ${client_name || null}, ${client_phone || null}, ${client_age || null}, ${client_district || null},
        ${attended_facility ?? null}, ${treatment_received || null}, ${barriers || null},
        ${glasses_in_use ?? null}, ${glasses_help ?? null}, ${has_headaches ?? null}, ${glasses_condition || null},
        ${education_reinforced ?? false}, ${needs_referral ?? false}, ${notes || null},
        ${workerId || null}, ${new Date().toISOString().split('T')[0]}, NOW()
      )
      RETURNING *
    `;

    if (referral_id && attended_facility === true) {
      await sql`
        UPDATE referrals
        SET status = 'completed',
            completed_date = ${new Date().toISOString().split('T')[0]},
            notes = COALESCE(${notes}, notes)
        WHERE id = ${referral_id}
      `;
    }

    res.json({
      success: true,
      message: 'Follow-up recorded successfully',
      data: followUp[0],
    });
  } catch (error) {
    console.error('Create follow-up error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record follow-up',
      details: error.message,
    });
  }
});

// List recorded follow-ups
router.get('/list', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { limit = 50, offset = 0 } = req.query;

    const followUps = await sql`
      SELECT *
      FROM follow_ups
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    res.json({
      success: true,
      data: followUps,
      count: followUps.length,
    });
  } catch (error) {
    console.error('List follow-ups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch follow-ups',
      details: error.message,
    });
  }
});

module.exports = router;
