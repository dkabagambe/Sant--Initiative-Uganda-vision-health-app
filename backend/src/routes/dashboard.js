const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/auth");

router.get("/stats", dashboardController.getDashboardStats);
router.get("/inventory", dashboardController.getInventorySummary);
router.get("/reports", dashboardController.getReports);
router.get("/clients", dashboardController.getClients);

module.exports = router;
