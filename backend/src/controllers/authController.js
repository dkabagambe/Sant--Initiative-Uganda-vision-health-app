const jwt = require("jsonwebtoken");
const smsService = require("../services/smsService");

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Login / Request OTP
exports.login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const sql = req.app.locals.sql;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Phone number required" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists
    const existingUser = await sql`
      SELECT id, phone_number, full_name, role FROM users WHERE phone_number = ${phoneNumber}
    `;

    if (existingUser.length > 0) {
      // Update OTP for existing user
      await sql`
        UPDATE users 
        SET otp_code = ${otp}, otp_expires_at = ${expiresAt}
        WHERE phone_number = ${phoneNumber}
      `;
    } else {
      // Create new user with OTP
      await sql`
        INSERT INTO users (phone_number, otp_code, otp_expires_at)
        VALUES (${phoneNumber}, ${otp}, ${expiresAt})
      `;
    }

    // Send SMS
    const smsResult = await smsService.sendOTP(phoneNumber, otp);
    
    if (!smsResult.success) {
      console.error("SMS failed:", smsResult.error);
      // Still return success but log the error
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      phoneNumber,
      otp: process.env.NODE_ENV === "development" ? otp : undefined, // Only show in dev
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
};

// Verify OTP and complete registration
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp, registrationData } = req.body;
    const sql = req.app.locals.sql;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, error: "Phone number and OTP required" });
    }

    // Verify OTP
    const user = await sql`
      SELECT * FROM users 
      WHERE phone_number = ${phoneNumber} 
      AND otp_code = ${otp}
      AND otp_expires_at > NOW()
    `;

    if (user.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid or expired OTP" });
    }

    let userData = user[0];

    // If registration data provided, update user
    if (registrationData) {
      const {
        firstName,
        lastName,
        gender,
        nationalId,
        dateOfBirth,
        role,
        village,
        parish,
        subCounty,
        district,
        region,
        organizationName,
        registrationNumber,
        yearsOfExperience,
        trainingCertificate,
        businessName,
        businessType,
        tinNumber,
      } = registrationData;

      const fullName = `${firstName || ""} ${lastName || ""}`.trim();

      const updated = await sql`
        UPDATE users SET
          first_name = ${firstName || null},
          last_name = ${lastName || null},
          full_name = ${fullName || null},
          gender = ${gender || null},
          national_id = ${nationalId || null},
          date_of_birth = ${dateOfBirth || null},
          role = ${role || "health_worker"},
          village = ${village || null},
          parish = ${parish || null},
          sub_county = ${subCounty || null},
          district = ${district || null},
          region = ${region || null},
          organization_name = ${organizationName || null},
          registration_number = ${registrationNumber || null},
          years_of_experience = ${yearsOfExperience || null},
          training_certificate = ${trainingCertificate || null},
          business_name = ${businessName || null},
          business_type = ${businessType || null},
          tin_number = ${tinNumber || null},
          otp_code = NULL,
          otp_expires_at = NULL,
          last_login = NOW()
        WHERE phone_number = ${phoneNumber}
        RETURNING *
      `;

      userData = updated[0];
    } else {
      // Just clear OTP and update last login
      const updated = await sql`
        UPDATE users SET
          otp_code = NULL,
          otp_expires_at = NULL,
          last_login = NOW()
        WHERE phone_number = ${phoneNumber}
        RETURNING *
      `;
      userData = updated[0];
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: userData.id, phoneNumber: userData.phone_number, role: userData.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: userData.id,
        phoneNumber: userData.phone_number,
        fullName: userData.full_name,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        village: userData.village,
        district: userData.district,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, error: "Failed to verify OTP" });
  }
};

// Check auth status
exports.checkAuth = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const userId = req.user.userId;

    const user = await sql`
      SELECT id, phone_number, full_name, first_name, last_name, role, village, district
      FROM users WHERE id = ${userId}
    `;

    if (user.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: user[0],
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({ success: false, error: "Failed to check auth" });
  }
};
