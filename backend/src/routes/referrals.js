const express = require("express");
const router = express.Router();
const referralController = require("../controllers/referralController");
const { authenticate } = require("../middleware/auth");

router.post("/", referralController.createReferral);
router.get("/", referralController.getReferrals);
router.get("/stats", referralController.getReferralStats);
router.get("/:id", referralController.getReferralById);
router.patch("/:id/status", referralController.updateReferralStatus);

module.exports = router;
