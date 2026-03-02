const express = require('express');
const router = express.Router();

// Diagnostic endpoint to check database structure
router.get('/check-db', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const db = req.app.locals.db;
    const usingSqlite = !!db; // db is set only when using SQLite

    let productColumns = [];
    let userColumns = [];

    if (usingSqlite && db) {
      // SQLite: use PRAGMA table_info
        const productInfo = db.prepare('PRAGMA table_info(products)').all();
        const userInfo = db.prepare('PRAGMA table_info(users)').all();
        productColumns = productInfo.map((c) => ({ column_name: c.name, data_type: c.type }));
        userColumns = userInfo.map((c) => ({ column_name: c.name, data_type: c.type }));
    } else if (!usingSqlite) {
      // Postgres: use information_schema
      productColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        ORDER BY ordinal_position
      `;
      userColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `;
    }
    
    // Test actual queries
    let productTest = null;
    let userTest = null;
    
    try {
      productTest = await sql`
        SELECT id, name, description, power, price, currency, stock_quantity, stock_standard, stock_metal, stock_fashion, category, created_at 
        FROM products 
        ORDER BY power ASC 
        LIMIT 3
      `;
    } catch (error) {
      productTest = { error: error.message };
    }
    
    try {
      userTest = await sql`
        SELECT id, phone_number, first_name, last_name, full_name, role 
        FROM users 
        LIMIT 3
      `;
    } catch (error) {
      userTest = { error: error.message };
    }
    
    res.json({
      success: true,
      database: {
        products: {
          columns: productColumns,
          test: productTest
        },
        users: {
          columns: userColumns,
          test: userTest
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
