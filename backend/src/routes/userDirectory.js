const express = require('express');
const router = express.Router();
// const { authenticate } = require('../middleware/auth');

// Get all users by role type
router.get('/vhts', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const vhts = await sql`
      SELECT 
        id, phone_number, full_name, role, district, village,
        created_at, last_login
      FROM users 
      WHERE role = 'CHW' OR role = 'health_worker'
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: vhts.map(vht => ({
        id: vht.id,
        phoneNumber: vht.phone_number,
        fullName: vht.full_name,
        role: vht.role,
        district: vht.district,
        village: vht.village,
        createdAt: vht.created_at,
        lastLogin: vht.last_login,
        isActive: true
      })),
      count: vhts.length
    });
  } catch (error) {
    console.error('Get VHTs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch VHTs' });
  }
});

router.get('/vslas', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const vslas = await sql`
      SELECT 
        id, phone_number, full_name, role, district, village,
        created_at, last_login
      FROM users 
      WHERE role ILIKE '%vsla%' OR role ILIKE '%group%' OR role ILIKE '%savings%'
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: vslas.map(vsla => ({
        id: vsla.id,
        phoneNumber: vsla.phone_number,
        fullName: vsla.full_name,
        role: vsla.role,
        district: vsla.district,
        village: vsla.village,
        createdAt: vsla.created_at,
        lastLogin: vsla.last_login,
        isActive: true
      })),
      count: vslas.length
    });
  } catch (error) {
    console.error('Get VSLAs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch VSLAs' });
  }
});

router.get('/retail-sellers', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    
    const retailers = await sql`
      SELECT 
        id, phone_number, full_name, role, district, village,
        created_at, last_login
      FROM users 
      WHERE role = 'outlet' OR role = 'retail'
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: retailers.map(retailer => ({
        id: retailer.id,
        phoneNumber: retailer.phone_number,
        fullName: retailer.full_name,
        role: retailer.role,
        district: retailer.district,
        village: retailer.village,
        createdAt: retailer.created_at,
        lastLogin: retailer.last_login,
        isActive: true
      })),
      count: retailers.length
    });
  } catch (error) {
    console.error('Get Retail Sellers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch retail sellers' });
  }
});

// Get user details by ID
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = req.app.locals.sql;
    
    const users = await sql`
      SELECT 
        id, phone_number, full_name, role,
        district, village, created_at, last_login
      FROM users 
      WHERE id = ${id}
    `;

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[0];
    
    res.json({
      success: true,
      data: {
        id: user.id,
        phoneNumber: user.phone_number,
        fullName: user.full_name,
        role: user.role,
        district: user.district,
        village: user.village,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user details' });
  }
});

module.exports = router;
