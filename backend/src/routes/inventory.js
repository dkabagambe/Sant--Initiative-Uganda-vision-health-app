// routes/products.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

// GET /api/products - all products
router.get("/products", authMiddleware, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const products = await sql`SELECT * FROM products ORDER BY power`;

    res.json({ success: true, data: products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/inventory/summary - aggregated inventory info
router.get("/inventory/summary", authMiddleware, async (req, res) => {
  try {
    const sql = req.app.locals.sql;

    // Example aggregations
    const totalStock =
      await sql`SELECT SUM(stock_quantity) AS total FROM products`;
    const lowCount =
      await sql`SELECT COUNT(*) AS lowCount FROM products WHERE stock_quantity < 10`;
    const criticalItems =
      await sql`SELECT * FROM products WHERE stock_quantity = 0`;

    res.json({
      success: true,
      totalStock: totalStock[0]?.total || 0,
      lowCount: lowCount[0]?.lowcount || 0,
      criticalItems: criticalItems,
    });
  } catch (err) {
    console.error("Error fetching inventory summary:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/products/:id/stock - update stock
router.patch("/products/:id/stock", authMiddleware, async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const { change } = req.body;
    const { id } = req.params;

    if (typeof change !== "number") {
      return res
        .status(400)
        .json({ success: false, error: "Change must be a number" });
    }

    const updated = await sql`
      UPDATE products
      SET stock_quantity = stock_quantity + ${change},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, stock_quantity
    `;

    if (!updated[0]) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, product: updated[0] });
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
