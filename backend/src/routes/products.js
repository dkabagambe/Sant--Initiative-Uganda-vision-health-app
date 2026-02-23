const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate } = require("../middleware/auth");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.patch("/:id/stock", productController.updateProductStock);

module.exports = router;
