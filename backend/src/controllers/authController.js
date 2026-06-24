const jwt = require("jsonwebtoken");
const smsService = require("../services/smsService");
const {
  toCanonicalPhone,
  phoneLookupVariants,
  phonesMatch,
} = require("../utils/phoneUtils");

/** Find a registered user regardless of how their phone was stored */
async function findUserByPhone(sql, phoneNumber) {
  const variants = phoneLookupVariants(phoneNumber);
  if (variants.length === 0) return null;

  const [v0, v1, v2, v3, v4, v5] = variants;

  let users = await sql`
    SELECT * FROM users
    WHERE phone_number IN (${v0}, ${v1}, ${v2}, ${v3}, ${v4}, ${v5})
    ORDER BY created_at DESC
  `;

  if (users.length > 0) return users[0];

  const canonical = toCanonicalPhone(phoneNumber);
  if (!canonical) return null;

  const suffix = canonical.slice(1);
  const candidates = await sql`
    SELECT * FROM users
    WHERE phone_number LIKE ${"%" + suffix + "%"}
    ORDER BY created_at DESC
    LIMIT 20
  `;

  for (const candidate of candidates) {
    if (phonesMatch(candidate.phone_number, phoneNumber)) {
      return candidate;
    }
  }

  return null;
}

/** Best-effort normalize stored phone to 0XXXXXXXXX (fixes legacy rows) */
async function normalizeStoredPhone(sql, userId, currentPhone, targetPhone) {
  if (!targetPhone || phonesMatch(currentPhone, targetPhone)) return currentPhone;

  try {
    const updated = await sql`
      UPDATE users SET phone_number = ${targetPhone}
      WHERE id = ${userId}
      RETURNING phone_number
    `;
    return updated[0]?.phone_number || targetPhone;
  } catch (err) {
    // Unique constraint — another row already owns this canonical number
    console.warn("Could not normalize phone for user", userId, err.message);
    return currentPhone;
  }
}

// Login / Request OTP
exports.login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const sql = req.app.locals.sql;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: "Phone number required" });
    }

    const canonicalPhone = toCanonicalPhone(phoneNumber);
    if (!canonicalPhone) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number. Enter 9 digits after +256.",
      });
    }

    let existingUser = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        existingUser = await findUserByPhone(sql, phoneNumber);
        break;
      } catch (dbError) {
        retryCount++;
        if (retryCount >= maxRetries) throw dbError;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        error: "Phone number not registered. Please register first.",
        code: "NOT_REGISTERED",
      });
    }

    const storedPhone = await normalizeStoredPhone(
      sql,
      existingUser.id,
      existingUser.phone_number,
      canonicalPhone
    );

    const smsResult = await smsService.sendOTP(storedPhone || canonicalPhone, null);

    if (!smsResult.success) {
      console.error("SMS failed:", smsResult.error);
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP. Please try again in a moment.",
        details: smsResult.error,
      });
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      phoneNumber: canonicalPhone,
      devMode: smsResult.devMode || false,
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error.message && error.message.includes("ETIMEDOUT")) {
      res.status(503).json({
        success: false,
        error: "Database connection timeout. Please try again.",
      });
    } else if (error.message && error.message.includes("fetch failed")) {
      res.status(503).json({
        success: false,
        error: "Database connection failed. Please try again.",
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

    const canonicalPhone = toCanonicalPhone(phoneNumber);
    if (!canonicalPhone) {
      return res.status(400).json({ success: false, error: "Invalid phone number" });
    }

    let user = await findUserByPhone(sql, phoneNumber);

    // Login flow: user must exist and OTP must match the stored phone format
    if (!registrationData) {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Phone number not registered. Please register first.",
          code: "NOT_REGISTERED",
        });
      }

      const verifyPhone = user.phone_number || canonicalPhone;
      const verifyResult = await smsService.verifyOTP(verifyPhone, otp);

      if (!verifyResult.success) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired OTP",
          details: verifyResult.error,
        });
      }
    } else {
      console.log(`📝 [REGISTRATION] Skipping OTP verification for ${canonicalPhone}`);
    }

    // When registering, create user if they don't exist yet
    if (!user && registrationData) {
      await sql`
        INSERT INTO users (phone_number)
        VALUES (${canonicalPhone})
      `;
      user = await findUserByPhone(sql, canonicalPhone);
    }

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    let userData = user;
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
        ownerFullName,
        chairperson,
        groupName,
      } = registrationData;

      let fullName = `${firstName || ""} ${lastName || ""}`.trim();
      if (!fullName && providedFullName) fullName = providedFullName;
      if (!fullName && ownerFullName) fullName = ownerFullName;
      if (!fullName && chairperson?.name) fullName = chairperson.name;
      const currentTime = new Date().toISOString();

      try {
        await sql`
          UPDATE users SET
            phone_number = ${canonicalPhone},
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
        console.log("⚠️ Schema limited, updating basic fields only");
        await sql`
          UPDATE users SET
            phone_number = ${canonicalPhone},
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

      const updatedUser = await sql`
        SELECT * FROM users WHERE id = ${userId}
      `;
      userData = updatedUser[0];
    } else {
      const currentTime = new Date().toISOString();

      await normalizeStoredPhone(sql, userId, userData.phone_number, canonicalPhone);

      await sql`
        UPDATE users SET
          otp_code = NULL,
          otp_expires_at = NULL,
          last_login = ${currentTime}
        WHERE id = ${userId}
      `;

      const updatedUser = await sql`
        SELECT * FROM users WHERE id = ${userId}
      `;
      userData = updatedUser[0];
    }

    if (!userData || !userData.id) {
      console.error("userData is undefined or missing id:", userData);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve user data after update",
      });
    }

    const token = jwt.sign(
      { userId: userData.id, phoneNumber: userData.phone_number, role: userData.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: registrationData ? "Registration successful" : "Login successful",
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
      requestBody: req.body,
    });
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
      details: error.message,
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
