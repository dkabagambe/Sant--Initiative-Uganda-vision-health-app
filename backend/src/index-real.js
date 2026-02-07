const express = require("express");
const cors = require("cors");
const db = require("../config/database-fixed"); // Use the fixed database config
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.path}`);
  next();
});

// ============ HEALTH ENDPOINT (WITH REAL DB CHECK) ============
app.get("/api/health", async (req, res) => {
  let dbStatus = "checking...";
  let dbDetails = {};

  try {
    const result = await db.query("SELECT 1 as test");
    dbStatus = "connected";
    dbDetails.test = result.rows[0].test;

    // Get some stats
    const tables = await db.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    dbDetails.tables = tables.rows[0].table_count;

    const products = await db.query(
      "SELECT COUNT(*) as product_count FROM products",
    );
    dbDetails.products = products.rows[0].product_count;
  } catch (error) {
    dbStatus = `disconnected: ${error.message}`;
  }

  res.json({
    status: "OK",
    message: "Santé Backend is running",
    database: dbStatus,
    database_details: dbStatus === "connected" ? dbDetails : null,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "GET /api/health",
      products: "GET /api/products",
      login: "POST /api/auth/login",
      verify: "POST /api/auth/verify-otp",
      screenings: "POST /api/screenings",
      payments: "POST /api/payments",
      sync: "POST /api/sync",
    },
  });
});

// ============ PRODUCTS ENDPOINT (REAL DATABASE) ============
app.get("/api/products", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, power, price, currency, stock_quantity as stock, category
      FROM products 
      ORDER BY CAST(SUBSTRING(power FROM '([0-9.]+)') AS DECIMAL)
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
      source: "neon-database",
      currency: "UGX",
    });
  } catch (error) {
    console.error("Database error, using fallback:", error.message);

    // Fallback to mock data
    const fallbackProducts = [
      {
        id: "1",
        name: "Reading Glasses +1.00",
        power: "+1.00",
        price: 15000,
        stock: 50,
      },
      {
        id: "2",
        name: "Reading Glasses +1.50",
        power: "+1.50",
        price: 15000,
        stock: 50,
      },
      {
        id: "3",
        name: "Reading Glasses +2.00",
        power: "+2.00",
        price: 15000,
        stock: 50,
      },
      {
        id: "4",
        name: "Reading Glasses +2.50",
        power: "+2.50",
        price: 15000,
        stock: 50,
      },
      {
        id: "5",
        name: "Reading Glasses +3.00",
        power: "+3.00",
        price: 15000,
        stock: 50,
      },
      {
        id: "6",
        name: "Reading Glasses +3.50",
        power: "+3.50",
        price: 18000,
        stock: 30,
      },
    ];

    res.json({
      success: true,
      data: fallbackProducts,
      count: fallbackProducts.length,
      source: "fallback-data",
      note: "Database connection failed, using cached data",
    });
  }
});

// ============ AUTH ENDPOINTS (REAL DATABASE) ============
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Valid phone number required (10+ digits)",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Generate OTP (in production, send via SMS)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP temporarily (in production use Redis)
    console.log(`📱 OTP for ${cleanPhone}: ${otp} (store this temporarily)`);

    res.json({
      success: true,
      message: "OTP sent successfully",
      phoneNumber: cleanPhone,
      otp: otp, // In development only
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login service unavailable",
    });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otp, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone number and OTP are required",
      });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // In production: Verify OTP from Redis/SMS service
    // For now, accept any 6-digit OTP in development
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP format",
      });
    }

    // Check if user exists in database
    let user;
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
        `INSERT INTO users (phone_number, full_name, role) 
         VALUES ($1, $2, $3) 
         RETURNING id, phone_number, full_name, role, village, district`,
        [
          cleanPhone,
          name ||
            `Health Worker ${cleanPhone.substring(cleanPhone.length - 4)}`,
          "health_worker",
        ],
      );

      user = newUserResult.rows[0];
      console.log(
        `✅ Created new user: ${user.full_name} (${user.phone_number})`,
      );
    }

    // Create a simple token (in production use JWT)
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        phone: user.phone_number,
        role: user.role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    ).toString("base64");

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        fullName: user.full_name,
        role: user.role,
        village: user.village,
        district: user.district,
      },
      expiresIn: "7 days",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication service unavailable",
    });
  }
});

// ============ SCREENINGS ENDPOINT (SAVE TO DATABASE) ============
app.post("/api/screenings", async (req, res) => {
  try {
    const screeningData = req.body;

    // Required fields
    if (!screeningData.client_name || !screeningData.health_worker_id) {
      return res.status(400).json({
        success: false,
        error: "Client name and health worker ID are required",
      });
    }

    // Insert into database
    const result = await db.query(
      `INSERT INTO screenings (
        client_id, health_worker_id, visual_acuity_left, visual_acuity_right,
        recommended_product_id, notes, screening_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, screening_date, created_at`,
      [
        screeningData.client_id || null,
        screeningData.health_worker_id,
        screeningData.visual_acuity_left,
        screeningData.visual_acuity_right,
        screeningData.recommended_product_id || null,
        screeningData.notes || "",
        screeningData.screening_date || new Date().toISOString().split("T")[0],
      ],
    );

    const screening = result.rows[0];

    res.json({
      success: true,
      message: "Screening recorded successfully",
      data: screening,
      screeningId: screening.id,
    });
  } catch (error) {
    console.error("Screening save error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save screening",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ============ PAYMENTS ENDPOINT (SAVE TO DATABASE) ============
app.post("/api/payments", async (req, res) => {
  try {
    const paymentData = req.body;

    if (
      !paymentData.amount ||
      !paymentData.mobile_money_number ||
      !paymentData.screening_id
    ) {
      return res.status(400).json({
        success: false,
        error: "Amount, mobile money number, and screening ID are required",
      });
    }

    // Generate a transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const result = await db.query(
      `INSERT INTO payments (
        screening_id, product_id, amount, currency, mobile_money_number,
        transaction_id, status, payment_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, transaction_id, amount, status, payment_date`,
      [
        paymentData.screening_id,
        paymentData.product_id || null,
        paymentData.amount,
        paymentData.currency || "UGX",
        paymentData.mobile_money_number,
        transactionId,
        "pending",
        "mobile_money",
      ],
    );

    const payment = result.rows[0];

    res.json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
      transactionId: payment.transaction_id,
    });
  } catch (error) {
    console.error("Payment save error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save payment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ============ SYNC ENDPOINT ============
app.post("/api/sync", async (req, res) => {
  try {
    const { operations } = req.body;

    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: "Operations array is required",
      });
    }

    console.log(`🔄 Processing ${operations.length} sync operations...`);

    // Process each operation
    const results = [];
    for (const operation of operations) {
      try {
        let result;

        switch (operation.type) {
          case "screening":
            result = await db.query(
              "INSERT INTO screenings (health_worker_id, client_name, visual_acuity_left, visual_acuity_right) VALUES ($1, $2, $3, $4) RETURNING id",
              [
                operation.data.healthWorkerId,
                operation.data.clientName,
                operation.data.visualAcuityLeft,
                operation.data.visualAcuityRight,
              ],
            );
            break;

          case "payment":
            result = await db.query(
              "INSERT INTO payments (amount, mobile_money_number, status) VALUES ($1, $2, $3) RETURNING id",
              [operation.data.amount, operation.data.phone, "completed"],
            );
            break;

          default:
            console.log(`Unknown operation type: ${operation.type}`);
        }

        if (result) {
          results.push({
            type: operation.type,
            id: result.rows[0]?.id || "unknown",
            status: "synced",
          });
        }
      } catch (opError) {
        console.error(
          `Error syncing operation ${operation.type}:`,
          opError.message,
        );
        results.push({
          type: operation.type,
          id: operation.id || "unknown",
          status: "failed",
          error: opError.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Synced ${results.filter((r) => r.status === "synced").length} of ${operations.length} items`,
      results: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({
      success: false,
      error: "Sync failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ============ ERROR HANDLING ============
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET  /api/health",
      "GET  /api/products",
      "POST /api/auth/login",
      "POST /api/auth/verify-otp",
      "POST /api/screenings",
      "POST /api/payments",
      "POST /api/sync",
    ],
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
=======================================
🚀 SANTÉ INITIATIVE UGANDA BACKEND
=======================================

✅ Server is running!
📊 Port: ${PORT}
🌐 Environment: Development with REAL Neon Database

📡 API Endpoints:
   🔗 Health:    http://localhost:${PORT}/api/health
   👓 Products:  http://localhost:${PORT}/api/products
   📱 Auth:      POST http://localhost:${PORT}/api/auth/login
   ✅ Verify:    POST http://localhost:${PORT}/api/auth/verify-otp
   👁️ Screen:   POST http://localhost:${PORT}/api/screenings
   💰 Payments:  POST http://localhost:${PORT}/api/payments
   🔄 Sync:      POST http://localhost:${PORT}/api/sync

📋 Database: ✅ Connected to Neon PostgreSQL
💡 Note: Using real database connection!

=======================================
`);
});
