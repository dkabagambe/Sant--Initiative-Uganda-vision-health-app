const express = require("express");
const router = express.Router();
const syncController = require("../controllers/syncController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, syncController.sync);

module.exports = router;
