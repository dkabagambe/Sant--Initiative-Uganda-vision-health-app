const express = require("express");
const router = express.Router();

// Temporary basic route
router.get("/", (req, res) => {
  res.json({ message: "Payments endpoint - Under construction" });
});

router.post("/", (req, res) => {
  res.json({
    message: "Payment recorded (offline mode)",
    note: "Mobile money integration coming soon",
  });
});

module.exports = router;
