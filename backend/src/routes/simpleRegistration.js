const express = require('express');
const router = express.Router();

// Simple registration endpoint that works with existing schema
router.post('/submit', async (req, res) => {
  try {
    const { phoneNumber, registrationData } = req.body;
    const sql = req.app.locals.sql;

    if (!phoneNumber || !registrationData) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and registration data required'
      });
    }

    // Check if user exists
    let user = await sql`
      SELECT * FROM users 
      WHERE phone_number = ${phoneNumber}
    `;

    // Create user if doesn't exist
    if (user.length === 0) {
      await sql`
        INSERT INTO users (phone_number, role, full_name)
        VALUES (${phoneNumber}, ${registrationData.role || 'health_worker'}, ${registrationData.firstName && registrationData.lastName ? `${registrationData.firstName} ${registrationData.lastName}` : null})
      `;
      
      user = await sql`
        SELECT * FROM users WHERE phone_number = ${phoneNumber}
      `;
    }

    // Update user with available fields only
    const userData = user[0];
    const updateFields = {};
    
    // Only update fields that exist in the database
    if (registrationData.firstName) updateFields.first_name = registrationData.firstName;
    if (registrationData.lastName) updateFields.last_name = registrationData.lastName;
    if (registrationData.firstName && registrationData.lastName) updateFields.full_name = `${registrationData.firstName} ${registrationData.lastName}`;
    if (registrationData.role) updateFields.role = registrationData.role;
    if (registrationData.village) updateFields.village = registrationData.village;
    if (registrationData.district) updateFields.district = registrationData.district;
    if (registrationData.trainingCertificate) updateFields.training_certificate = registrationData.trainingCertificate;
    if (registrationData.recommendationLetter) updateFields.recommendation_letter = registrationData.recommendationLetter;
    if (registrationData.shopFrontImage) updateFields.shop_front_image = registrationData.shopFrontImage;
    if (registrationData.ownerIdImage) updateFields.owner_id_image = registrationData.ownerIdImage;

    // Build dynamic update query
    if (Object.keys(updateFields).length > 0) {
      const setClause = Object.keys(updateFields).map(key => `${key} = ${updateFields[key]}`).join(', ');
      await sql`
        UPDATE users SET 
          ${setClause},
          updated_at = CURRENT_TIMESTAMP
        WHERE phone_number = ${phoneNumber}
      `;
    }

    // Get updated user
    const updatedUser = await sql`
      SELECT * FROM users WHERE phone_number = ${phoneNumber}
    `;

    res.json({
      success: true,
      message: 'Registration successful',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Simple registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message
    });
  }
});

module.exports = router;
