const express = require("express");
const router = express.Router();
const facilityController = require("../controllers/facilityController");

// Get all health facilities (with optional filters)
router.get("/", facilityController.getHealthFacilities);

// Get facility by ID
router.get("/:id", facilityController.getFacilityById);

module.exports = router;
