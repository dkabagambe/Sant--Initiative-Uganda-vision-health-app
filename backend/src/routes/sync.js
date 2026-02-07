const express = require("express");
const router = express.Router();

// Temporary basic route
router.post("/", (req, res) => {
  res.json({
    message: "Sync endpoint - Under construction",
    note: "Offline data synchronization coming soon",
  });
});

module.exports = router;
