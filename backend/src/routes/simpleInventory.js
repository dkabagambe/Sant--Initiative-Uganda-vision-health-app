const express = require("express");
const router = express.Router();

// Simple inventory endpoint without authentication
router.get("/summary", async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId || req.query.healthWorkerId || null;

    let products;
    let totals;

    if (healthWorkerId) {
      products = await sql`
        SELECT 
          p.id,
          p.name,
          p.power,
          p.price,
          p.category,
          COALESCE(v.stock_quantity, 0) as stock_quantity,
          COALESCE(v.stock_standard, 0) as stock_standard,
          COALESCE(v.stock_metal, 0) as stock_metal,
          COALESCE(v.stock_fashion, 0) as stock_fashion,
          CASE 
            WHEN COALESCE(v.stock_quantity, 0) = 0 THEN 'out_of_stock'
            WHEN COALESCE(v.stock_quantity, 0) <= 5 THEN 'critical'
            WHEN COALESCE(v.stock_quantity, 0) <= 10 THEN 'low'
            ELSE 'normal'
          END as stock_status
        FROM products p
        LEFT JOIN vht_stock v ON v.product_id = p.id AND v.health_worker_id = ${healthWorkerId}
        ORDER BY p.power ASC
      `;

      totals = await sql`
        SELECT 
          COUNT(*) as total_products,
          COALESCE(SUM(v.stock_quantity), 0) as total_pairs,
          COALESCE(SUM(v.stock_standard), 0) as total_standard,
          COALESCE(SUM(v.stock_metal), 0) as total_metal,
          COALESCE(SUM(v.stock_fashion), 0) as total_fashion,
          COALESCE(SUM(v.stock_quantity * p.price), 0) as total_value
        FROM products p
        LEFT JOIN vht_stock v ON v.product_id = p.id AND v.health_worker_id = ${healthWorkerId}
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
          CASE 
            WHEN p.stock_quantity = 0 THEN 'out_of_stock'
            WHEN p.stock_quantity <= 5 THEN 'critical'
            WHEN p.stock_quantity <= 10 THEN 'low'
            ELSE 'normal'
          END as stock_status
        FROM products p
        ORDER BY p.power ASC
      `;

      totals = await sql`
        SELECT 
          COUNT(*) as total_products,
          SUM(stock_quantity) as total_pairs,
          SUM(CASE WHEN category = 'reading_glasses' THEN stock_quantity ELSE 0 END) as total_standard,
          SUM(CASE WHEN category = 'sunglasses' THEN stock_quantity ELSE 0 END) as total_metal,
          SUM(CASE WHEN category = 'fashion' THEN stock_quantity ELSE 0 END) as total_fashion,
          SUM(stock_quantity * price) as total_value
        FROM products
      `;
    }

    const lowStockCount = products.filter(
      (product) =>
        Number(product.stock_quantity || 0) > 0 &&
        Number(product.stock_quantity || 0) < 20,
    ).length;

    const productsWithStatus = products.map((product) => ({
      ...product,
      status: product.stock_status,
      stock_quantity: Number(product.stock_quantity || 0),
      stock_standard: Number(product.stock_standard || 0),
      stock_metal: Number(product.stock_metal || 0),
      stock_fashion: Number(product.stock_fashion || 0),
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
          total_value: 0,
        },
        lowStockCount,
        lowStockAlert: productsWithStatus.filter(
          (product) =>
            product.stock_quantity > 0 && product.stock_quantity < 20,
        ),
      },
    });
  } catch (error) {
    console.error("Inventory error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load inventory data",
      details: error.message,
    });
  }
});

module.exports = router;
