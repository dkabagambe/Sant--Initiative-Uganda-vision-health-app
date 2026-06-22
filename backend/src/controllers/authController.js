const jwt = require("jsonwebtoken");
const smsService = require("../services/smsService");

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const normalizeUgandaPhone = (phoneNumber) => {
  const digits = String(phoneNumber || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("256")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0")) return digits;
  return `0${digits}`;
};

const phoneVariants = (phoneNumber) => {
  const normalizedPhone = normalizeUgandaPhone(phoneNumber);
  if (!normalizedPhone) return [];

  const digits9 = normalizedPhone.slice(1);
  return [
    normalizedPhone,
    `256${digits9}`,
    `+256${digits9}`,
  ];
};

// Login / Request OTP
exports.login = async (req, res) => {
  try {
    let { phoneNumber } = req.body;
    const sql = req.app.locals.sql;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Phone number required" });
    }

    const variants = phoneVariants(phoneNumber);
    const [normalizedPhone, withCountry, withPlus] = variants;

    // Only send OTP to users who have already registered (CHW / Outlet / VSLA)
    // Add retry logic for database connection issues
    let existingUser;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        existingUser = await sql`
          SELECT id, phone_number, full_name, role FROM users
          WHERE phone_number IN (${normalizedPhone}, ${withCountry}, ${withPlus})
        `;
        break;
      } catch (dbError) {
        retryCount++;
        if (retryCount >= maxRetries) throw dbError;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (existingUser.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Phone number not registered. Please register first.",
        code: "NOT_REGISTERED",
      });
    }

    // Use the stored phone number for OTP (matches what Twilio expects)
    const storedPhone = existingUser[0].phone_number;
    const smsResult = await smsService.sendOTP(storedPhone || normalizedPhone, null);
    
    if (!smsResult.success) {
      console.error("SMS failed:", smsResult.error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to send OTP",
        details: smsResult.error 
      });
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      phoneNumber,
    });
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle specific database connection errors
    if (error.message && error.message.includes('ETIMEDOUT')) {
      res.status(503).json({ 
        success: false, 
        error: "Database connection timeout. Please try again." 
      });
    } else if (error.message && error.message.includes('fetch failed')) {
      res.status(503).json({ 
        success: false, 
        error: "Database connection failed. Please try again." 
      });
    } else {
      res.status(500).json({ success: false, error: "Failed to send OTP" });
    }
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

    const variants = phoneVariants(phoneNumber);
    const [normalizedPhone, withCountry, withPlus] = variants;
    const userPhoneNumber = normalizedPhone;

    // Only verify OTP via Twilio for login (not registration)
    // Registration flow passes registrationData — skip OTP check to save Twilio credits
    if (!registrationData) {
      // Use the same phone format that was used to send the OTP (the stored phone)
      const verifyResult = await smsService.verifyOTP(userPhoneNumber, otp);
      
      if (!verifyResult.success) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid or expired OTP",
          details: verifyResult.error 
        });
      }
    } else {
      console.log(`📝 [REGISTRATION] Skipping OTP verification for ${phoneNumber}`);
    }

    // Get user from database (or create if registering)
    let user = await sql`
      SELECT * FROM users 
      WHERE phone_number IN (${userPhoneNumber}, ${withCountry}, ${withPlus})
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // When registering, create user if they don't exist yet
    if (user.length === 0 && registrationData) {
      await sql`
        INSERT INTO users (phone_number)
        VALUES (${userPhoneNumber})
      `;
      user = await sql`
        SELECT * FROM users WHERE phone_number = ${userPhoneNumber}
      `;
    }

    if (user.length === 0) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    let userData = user[0];
    const userId = userData.id;

    // If registration data provided, update user
    if (registrationData) {
      const {
        firstName,
        lastName,
        fullName: providedFullName,
        gender,
        nationalId,
        dateOfBirth,
        role,
        village,
        parish,
        subCounty,
        county,
        district,
        region,
        organizationName,
        registrationNumber,
        yearsOfExperience,
        trainingCertificate,
        recommendationLetter,
        businessName,
        businessType,
        tinNumber,
        shopFrontImage,
        ownerIdImage,
        registrationDocuments,
        // Outlet: ownerFullName; VSLA: chairperson, groupName
        ownerFullName,
        chairperson,
        groupName,
      } = registrationData;

      // Derive fullName for outlet/VSLA when firstName/lastName not provided
      let fullName = `${firstName || ""} ${lastName || ""}`.trim();
      if (!fullName && providedFullName) fullName = providedFullName;
      if (!fullName && ownerFullName) fullName = ownerFullName;
      if (!fullName && chairperson?.name) fullName = chairperson.name;
      const currentTime = new Date().toISOString();

      // Try full update first, fall back to basic fields if schema doesn't support
      try {
        await sql`
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
            county = ${county || null},
            district = ${district || null},
            region = ${region || null},
            organization_name = ${organizationName || groupName || null},
            registration_number = ${registrationNumber || null},
            years_of_experience = ${yearsOfExperience || null},
            training_certificate = ${trainingCertificate || null},
            recommendation_letter = ${recommendationLetter || null},
            business_name = ${businessName || null},
            business_type = ${businessType || null},
            tin_number = ${tinNumber || null},
            shop_front_image = ${shopFrontImage || null},
            owner_id_image = ${ownerIdImage || null},
            registration_documents = ${registrationDocuments ? JSON.stringify(registrationDocuments) : null},
            otp_code = NULL,
            otp_expires_at = NULL,
            last_login = ${currentTime}
          WHERE id = ${userId}
        `;
      } catch (schemaError) {
        // If schema doesn't support all fields, update only basic fields
        console.log('⚠️ Schema limited, updating basic fields only');
        await sql`
          UPDATE users SET
            first_name = ${firstName || null},
            last_name = ${lastName || null},
            full_name = ${fullName || null},
            role = ${role || "health_worker"},
            village = ${village || null},
            district = ${district || null},
            training_certificate = ${trainingCertificate || null},
            recommendation_letter = ${recommendationLetter || null},
            shop_front_image = ${shopFrontImage || null},
            owner_id_image = ${ownerIdImage || null},
            otp_code = NULL,
            otp_expires_at = NULL,
            last_login = ${currentTime}
          WHERE id = ${userId}
        `;
      }

      // Fetch the updated user
      const updatedUser = await sql`
        SELECT * FROM users WHERE id = ${userId}
      `;
      userData = updatedUser[0];
    } else {
      // Just clear OTP and update last login
      const currentTime = new Date().toISOString();
      
      await sql`
        UPDATE users SET
          otp_code = NULL,
          otp_expires_at = NULL,
          last_login = ${currentTime}
        WHERE id = ${userId}
      `;
      
      // Fetch the updated user
      const updatedUser = await sql`
        SELECT * FROM users WHERE id = ${userId}
      `;
      userData = updatedUser[0];
    }

    // Verify userData exists
    if (!userData || !userData.id) {
      console.error("userData is undefined or missing id:", userData);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve user data after update" 
      });
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
        phone_number: userData.phone_number,
        full_name: userData.full_name,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        village: userData.village,
        district: userData.district,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({ 
      success: false, 
      error: "Failed to verify OTP",
      details: error.message 
    });
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

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const sql = req.app.locals.sql;
    const userId = req.user.userId;
    const { full_name, age, sex, district, county, sub_county, parish } = req.body;

    await sql`
      UPDATE users SET
        full_name = ${full_name || null},
        age = ${age || null},
        sex = ${sex || null},
        district = ${district || null},
        county = ${county || null},
        sub_county = ${sub_county || null},
        parish = ${parish || null},
        village = ${parish || null}
      WHERE id = ${userId}
    `;

    const updatedUser = await sql`
      SELECT id, phone_number, full_name, age, sex, role, district, county, sub_county, parish, village
      FROM users WHERE id = ${userId}
    `;

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};
