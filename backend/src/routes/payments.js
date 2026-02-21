const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");

router.post("/", paymentController.createPayment);
router.get("/", paymentController.getPayments);
router.get("/stats", paymentController.getPaymentStats);
router.get("/client/:clientPhone/installments", paymentController.getClientInstallments);
router.get("/:id", paymentController.getPaymentById);
router.patch("/:id/status", paymentController.updatePaymentStatus);

module.exports = router;
