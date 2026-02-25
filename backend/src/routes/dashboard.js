const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/auth");

router.get("/stats", authenticate, dashboardController.getDashboardStats);
router.get("/inventory", authenticate, dashboardController.getInventorySummary);
router.get("/reports", authenticate, dashboardController.getReports);
router.get("/clients", authenticate, dashboardController.getClients);

module.exports = router;
