const express = require("express");
const router = express.Router();

// Temporary basic route - we'll build this properly later
router.get("/", (req, res) => {
  res.json({ message: "Screenings endpoint - Under construction" });
});

router.post("/", (req, res) => {
  res.json({
    message: "Screening saved (offline mode)",
    note: "This will connect to database later",
  });
});

module.exports = router;
