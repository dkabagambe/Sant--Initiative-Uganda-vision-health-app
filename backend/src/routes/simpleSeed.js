const express = require('express');
const router = express.Router();

// Simple data seeding endpoint
router.post('/seed-simple', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    console.log('🌱 Seeding simple sample data...');
    
    // 1. Add sample screenings with existing columns
    const screenings = [
      {
        clientName: 'Aisha Nantume', clientPhone: '0781234567', clientAge: 45, clientGender: 'Female',
        hwId: 'f396ba90-2feb-489b-9bfc-64a3268dbf7f',
        distanceLeft: '6/6', distanceRight: '6/6', nearResult: 'N6', needsGlasses: false, needsReferral: false,
        screeningDate: '2026-02-15'
      },
      {
        clientName: 'Peter Okello', clientPhone: '0782345678', clientAge: 38, clientGender: 'Male',
        hwId: 'f396ba90-2feb-489b-9bfc-64a3268dbf7f',
        distanceLeft: '6/12', distanceRight: '6/12', nearResult: 'N8', needsGlasses: true, needsReferral: false,
        recommendedPower: '+1.50', screeningDate: '2026-02-16'
      },
      {
        clientName: 'Mariam Babirye', clientPhone: '0783456789', clientAge: 52, clientGender: 'Female',
        hwId: '2a3405dc-35e1-4cc2-a152-fd41b08e8b8b',
        distanceLeft: '6/18', distanceRight: '6/18', nearResult: 'N10', needsGlasses: true, needsReferral: false,
        recommendedPower: '+2.00', screeningDate: '2026-02-17'
      },
      {
        clientName: 'John Ssenyonjo', clientPhone: '0784567890', clientAge: 67, clientGender: 'Male',
        hwId: '8ca20913-4720-44c2-91d0-cbc257256a37',
        distanceLeft: '6/60', distanceRight: '6/60', nearResult: 'N12', needsGlasses: true, needsReferral: true,
        referralReason: 'Severe vision impairment - cataract suspected', screeningDate: '2026-02-18'
      },
      {
        clientName: 'Grace Nakigozi', clientPhone: '0785678901', clientAge: 41, clientGender: 'Female',
        hwId: '8ca20913-4720-44c2-91d0-cbc257256a37',
        distanceLeft: '6/9', distanceRight: '6/9', nearResult: 'N6', needsGlasses: false, needsReferral: false,
        screeningDate: '2026-02-19'
      }
    ];
    
    for (const screening of screenings) {
      await sql`
        INSERT INTO screenings (
          client_name, client_phone, client_age, client_gender, health_worker_id,
          distance_vision_left, distance_vision_right, near_vision_result, needs_glasses, needs_referral,
          referral_reason, recommended_power, screening_date
        ) VALUES (
          ${screening.clientName}, ${screening.clientPhone}, ${screening.clientAge}, ${screening.clientGender},
          ${screening.hwId}, ${screening.distanceLeft}, ${screening.distanceRight}, ${screening.nearResult},
          ${screening.needsGlasses}, ${screening.needsReferral}, ${screening.referralReason || null},
          ${screening.recommendedPower || null}, ${screening.screeningDate}
        )
      `;
    }
    
    // 2. Add sample referrals
    await sql`
      INSERT INTO referrals (client_name, client_phone, client_age, client_gender, health_worker_id, reason, urgency, facility_name, facility_location, referred_date)
      SELECT client_name, client_phone, client_age, client_gender, health_worker_id, referral_reason, 'high', 'Mulago National Referral Hospital', 'Kampala', screening_date
      FROM screenings 
      WHERE needs_referral = true
    `;
    
    // 3. Add sample payments
    const payments = [
      { clientName: 'Peter Okello', clientPhone: '0782345678', amount: 15000, mobileMoney: '0782345678', status: 'completed' },
      { clientName: 'Mariam Babirye', clientPhone: '0783456789', amount: 15000, mobileMoney: '0783456789', status: 'completed' },
      { clientName: 'Aisha Nantume', clientPhone: '0781234567', amount: 18000, mobileMoney: '0781234567', status: 'pending' }
    ];
    
    for (const payment of payments) {
      await sql`
        INSERT INTO payments (client_name, client_phone, amount, mobile_money_number, status)
        VALUES (${payment.clientName}, ${payment.clientPhone}, ${payment.amount}, ${payment.mobileMoney}, ${payment.status})
      `;
    }
    
    // 4. Update product stock to show some activity
    await sql`
      UPDATE products SET 
        stock_quantity = stock_quantity - CASE 
          WHEN power = '+1.50' THEN 2
          WHEN power = '+2.00' THEN 3
          ELSE 0
        END
    `;
    
    // Get summary statistics
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'CHW') as vht_count,
        (SELECT COUNT(*) FROM screenings) as screening_count,
        (SELECT COUNT(*) FROM referrals) as referral_count,
        (SELECT COUNT(*) FROM payments) as payment_count
    `;
    
    res.json({
      success: true,
      message: 'Simple data seeding completed!',
      stats: stats[0],
      data_added: {
        screenings: screenings.length,
        payments: payments.length
      }
    });
    
  } catch (error) {
    console.error('Simple data seeding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
