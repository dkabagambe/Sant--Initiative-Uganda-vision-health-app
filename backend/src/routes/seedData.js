const express = require('express');
const router = express.Router();

// Comprehensive data seeding endpoint
router.post('/seed-all-data', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    console.log('🌱 Seeding comprehensive sample data...');
    
    // 1. Add more VHT users
    const vhtUsers = [
      { phone: '0771234567', fullName: 'Grace Nakato', firstName: 'Grace', lastName: 'Nakato', district: 'Kampala', village: 'Ntinda' },
      { phone: '0772345678', fullName: 'Joseph Ssebadduka', firstName: 'Joseph', lastName: 'Ssebadduka', district: 'Wakiso', village: 'Kira' },
      { phone: '0773456789', fullName: 'Mariam Nalubega', firstName: 'Mariam', lastName: 'Nalubega', district: 'Mukono', village: 'Najjanankumbi' },
      { phone: '0774567890', fullName: 'David Muwanga', firstName: 'David', lastName: 'Muwanga', district: 'Jinja', village: 'Bugembe' },
      { phone: '0775678901', fullName: 'Sarah Namazzi', firstName: 'Sarah', lastName: 'Namazzi', district: 'Iganga', village: 'Bulogo' }
    ];
    
    for (const user of vhtUsers) {
      await sql`
        INSERT INTO users (phone_number, full_name, first_name, last_name, district, village, role)
        VALUES (${user.phone}, ${user.fullName}, ${user.firstName}, ${user.lastName}, ${user.district}, ${user.village}, 'CHW')
        ON CONFLICT (phone_number) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          district = EXCLUDED.district,
          village = EXCLUDED.village
      `;
    }
    
    // 2. Add sample clients
    const clients = [
      { name: 'Aisha Nantume', phone: '0781234567', age: 45, gender: 'Female', district: 'Kampala', village: 'Bwaise', hwId: 'f396ba90-2feb-489b-9bfc-64a3268dbf7f' },
      { name: 'Peter Okello', phone: '0782345678', age: 38, gender: 'Male', district: 'Kampala', village: 'Kawempe', hwId: 'f396ba90-2feb-489b-9bfc-64a3268dbf7f' },
      { name: 'Mariam Babirye', phone: '0783456789', age: 52, gender: 'Female', district: 'Wakiso', village: 'Entebbe', hwId: '2a3405dc-35e1-4cc2-a152-fd41b08e8b8b' },
      { name: 'John Ssenyonjo', phone: '0784567890', age: 67, gender: 'Male', district: 'Mukono', village: 'Najjanankumbi', hwId: '8ca20913-4720-44c2-91d0-cbc257256a37' },
      { name: 'Grace Nakigozi', phone: '0785678901', age: 41, gender: 'Female', district: 'Jinja', village: 'Bugembe', hwId: '8ca20913-4720-44c2-91d0-cbc257256a37' },
      { name: 'Samuel Waiswa', phone: '0786789012', age: 29, gender: 'Male', district: 'Kampala', village: 'Ntinda', hwId: 'f396ba90-2feb-489b-9bfc-64a3268dbf7f' },
      { name: 'Rebecca Nankya', phone: '0787890123', age: 58, gender: 'Female', district: 'Wakiso', village: 'Kira', hwId: '2a3405dc-35e1-4cc2-a152-fd41b08e8b8b' },
      { name: 'Michael Ssewanyana', phone: '0788901234', age: 35, gender: 'Male', district: 'Mukono', village: 'Najjanankumbi', hwId: '8ca20913-4720-44c2-91d0-cbc257256a37' }
    ];
    
    for (const client of clients) {
      await sql`
        INSERT INTO clients (health_worker_id, full_name, phone_number, age, gender, district, village)
        VALUES (${client.hwId}, ${client.name}, ${client.phone}, ${client.age}, ${client.gender}, ${client.district}, ${client.village})
        ON CONFLICT DO NOTHING
      `;
    }
    
    // 3. Add sample screenings
    const screenings = [
      {
        clientId: null, clientName: 'Aisha Nantume', clientPhone: '0781234567', clientAge: 45, clientGender: 'Female',
        district: 'Kampala', village: 'Bwaise', hwId: 'f396ba90-2feb-489b-9bfc-64a3268dbf7f',
        distanceLeft: '6/6', distanceRight: '6/6', nearResult: 'N6', needsGlasses: false, needsReferral: false,
        screeningDate: '2026-02-15'
      },
      {
        clientId: null, clientName: 'Peter Okello', clientPhone: '0782345678', clientAge: 38, clientGender: 'Male',
        district: 'Kampala', village: 'Kawempe', hwId: 'f396ba90-2feb-489b-9bfc-64a3268dbf7f',
        distanceLeft: '6/12', distanceRight: '6/12', nearResult: 'N8', needsGlasses: true, needsReferral: false,
        recommendedPower: '+1.50', screeningDate: '2026-02-16'
      },
      {
        clientId: null, clientName: 'Mariam Babirye', clientPhone: '0783456789', clientAge: 52, clientGender: 'Female',
        district: 'Wakiso', village: 'Entebbe', hwId: '2a3405dc-35e1-4cc2-a152-fd41b08e8b8b',
        distanceLeft: '6/18', distanceRight: '6/18', nearResult: 'N10', needsGlasses: true, needsReferral: false,
        recommendedPower: '+2.00', screeningDate: '2026-02-17'
      },
      {
        clientId: null, clientName: 'John Ssenyonjo', clientPhone: '0784567890', clientAge: 67, clientGender: 'Male',
        district: 'Mukono', village: 'Najjanankumbi', hwId: '8ca20913-4720-44c2-91d0-cbc257256a37',
        distanceLeft: '6/60', distanceRight: '6/60', nearResult: 'N12', needsGlasses: true, needsReferral: true,
        referralReason: 'Severe vision impairment - cataract suspected', screeningDate: '2026-02-18'
      },
      {
        clientId: null, clientName: 'Grace Nakigozi', clientPhone: '0785678901', clientAge: 41, clientGender: 'Female',
        district: 'Jinja', village: 'Bugembe', hwId: '8ca20913-4720-44c2-91d0-cbc257256a37',
        distanceLeft: '6/9', distanceRight: '6/9', nearResult: 'N6', needsGlasses: false, needsReferral: false,
        screeningDate: '2026-02-19'
      },
      {
        clientId: null, clientName: 'Samuel Waiswa', clientPhone: '0786789012', clientAge: 29, clientGender: 'Male',
        district: 'Kampala', village: 'Ntinda', hwId: 'f396ba90-2feb-489b-9bfc-64a3268dbf7f',
        distanceLeft: '6/6', distanceRight: '6/6', nearResult: 'N6', needsGlasses: false, needsReferral: false,
        screeningDate: '2026-02-20'
      }
    ];
    
    for (const screening of screenings) {
      await sql`
        INSERT INTO screenings (
          client_name, client_phone, client_age, client_gender, district, village, health_worker_id,
          distance_vision_left, distance_vision_right, near_vision_result, needs_glasses, needs_referral,
          referral_reason, recommended_power, screening_date
        ) VALUES (
          ${screening.clientName}, ${screening.clientPhone}, ${screening.clientAge}, ${screening.clientGender},
          ${screening.district}, ${screening.village}, ${screening.hwId},
          ${screening.distanceLeft}, ${screening.distanceRight}, ${screening.nearResult},
          ${screening.needsGlasses}, ${screening.needsReferral}, ${screening.referralReason || null},
          ${screening.recommendedPower || null}, ${screening.screeningDate}
        )
      `;
    }
    
    // 4. Add referrals
    await sql`
      INSERT INTO referrals (screening_id, client_name, client_phone, client_age, client_gender, district, health_worker_id, reason, urgency, facility_name, facility_location, referred_date)
      SELECT id, client_name, client_phone, client_age, client_gender, district, health_worker_id, referral_reason, 'high', 'Mulago National Referral Hospital', 'Kampala', screening_date
      FROM screenings 
      WHERE needs_referral = true
    `;
    
    // 5. Add sample payments
    const payments = [
      { clientName: 'Peter Okello', clientPhone: '0782345678', amount: 15000, mobileMoney: '0782345678', status: 'completed', paymentDate: '2026-02-16' },
      { clientName: 'Mariam Babirye', clientPhone: '0783456789', amount: 15000, mobileMoney: '0783456789', status: 'completed', paymentDate: '2026-02-17' },
      { clientName: 'Aisha Nantume', clientPhone: '0781234567', amount: 18000, mobileMoney: '0781234567', status: 'pending', paymentDate: '2026-02-20' }
    ];
    
    for (const payment of payments) {
      await sql`
        INSERT INTO payments (client_name, client_phone, amount, mobile_money_number, status, payment_date)
        VALUES (${payment.clientName}, ${payment.clientPhone}, ${payment.amount}, ${payment.mobileMoney}, ${payment.status}, ${payment.paymentDate})
      `;
    }
    
    // 6. Update product stock to show some activity
    await sql`
      UPDATE products SET 
        stock_quantity = stock_quantity - CASE 
          WHEN power = '+1.50' THEN 2
          WHEN power = '+2.00' THEN 3
          WHEN power = '+3.50' THEN 1
          ELSE 0
        END
    `;
    
    // Get summary statistics
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'CHW') as vht_count,
        (SELECT COUNT(*) FROM screenings) as screening_count,
        (SELECT COUNT(*) FROM referrals) as referral_count,
        (SELECT COUNT(*) FROM payments) as payment_count,
        (SELECT COUNT(*) FROM clients) as client_count
    `;
    
    res.json({
      success: true,
      message: 'Comprehensive data seeding completed!',
      stats: stats[0],
      data_added: {
        vht_users: vhtUsers.length,
        clients: clients.length,
        screenings: screenings.length,
        payments: payments.length
      }
    });
    
  } catch (error) {
    console.error('Data seeding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
