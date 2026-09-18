// src/routes/auth.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// ─── Profile picture upload storage ──────────────────────────────────────────
const getProfileUploadsDir = () => {
  const dir = process.env.VERCEL
    ? path.join(os.tmpdir(), "sante-uploads")
    : path.join(__dirname, "../../uploads");
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  }
  return dir;
};

const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getProfileUploadsDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const profileUpload = multer({
  storage: profileStorage,
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only JPEG/PNG/WebP images are allowed"), ok);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─── Routes ───────────────────────────────────────────────────────────────────
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.get("/check", authenticate, authController.checkAuth);
router.get("/me", authenticate, authController.checkAuth);
router.patch("/profile", authenticate, authController.updateProfile);

// Upload profile picture → save file → write URL to users.profile_image
router.post(
  "/profile/picture",
  authenticate,
  profileUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
      }

      const sql = req.app.locals.sql;
      const userId = req.user.userId;

      // Build the public URL (relative path served by Express static middleware)
      const fileUrl = `/uploads/${req.file.filename}`;

      await sql`
        UPDATE users
        SET profile_image = ${fileUrl}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;

      res.json({
        success: true,
        message: "Profile picture updated",
        profile_image: fileUrl,
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ success: false, error: "Image too large. Max 5 MB." });
      }
      res.status(500).json({ success: false, error: "Failed to upload profile picture" });
    }
  }
);

module.exports = router;
