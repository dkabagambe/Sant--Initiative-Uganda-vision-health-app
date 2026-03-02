const express = require('express');
const router = express.Router();

// Auto-fix CHW user and test referral creation
router.post('/fix-chw-and-test', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    // Step 1: Check if CHW users exist
    const chwUsers = await sql`
      SELECT id, phone_number, full_name 
      FROM users 
      WHERE role = 'CHW' 
      LIMIT 1
    `;
    
    let chwId;
    
    if (chwUsers.length === 0) {
      // Step 2: Create a CHW user if none exists
      const newChw = await sql`
        INSERT INTO users (id, phone_number, full_name, role, created_at)
        VALUES (gen_random_uuid(), '0700000001', 'Auto-Generated CHW', 'CHW', CURRENT_TIMESTAMP)
        RETURNING id, phone_number, full_name
      `;
      chwId = newChw[0].id;
      console.log('Created new CHW user:', newChw[0]);
    } else {
      chwId = chwUsers[0].id;
      console.log('Using existing CHW user:', chwUsers[0]);
    }
    
    // Step 3: Test referral creation with the CHW ID
    const testReferral = await sql`
      INSERT INTO referrals (
        client_name, client_phone, client_age, client_gender, 
        health_worker_id, reason, urgency, facility_name, 
        facility_location, status, created_at
      )
      VALUES (
        'Test Patient', '0781234567', 45, 'Female',
        ${chwId}, 'Vision check', 'normal', 'Test Clinic',
        'Kampala', 'pending', CURRENT_TIMESTAMP
      )
      RETURNING id, client_name, health_worker_id
    `;
    
    // Step 4: Clean up the test referral
    await sql`DELETE FROM referrals WHERE id = ${testReferral[0].id}`;
    
    res.json({
      success: true,
      message: 'CHW user and referral creation working perfectly',
      chwId: chwId,
      testReferralCreated: true,
      testReferralDeleted: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Auto-fix error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get current CHW user info
router.get('/get-chw', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const chwUsers = await sql`
      SELECT id, phone_number, full_name, created_at
      FROM users 
      WHERE role = 'CHW' 
      LIMIT 5
    `;
    
    res.json({
      success: true,
      chwUsers: chwUsers,
      count: chwUsers.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
