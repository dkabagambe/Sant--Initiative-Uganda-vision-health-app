const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../config/database");

// In-memory OTP storage (temporary - in production use Redis)
const otpStore = new Map();

// Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Login with phone number
router.post("/login", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Valid phone number (10+ digits) required",
      });
    }

    // Clean phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Generate OTP
    const otp = generateOTP();
    otpStore.set(cleanPhone, {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    });

    console.log(`📱 OTP for ${cleanPhone}: ${otp} (Development only)`);

    // In production, integrate with SMS service here
    // await sendSMS(cleanPhone, `Your Santé OTP: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent to your phone",
      phoneNumber: cleanPhone,
      otp: process.env.NODE_ENV === "development" ? otp : undefined, // Only in dev
      note: "In production, OTP would be sent via SMS",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
});

// Verify OTP and create/authenticate user
router.post("/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otp, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone number and OTP are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const storedOtp = otpStore.get(cleanPhone);

    // Check if OTP exists
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        error: "No OTP requested for this number. Request OTP first.",
      });
    }

    // Check attempts
    if (storedOtp.attempts >= 3) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        success: false,
        error: "Too many attempts. Request a new OTP.",
      });
    }

    storedOtp.attempts += 1;

    // Verify OTP
    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP code",
      });
    }

    // Check expiration
    if (Date.now() > storedOtp.expires) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({
        success: false,
        error: "OTP expired. Request a new one.",
      });
    }

    // Check if user exists in database
    let user;
    try {
      const userResult = await db.query(
        "SELECT id, phone_number, full_name, role, village, district FROM users WHERE phone_number = $1",
        [cleanPhone],
      );

      if (userResult.rows.length > 0) {
        // Existing user
        user = userResult.rows[0];

        // Update last login
        await db.query(
          "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
          [user.id],
        );
      } else {
        // Create new user
        const newUserResult = await db.query(
          `INSERT INTO users (phone_number, full_name, role, village, district) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING id, phone_number, full_name, role, village, district`,
          [
            cleanPhone,
            name ||
              `Health Worker ${cleanPhone.substring(cleanPhone.length - 4)}`,
            "health_worker",
            "",
            "",
          ],
        );

        user = newUserResult.rows[0];
        console.log(
          `✅ Created new user: ${user.full_name} (${user.phone_number})`,
        );
      }
    } catch (dbError) {
      console.error("Database error during user lookup/creation:", dbError);
      // Fallback to mock data if database is down
      user = {
        id: Date.now().toString(),
        phone_number: cleanPhone,
        full_name:
          name ||
          `Health Worker ${cleanPhone.substring(cleanPhone.length - 4)}`,
        role: "health_worker",
        village: "",
        district: "",
      };
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phone_number,
        role: user.role,
        name: user.full_name,
      },
      process.env.JWT_SECRET || "dev-secret-key-change-in-production",
      { expiresIn: "7d" },
    );

    // Clean up OTP
    otpStore.delete(cleanPhone);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        fullName: user.full_name,
        role: user.role,
        village: user.village,
        district: user.district,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: "Verification failed. Please try again.",
    });
  }
});

// Check auth status (validate token)
router.get("/check", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "dev-secret-key-change-in-production",
      );

      // Optional: Verify user still exists in database
      const userResult = await db.query(
        "SELECT id, phone_number, full_name, role, is_active FROM users WHERE id = $1",
        [decoded.userId],
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: "User no longer exists",
        });
      }

      const user = userResult.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          error: "Account is deactivated",
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          fullName: user.full_name,
          role: user.role,
        },
      });
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication check failed",
    });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-secret-key-change-in-production",
    );

    const { fullName, village, district } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           village = COALESCE($2, village),
           district = COALESCE($3, district),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, phone_number, full_name, role, village, district`,
      [fullName, village, district, decoded.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
});

module.exports = router;
