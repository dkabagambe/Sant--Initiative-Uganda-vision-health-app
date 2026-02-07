const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
});

// Update product stock (for admin use)
router.patch("/:id/stock", async (req, res) => {
  try {
    const { quantityChange } = req.body;

    if (typeof quantityChange !== "number") {
      return res.status(400).json({
        success: false,
        error: "Valid quantity change required",
      });
    }

    const product = await Product.updateStock(req.params.id, quantityChange);

    res.json({
      success: true,
      message: `Stock updated by ${quantityChange}`,
      data: product,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update stock",
    });
  }
});

module.exports = router;
