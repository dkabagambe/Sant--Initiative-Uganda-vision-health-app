const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Get all users by role type
router.get('/vhts', authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const vhts = await sql`
      SELECT 
        id, phone_number, first_name, last_name, full_name,
        gender, district, village, sub_county, region,
        years_of_experience, training_certificate,
        created_at, last_login, is_active
      FROM users 
      WHERE role = 'CHW' OR role = 'health_worker'
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: vhts.map(vht => ({
        id: vht.id,
        phoneNumber: vht.phone_number,
        firstName: vht.first_name,
        lastName: vht.last_name,
        fullName: vht.full_name,
        gender: vht.gender,
        district: vht.district,
        village: vht.village,
        subCounty: vht.sub_county,
        region: vht.region,
        yearsOfExperience: vht.years_of_experience,
        trainingCertificate: vht.training_certificate,
        createdAt: vht.created_at,
        lastLogin: vht.last_login,
        isActive: vht.is_active
      })),
      count: vhts.length
    });
  } catch (error) {
    console.error('Get VHTs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch VHTs' });
  }
});

router.get('/vslas', authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const vslas = await sql`
      SELECT 
        id, phone_number, first_name, last_name, full_name,
        gender, district, village, sub_county, region,
        organization_name, registration_number,
        chairperson, group_size, meeting_frequency,
        created_at, last_login, is_active
      FROM users 
      WHERE role = 'VSLA'
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: vslas.map(vsla => ({
        id: vsla.id,
        phoneNumber: vsla.phone_number,
        firstName: vsla.first_name,
        lastName: vsla.last_name,
        fullName: vsla.full_name,
        gender: vsla.gender,
        district: vsla.district,
        village: vsla.village,
        subCounty: vsla.sub_county,
        region: vsla.region,
        organizationName: vsla.organization_name,
        registrationNumber: vsla.registration_number,
        chairperson: vsla.chairperson,
        groupSize: vsla.group_size,
        meetingFrequency: vsla.meeting_frequency,
        createdAt: vsla.created_at,
        lastLogin: vsla.last_login,
        isActive: vsla.is_active
      })),
      count: vslas.length
    });
  } catch (error) {
    console.error('Get VSLAs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch VSLAs' });
  }
});

router.get('/retail-sellers', authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const retailers = await sql`
      SELECT 
        id, phone_number, first_name, last_name, full_name,
        gender, district, village, sub_county, region,
        business_name, business_type, tin_number,
        business_license, business_address,
        created_at, last_login, is_active
      FROM users 
      WHERE role = 'outlet' OR role = 'retail'
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: retailers.map(retailer => ({
        id: retailer.id,
        phoneNumber: retailer.phone_number,
        firstName: retailer.first_name,
        lastName: retailer.last_name,
        fullName: retailer.full_name,
        gender: retailer.gender,
        district: retailer.district,
        village: retailer.village,
        subCounty: retailer.sub_county,
        region: retailer.region,
        businessName: retailer.business_name,
        businessType: retailer.business_type,
        tinNumber: retailer.tin_number,
        businessLicense: retailer.business_license,
        businessAddress: retailer.business_address,
        createdAt: retailer.created_at,
        lastLogin: retailer.last_login,
        isActive: retailer.is_active
      })),
      count: retailers.length
    });
  } catch (error) {
    console.error('Get Retail Sellers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch retail sellers' });
  }
});

// Get user details by ID
router.get('/user/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = req.app.locals.sql;
    
    const users = await sql`
      SELECT 
        id, phone_number, first_name, last_name, full_name,
        gender, national_id, date_of_birth, role,
        village, parish, sub_county, district, region,
        organization_name, registration_number, years_of_experience,
        training_certificate, business_name, business_type, tin_number,
        business_license, business_address, chairperson, group_size,
        meeting_frequency, created_at, updated_at, last_login, is_active
      FROM users 
      WHERE id = ${id}
    `;

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[0];
    
    // Get additional stats based on role
    let additionalStats = {};
    
    if (user.role === 'CHW' || user.role === 'health_worker') {
      const screenings = await sql`
        SELECT COUNT(*) as total_screenings,
               COUNT(CASE WHEN needs_glasses = true THEN 1 END) as glasses_prescribed,
               COUNT(CASE WHEN needs_referral = true THEN 1 END) as referrals_made
        FROM screenings 
        WHERE health_worker_id = ${id}
      `;
      
      additionalStats = {
        totalScreenings: screenings[0].total_screenings,
        glassesPrescribed: screenings[0].glasses_prescribed,
        referralsMade: screenings[0].referrals_made
      };
    } else if (user.role === 'outlet' || user.role === 'retail') {
      const sales = await sql`
        SELECT COUNT(*) as total_sales,
               COALESCE(SUM(amount), 0) as total_revenue
        FROM payments p
        JOIN screenings s ON p.screening_id = s.id
        WHERE s.health_worker_id IN (
          SELECT id FROM users WHERE district = ${user.district} AND role = 'CHW'
        )
        AND p.status = 'completed'
        AND p.created_at >= NOW() - INTERVAL '30 days'
      `;
      
      additionalStats = {
        totalSales: sales[0].total_sales,
        totalRevenue: sales[0].total_revenue
      };
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        phoneNumber: user.phone_number,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        gender: user.gender,
        nationalId: user.national_id,
        dateOfBirth: user.date_of_birth,
        role: user.role,
        village: user.village,
        parish: user.parish,
        subCounty: user.sub_county,
        district: user.district,
        region: user.region,
        organizationName: user.organization_name,
        registrationNumber: user.registration_number,
        yearsOfExperience: user.years_of_experience,
        trainingCertificate: user.training_certificate,
        businessName: user.business_name,
        businessType: user.business_type,
        tinNumber: user.tin_number,
        businessLicense: user.business_license,
        businessAddress: user.business_address,
        chairperson: user.chairperson,
        groupSize: user.group_size,
        meetingFrequency: user.meeting_frequency,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login,
        isActive: user.is_active,
        ...additionalStats
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user details' });
  }
});

module.exports = router;
