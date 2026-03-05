const express = require('express');
const router = express.Router();

// Simple stock/inventory endpoint without authentication
router.get('/list', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { category, status, limit = 100, offset = 0 } = req.query;

    let products;
    if (category) {
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.power,
          p.price,
          p.category,
          p.stock_quantity,
          p.stock_standard,
          p.stock_metal,
          p.stock_fashion,
          p.description,
          p.created_at,
          p.updated_at,
          CASE 
            WHEN p.stock_quantity = 0 THEN 'out_of_stock'
            WHEN p.stock_quantity <= 5 THEN 'critical'
            WHEN p.stock_quantity <= 10 THEN 'low'
            ELSE 'normal'
          END as stock_status
        FROM products p
        WHERE p.category = ${category}
        ORDER BY p.stock_quantity ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (status) {
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.power,
          p.price,
          p.category,
          p.stock_quantity,
          p.stock_standard,
          p.stock_metal,
          p.stock_fashion,
          p.description,
          p.created_at,
          p.updated_at,
          CASE 
            WHEN p.stock_quantity = 0 THEN 'out_of_stock'
            WHEN p.stock_quantity <= 5 THEN 'critical'
            WHEN p.stock_quantity <= 10 THEN 'low'
            ELSE 'normal'
          END as stock_status
        FROM products p
        WHERE CASE 
          WHEN p.stock_quantity = 0 THEN 'out_of_stock'
          WHEN p.stock_quantity <= 5 THEN 'critical'
          WHEN p.stock_quantity <= 10 THEN 'low'
          ELSE 'normal'
        END = ${status}
        ORDER BY p.stock_quantity ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.power,
          p.price,
          p.category,
          p.stock_quantity,
          p.stock_standard,
          p.stock_metal,
          p.stock_fashion,
          p.description,
          p.created_at,
          p.updated_at,
          CASE 
            WHEN p.stock_quantity = 0 THEN 'out_of_stock'
            WHEN p.stock_quantity <= 5 THEN 'critical'
            WHEN p.stock_quantity <= 10 THEN 'low'
            ELSE 'normal'
          END as stock_status
        FROM products p
        ORDER BY p.stock_quantity ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const total = await sql`
      SELECT COUNT(*) as count FROM products
    `;

    res.json({
      success: true,
      data: products,
      count: products.length,
      total: parseInt(total[0].count),
    });
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch stock',
      details: error.message 
    });
  }
});

// Update stock quantity
router.patch('/:id/stock', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const { stock_quantity, stock_standard, stock_metal, stock_fashion } = req.body;

    const product = await sql`
      UPDATE products 
      SET 
        stock_quantity = COALESCE(${stock_quantity}, stock_quantity),
        stock_standard = COALESCE(${stock_standard}, stock_standard),
        stock_metal = COALESCE(${stock_metal}, stock_metal),
        stock_fashion = COALESCE(${stock_fashion}, stock_fashion),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product[0]
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update stock',
      details: error.message 
    });
  }
});

// Add new product
router.post('/create', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const {
      name,
      power,
      price,
      category = 'reading_glasses',
      stock_quantity = 0,
      stock_standard = 0,
      stock_metal = 0,
      stock_fashion = 0,
      description
    } = req.body;

    const product = await sql`
      INSERT INTO products (
        name, power, price, category, stock_quantity,
        stock_standard, stock_metal, stock_fashion, description,
        created_at, updated_at
      ) VALUES (
        ${name || null}, ${power || null}, ${price || null}, ${category || null}, ${stock_quantity || null},
        ${stock_standard || null}, ${stock_metal || null}, ${stock_fashion || null}, ${description || null},
        NOW(), NOW()
      )
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Product created successfully',
      data: product[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create product',
      details: error.message 
    });
  }
});

// Update product
router.patch('/:id', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;
    const {
      name,
      power,
      price,
      category,
      stock_quantity,
      stock_standard,
      stock_metal,
      stock_fashion,
      description
    } = req.body;

    const product = await sql`
      UPDATE products 
      SET 
        name = COALESCE(${name}, name),
        power = COALESCE(${power}, power),
        price = COALESCE(${price}, price),
        category = COALESCE(${category}, category),
        stock_quantity = COALESCE(${stock_quantity}, stock_quantity),
        stock_standard = COALESCE(${stock_standard}, stock_standard),
        stock_metal = COALESCE(${stock_metal}, stock_metal),
        stock_fashion = COALESCE(${stock_fashion}, stock_fashion),
        description = COALESCE(${description}, description),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update product',
      details: error.message 
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { id } = req.params;

    const product = await sql`
      DELETE FROM products WHERE id = ${id} RETURNING *
    `;

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product[0]
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete product',
      details: error.message 
    });
  }
});

// Get stock stats
router.get('/stats', async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    const stats = await sql`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock,
        SUM(stock_quantity * price) as total_value,
        COUNT(*) FILTER (WHERE stock_quantity = 0) as out_of_stock,
        COUNT(*) FILTER (WHERE stock_quantity <= 5) as critical_stock,
        COUNT(*) FILTER (WHERE stock_quantity <= 10) as low_stock,
        COUNT(*) FILTER (WHERE stock_quantity > 10) as normal_stock,
        SUM(stock_standard) as total_standard,
        SUM(stock_metal) as total_metal,
        SUM(stock_fashion) as total_fashion
      FROM products
    `;

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get stock stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch stock stats',
      details: error.message 
    });
  }
});

module.exports = router;
