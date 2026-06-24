const express = require('express');
const router = express.Router();
const { toCanonicalPhone, phoneLookupVariants, phonesMatch } = require('../utils/phoneUtils');

async function findUserByPhone(sql, phoneNumber) {
  const variants = phoneLookupVariants(phoneNumber);
  if (variants.length === 0) return null;

  const [v0, v1, v2, v3, v4, v5] = variants;
  let users = await sql`
    SELECT * FROM users
    WHERE phone_number IN (${v0}, ${v1}, ${v2}, ${v3}, ${v4}, ${v5})
    ORDER BY created_at DESC
  `;
  if (users.length > 0) return users[0];

  const canonical = toCanonicalPhone(phoneNumber);
  if (!canonical) return null;
  const suffix = canonical.slice(1);
  const candidates = await sql`
    SELECT * FROM users WHERE phone_number LIKE ${'%' + suffix + '%'}
    ORDER BY created_at DESC LIMIT 20
  `;
  for (const candidate of candidates) {
    if (phonesMatch(candidate.phone_number, phoneNumber)) return candidate;
  }
  return null;
}

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

    const canonicalPhone = toCanonicalPhone(phoneNumber);
    if (!canonicalPhone) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }

    let user = await findUserByPhone(sql, canonicalPhone);

    // Create user if doesn't exist
    if (!user) {
      await sql`
        INSERT INTO users (phone_number, role, full_name)
        VALUES (${canonicalPhone}, ${registrationData.role || 'health_worker'}, ${registrationData.firstName && registrationData.lastName ? `${registrationData.firstName} ${registrationData.lastName}` : null})
      `;

      user = await findUserByPhone(sql, canonicalPhone);
    }

    const userData = user;
    const updateFields = {};
    
    // Only update fields that exist in the database
    if (registrationData.firstName) updateFields.first_name = registrationData.firstName;
    if (registrationData.lastName) updateFields.last_name = registrationData.lastName;
    if (registrationData.firstName && registrationData.lastName) updateFields.full_name = `${registrationData.firstName} ${registrationData.lastName}`;
    if (registrationData.role) updateFields.role = registrationData.role;
    if (registrationData.village) updateFields.village = registrationData.village;
    if (registrationData.district) updateFields.district = registrationData.district;
    if (registrationData.county) updateFields.county = registrationData.county;
    if (registrationData.subcounty) updateFields.subcounty = registrationData.subcounty;
    if (registrationData.parish) updateFields.parish = registrationData.parish;
    if (registrationData.meeting_location) updateFields.meeting_location = registrationData.meeting_location;
    
    // VSLA-specific fields - store as JSON in notes field
    if (registrationData.chairperson || registrationData.treasurer || registrationData.secretary) {
      const vslaLeadership = {
        chairperson: registrationData.chairperson || {},
        treasurer: registrationData.treasurer || {},
        secretary: registrationData.secretary || {}
      };
      updateFields.notes = JSON.stringify(vslaLeadership);
    }
    
    // General fields
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
        WHERE phone_number = ${userData.phone_number}
      `;
    }

    const updatedUser = await sql`
      SELECT * FROM users WHERE id = ${userData.id}
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
