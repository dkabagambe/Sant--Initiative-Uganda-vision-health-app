const express = require("express");
const router = express.Router();
const screeningController = require("../controllers/screeningController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, screeningController.createScreening);
router.get("/", authenticate, screeningController.getScreenings);
router.get("/stats", authenticate, screeningController.getScreeningStats);
router.get("/:id", authenticate, screeningController.getScreeningById);

module.exports = router;
