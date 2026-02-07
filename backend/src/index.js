const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check with database status
app.get("/api/health", async (req, res) => {
  const db = require("./config/database");

  let dbStatus = "unknown";
  try {
    await db.query("SELECT 1");
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "disconnected";
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
      "POST /api/screenings",
      "POST /api/payments",
      "POST /api/sync",
    ],
  });
});

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const screeningRoutes = require("./routes/screenings");
const paymentRoutes = require("./routes/payments");
const syncRoutes = require("./routes/sync");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/screenings", screeningRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sync", syncRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: "Check /api/health for available endpoints",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Santé Initiative Uganda Backend
📂 Environment: ${process.env.NODE_ENV || "development"}
🌐 Server running on port ${PORT}
📊 Health check: http://localhost:${PORT}/api/health
🔐 Auth: http://localhost:${PORT}/api/auth/login
👓 Products: http://localhost:${PORT}/api/products
👁️ Screenings: http://localhost:${PORT}/api/screenings
💰 Payments: http://localhost:${PORT}/api/payments
🔄 Sync: http://localhost:${PORT}/api/sync
  `);
});
