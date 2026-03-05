const express = require('express');
const router = express.Router();

// Simple referrals endpoint without authentication
router.get('/list', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { status, limit = 50, offset = 0 } = req.query;

    let referrals;
    if (status) {
      referrals = await sql`
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
          r.urgency,
          r.status,
          r.referred_date,
          r.completed_date,
          r.notes,
          r.health_worker_id,
          u.full_name as health_worker_name,
          r.created_at,
          r.screening_id,
          s.needs_glasses,
          s.needs_referral
        FROM referrals r
        LEFT JOIN users u ON r.health_worker_id = u.id
        LEFT JOIN screenings s ON r.screening_id = s.id
        WHERE r.status = ${status}
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      referrals = await sql`
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
          r.urgency,
          r.status,
          r.referred_date,
          r.completed_date,
          r.notes,
          r.health_worker_id,
          u.full_name as health_worker_name,
          r.created_at,
          r.screening_id,
          s.needs_glasses,
          s.needs_referral
        FROM referrals r
        LEFT JOIN users u ON r.health_worker_id = u.id
        LEFT JOIN screenings s ON r.screening_id = s.id
        ORDER BY r.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const total = await sql`
      SELECT COUNT(*) as count FROM referrals
    `;

    res.json({
      success: true,
      data: referrals,
      count: referrals.length,
      total: parseInt(total[0].count),
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch referrals',
      details: error.message 
    });
  }
});

// Create new referral
router.post('/create', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const {
      client_name,
      client_phone,
      client_age,
      client_gender,
      client_district,
      reason,
      facility_name,
      facility_location,
      urgency = 'normal',
      notes,
      health_worker_id,
      screening_id
    } = req.body;

    // Get a valid health worker ID if not provided
    let workerId = health_worker_id;
    if (!workerId) {
      const workers = await sql`SELECT id FROM users WHERE role = 'health_worker' LIMIT 1`;
      if (workers.length > 0) {
        workerId = workers[0].id;
      }
    }

    const referral = await sql`
      INSERT INTO referrals (
        client_name, client_phone, client_age, client_gender, client_district,
        reason, facility_name, facility_location, urgency, notes,
        health_worker_id, screening_id, referred_date, created_at
      ) VALUES (
        ${client_name || null}, ${client_phone || null}, ${client_age || null}, ${client_gender || null}, ${client_district || null},
        ${reason || null}, ${facility_name || null}, ${facility_location || null}, ${urgency || null}, ${notes || null},
        ${workerId || null}, ${screening_id || null}, ${new Date().toISOString().split('T')[0]}, NOW()
      )
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Referral created successfully',
      data: referral[0]
    });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create referral',
      details: error.message 
    });
  }
});

// Update referral
router.patch('/:id', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const {
      facility_name,
      facility_location,
      notes,
      status,
      urgency
    } = req.body;

    const referral = await sql`
      UPDATE referrals 
      SET 
        facility_name = COALESCE(${facility_name}, facility_name),
        facility_location = COALESCE(${facility_location}, facility_location),
        notes = COALESCE(${notes}, notes),
        status = COALESCE(${status}, status),
        urgency = COALESCE(${urgency}, urgency),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (referral.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Referral not found'
      });
    }

    res.json({
      success: true,
      message: 'Referral updated successfully',
      data: referral[0]
    });
  } catch (error) {
    console.error('Update referral error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update referral',
      details: error.message 
    });
  }
});

// Update referral status
router.patch('/:id/status', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const { status, notes } = req.body;

    const referral = await sql`
      UPDATE referrals 
      SET 
        status = ${status},
        completed_date = ${status === 'completed' ? new Date().toISOString().split('T')[0] : 'completed_date'},
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (referral.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Referral not found'
      });
    }

    res.json({
      success: true,
      message: 'Referral status updated successfully',
      data: referral[0]
    });
  } catch (error) {
    console.error('Update referral status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update referral status',
      details: error.message 
    });
  }
});

// Get referral stats
router.get('/stats', async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    const stats = await sql`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_referrals,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
        COUNT(*) FILTER (WHERE urgency = 'high') as high_urgency_referrals,
        COUNT(*) FILTER (WHERE urgency = 'normal') as normal_urgency_referrals
      FROM referrals
    `;

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch referral stats',
      details: error.message 
    });
  }
});

module.exports = router;
