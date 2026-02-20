const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, paymentController.createPayment);
router.get("/", authenticate, paymentController.getPayments);
router.get("/stats", authenticate, paymentController.getPaymentStats);
router.get("/client/:clientPhone/installments", authenticate, paymentController.getClientInstallments);
router.get("/:id", authenticate, paymentController.getPaymentById);
router.patch("/:id/status", authenticate, paymentController.updatePaymentStatus);

module.exports = router;
