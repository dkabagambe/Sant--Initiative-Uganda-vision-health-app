const express = require("express");
const router = express.Router();
const screeningController = require("../controllers/screeningController");
const { authenticate } = require("../middleware/auth");

router.post("/", screeningController.createScreening);
router.get("/", screeningController.getScreenings);
router.get("/stats", screeningController.getScreeningStats);
router.get("/:id", screeningController.getScreeningById);

module.exports = router;
