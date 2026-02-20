// src/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.get("/check", authenticate, authController.checkAuth);
router.get("/me", authenticate, authController.checkAuth);

module.exports = router;
