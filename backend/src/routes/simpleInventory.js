const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

/**
 * GET /api/simple-inventory/summary
 *
 * Returns this VHT's stock from vht_stock (joined with products for metadata).
 * Falls back to global products pool if the VHT has no vht_stock rows yet.
 */
router.get("/summary", authenticate, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const healthWorkerId = req.user?.userId;

    if (!healthWorkerId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    // Check whether this VHT has any allocated stock rows
    const hasVhtStockRes = await sql`
      SELECT COUNT(*) AS cnt FROM vht_stock WHERE health_worker_id = ${healthWorkerId}
    `;
    const hasVhtStock = Number(hasVhtStockRes[0]?.cnt || 0) > 0;

    let products;
    let totals;

    if (hasVhtStock) {
      // VHT has their own allocated stock rows
      products = await sql`
        SELECT
          p.id,
          p.name,
          p.power,
          p.price,
          p.category,
          GREATEST(COALESCE(v.stock_quantity, 0), 0)  AS stock_quantity,
          GREATEST(COALESCE(v.stock_standard, 0), 0)  AS stock_standard,
          GREATEST(COALESCE(v.stock_metal, 0), 0)     AS stock_metal,
          GREATEST(COALESCE(v.stock_fashion, 0), 0)   AS stock_fashion,
          CASE
            WHEN GREATEST(COALESCE(v.stock_quantity, 0), 0) = 0  THEN 'out_of_stock'
            WHEN GREATEST(COALESCE(v.stock_quantity, 0), 0) <= 5 THEN 'critical'
            WHEN GREATEST(COALESCE(v.stock_quantity, 0), 0) <= 10 THEN 'low'
            ELSE 'normal'
          END AS stock_status
        FROM products p
        LEFT JOIN vht_stock v ON v.product_id = p.id AND v.health_worker_id = ${healthWorkerId}
        ORDER BY p.power::numeric ASC
      `;

      totals = await sql`
        SELECT
          COUNT(DISTINCT p.id)                                              AS total_products,
          GREATEST(COALESCE(SUM(v.stock_quantity), 0), 0)                  AS total_pairs,
          GREATEST(COALESCE(SUM(v.stock_standard), 0), 0)                  AS total_standard,
          GREATEST(COALESCE(SUM(v.stock_metal), 0), 0)                     AS total_metal,
          GREATEST(COALESCE(SUM(v.stock_fashion), 0), 0)                   AS total_fashion,
          COALESCE(SUM(GREATEST(v.stock_quantity, 0) * p.price), 0)        AS total_value
        FROM products p
        LEFT JOIN vht_stock v ON v.product_id = p.id AND v.health_worker_id = ${healthWorkerId}
      `;
    } else {
      // No VHT-specific allocation yet — show global products pool
      products = await sql`
        SELECT
          p.id,
          p.name,
          p.power,
          p.price,
          p.category,
          GREATEST(COALESCE(p.stock_quantity, 0), 0)  AS stock_quantity,
          GREATEST(COALESCE(p.stock_standard, 0), 0)  AS stock_standard,
          GREATEST(COALESCE(p.stock_metal, 0), 0)     AS stock_metal,
          GREATEST(COALESCE(p.stock_fashion, 0), 0)   AS stock_fashion,
          CASE
            WHEN GREATEST(COALESCE(p.stock_quantity, 0), 0) = 0  THEN 'out_of_stock'
            WHEN GREATEST(COALESCE(p.stock_quantity, 0), 0) <= 5 THEN 'critical'
            WHEN GREATEST(COALESCE(p.stock_quantity, 0), 0) <= 10 THEN 'low'
            ELSE 'normal'
          END AS stock_status
        FROM products p
        ORDER BY p.power::numeric ASC
      `;

      totals = await sql`
        SELECT
          COUNT(*)                                                AS total_products,
          COALESCE(SUM(GREATEST(stock_quantity, 0)), 0)          AS total_pairs,
          COALESCE(SUM(GREATEST(COALESCE(stock_standard,0),0)),0) AS total_standard,
          COALESCE(SUM(GREATEST(COALESCE(stock_metal,0),0)),0)   AS total_metal,
          COALESCE(SUM(GREATEST(COALESCE(stock_fashion,0),0)),0) AS total_fashion,
          COALESCE(SUM(GREATEST(stock_quantity,0) * price), 0)   AS total_value
        FROM products
      `;
    }

    const productsFormatted = products.map((p) => ({
      ...p,
      stock_quantity: Number(p.stock_quantity || 0),
      stock_standard: Number(p.stock_standard || 0),
      stock_metal:    Number(p.stock_metal    || 0),
      stock_fashion:  Number(p.stock_fashion  || 0),
    }));

    const lowStockCount = productsFormatted.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity < 20,
    ).length;

    res.json({
      success: true,
      data: {
        products: productsFormatted,
        totals: {
          total_products: Number(totals[0]?.total_products || 0),
          total_pairs:    Number(totals[0]?.total_pairs    || 0),
          total_standard: Number(totals[0]?.total_standard || 0),
          total_metal:    Number(totals[0]?.total_metal    || 0),
          total_fashion:  Number(totals[0]?.total_fashion  || 0),
          total_value:    Number(totals[0]?.total_value    || 0),
        },
        lowStockCount,
        lowStockAlert: productsFormatted.filter(
          (p) => p.stock_quantity > 0 && p.stock_quantity < 20,
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
