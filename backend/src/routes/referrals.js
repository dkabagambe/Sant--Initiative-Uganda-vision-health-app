const express = require("express");
const router = express.Router();
const referralController = require("../controllers/referralController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, referralController.createReferral);
router.get("/", authenticate, referralController.getReferrals);
router.get("/stats", authenticate, referralController.getReferralStats);
router.get("/:id", authenticate, referralController.getReferralById);
router.patch("/:id", authenticate, referralController.updateReferral);
router.patch("/:id/status", authenticate, referralController.updateReferralStatus);

module.exports = router;
