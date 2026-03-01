const express = require('express');
const router = express.Router();

// Populate users with sample data
router.post('/fill-user-data', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    console.log('👤 Populating user data...');
    
    // Sample VHT names and districts
    const sampleUsers = [
      { phone: '0773445538', fullName: 'John Mukasa', firstName: 'John', lastName: 'Mukasa', district: 'Kampala', village: 'Kawempe' },
      { phone: '0773445535', fullName: 'Sarah Nankya', firstName: 'Sarah', lastName: 'Nankya', district: 'Wakiso', village: 'Entebbe' },
      { phone: '0650499280', fullName: 'Peter Ssemwanga', firstName: 'Peter', lastName: 'Ssemwanga', district: 'Mukono', village: 'Najjanankumbi' },
      { phone: '0756789012', fullName: 'Grace Namazzi', firstName: 'Grace', lastName: 'Namazzi', district: 'Jinja', village: 'Bugembe' }
    ];
    
    for (const user of sampleUsers) {
      await sql`
        UPDATE users 
        SET 
          full_name = ${user.fullName},
          first_name = ${user.firstName},
          last_name = ${user.lastName},
          district = ${user.district},
          village = ${user.village}
        WHERE phone_number = ${user.phone}
      `;
      console.log(`✓ Updated user: ${user.fullName}`);
    }
    
    // Verify the updates
    const updatedUsers = await sql`
      SELECT id, phone_number, full_name, first_name, last_name, district, village, role 
      FROM users 
      ORDER BY full_name
    `;
    
    res.json({
      success: true,
      message: 'User data populated successfully!',
      users: updatedUsers
    });
    
  } catch (error) {
    console.error('User population error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
