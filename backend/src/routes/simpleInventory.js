const express = require('express');
const router = express.Router();

// Simple inventory endpoint without authentication
router.get('/summary', async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    // Get products with stock information
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.power,
        p.price,
        p.category,
        p.stock_quantity,
        CASE 
          WHEN p.stock_quantity = 0 THEN 'out_of_stock'
          WHEN p.stock_quantity <= 5 THEN 'critical'
          WHEN p.stock_quantity <= 10 THEN 'low'
          ELSE 'normal'
        END as stock_status
      FROM products p
      ORDER BY p.stock_quantity ASC
    `;

    // Calculate totals
    const totals = await sql`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_pairs,
        SUM(CASE WHEN category = 'reading_glasses' THEN stock_quantity ELSE 0 END) as total_standard,
        SUM(CASE WHEN category = 'sunglasses' THEN stock_quantity ELSE 0 END) as total_metal,
        SUM(CASE WHEN category = 'fashion' THEN stock_quantity ELSE 0 END) as total_fashion,
        SUM(stock_quantity * price) as total_value
      FROM products
    `;

    // Add status to each product
    const productsWithStatus = products.map(product => ({
      ...product,
      status: product.stock_status
    }));

    res.json({
      success: true,
      data: {
        products: productsWithStatus,
        totals: totals[0] || {
          total_products: 0,
          total_pairs: 0,
          total_standard: 0,
          total_metal: 0,
          total_fashion: 0,
          total_value: 0
        }
      }
    });

  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load inventory data',
      details: error.message
    });
  }
});

module.exports = router;
