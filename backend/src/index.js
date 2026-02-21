// src/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Use local SQLite for development (Neon blocked by firewall)
console.log("📦 Using local SQLite database");
const { sql } = require("./db-local");

app.locals.sql = sql;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get("/api/health", async (req, res) => {
  let dbStatus = "disconnected";
  try {
    const result = await sql`SELECT NOW()`;
    if (result && result[0] && result[0].now) dbStatus = "connected";
  } catch (err) {
    console.error("DB health check error:", err.message);
  }

  res.json({
    status: "OK",
    app: "Santé Initiative Uganda Backend",
    version: "1.0.0",
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/auth/login",
      "POST /api/auth/verify-otp",
      "GET  /api/auth/check",
      "GET  /api/products",
      "GET  /api/products/:id",
      "PATCH /api/products/:id/stock",
      "POST /api/screenings",
      "GET  /api/screenings",
      "GET  /api/screenings/stats",
      "GET  /api/screenings/:id",
      "POST /api/payments",
      "GET  /api/payments",
      "GET  /api/payments/stats",
      "GET  /api/payments/:id",
      "PATCH /api/payments/:id/status",
      "GET  /api/payments/client/:clientPhone/installments",
      "POST /api/referrals",
      "GET  /api/referrals",
      "GET  /api/referrals/stats",
      "GET  /api/referrals/:id",
      "PATCH /api/referrals/:id/status",
      "GET  /api/dashboard/stats",
      "GET  /api/dashboard/inventory",
      "GET  /api/dashboard/reports",
      "GET  /api/dashboard/clients",
      "POST /api/sync",
    ],
  });
});

// --- Import Routes ---
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const screeningRoutes = require("./routes/screenings");
const paymentRoutes = require("./routes/payments");
const syncRoutes = require("./routes/sync");
const referralRoutes = require("./routes/referrals");
const dashboardRoutes = require("./routes/dashboard");
const facilityRoutes = require("./routes/facilities");

// --- Use Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/screenings", screeningRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/health-facilities", facilityRoutes);

// --- 404 Handler ---
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: "Check /api/health for available endpoints",
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`
🚀 Santé Initiative Uganda Backend
📂 Environment: ${process.env.NODE_ENV || "development"}
🌐 Server running on port ${PORT}
📊 Health check: http://localhost:${PORT}/api/health
  `);
  
  // Test database connection
  try {
    const result = await sql`SELECT NOW()`;
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
});
