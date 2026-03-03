// src/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config();

// Production safeguard: require critical env vars on Vercel or NODE_ENV=production
const isProduction = process.env.VERCEL || process.env.NODE_ENV === "production";
if (isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 16) {
    throw new Error("Production requires JWT_SECRET (min 16 chars). Set in Vercel Dashboard → Environment Variables.");
  }
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("postgres")) {
    throw new Error("Production requires DATABASE_URL (Neon Postgres). Set in Vercel Dashboard → Environment Variables.");
  }
}

const app = express();

// Database setup: Neon/Postgres when DATABASE_URL is set (production), else SQLite (local)
const { sql, db } = require("./db");
app.locals.sql = sql;
app.locals.db = db;

// --- Middleware ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
    limit: '15mb', // Increase limit for large uploads
  }),
);
app.use(express.urlencoded({ 
  extended: true, 
  limit: '15mb', // Increase limit for large uploads
}));

// --- Health check ---
app.get("/api/health", async (req, res) => {
  let dbStatus = "disconnected";
  let dbError = null;
  const forceSqlite = process.env.USE_SQLITE && ["true", "1", "yes"].includes(String(process.env.USE_SQLITE).toLowerCase());
  const usingPostgres = !forceSqlite && !!(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() && (process.env.DATABASE_URL.startsWith("postgresql://") || process.env.DATABASE_URL.startsWith("postgres://")));
  try {
    const result = usingPostgres
      ? await sql`SELECT NOW() as now`
      : await sql`SELECT datetime('now') as now`;
    const row = result && result[0];
    const hasValidRow = row && (
      row.now != null ||
      row.ok === 1 ||
      row.ok === "1" ||
      (typeof row.now !== "undefined")
    );
    if (hasValidRow) dbStatus = "connected";
  } catch (err) {
    dbError = err.message;
    console.error("DB health check error:", err.message);
  }

  const payload = {
    status: "OK",
    app: "Santé Initiative Uganda Backend",
    version: "1.0.0",
    database: dbStatus,
    databaseDialect: usingPostgres ? "postgres" : "sqlite",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  };
  if (dbStatus === "disconnected" && process.env.NODE_ENV === "production" && !usingPostgres) {
    payload.hint = "Set DATABASE_URL and JWT_SECRET in your host's env (Heroku/Render). See backend/HEROKU_CONFIG.md or backend/RENDER_DEPLOY.md";
  }
  if (dbError && process.env.NODE_ENV !== "production") payload.databaseError = dbError;
  payload.endpoints = [
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
    ];
  res.json(payload);
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
const uploadRoutes = require("./routes/upload");
const fixSchemaRoutes = require("./routes/fixSchema");
const diagnosticRoutes = require("./routes/diagnostic");
const populateUsersRoutes = require("./routes/populateUsers");
const seedDataRoutes = require("./routes/seedData");
const simpleSeedRoutes = require("./routes/simpleSeed");
const remoteConfigRoutes = require("./routes/remoteConfig");
const emergencyFixRoutes = require("./routes/emergencyFix");
const testDbRoutes = require("./routes/testDb");
const autoFixRoutes = require("./routes/autoFix");
const tempFixRoutes = require("./routes/tempFix");
const debugDashboardRoutes = require("./routes/debugDashboard");
const simpleDashboardRoutes = require("./routes/simpleDashboard");
const checkSchemaRoutes = require("./routes/checkSchema");
// const seedProductionRoutes = require("./routes/seedProduction"); // Module doesn't exist
const { startPaymentReminderScheduler } = require("./services/paymentReminderScheduler");
const os = require("os");

// --- Serve uploaded files (on Vercel use /tmp; local use backend/uploads) ---
const uploadsPath = process.env.VERCEL
  ? path.join(os.tmpdir(), "sante-uploads")
  : path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

// --- Root and favicon (avoid 404 when opening backend URL in browser) ---
app.get("/", (req, res) => {
  res.status(200).json({
    app: "Santé Initiative Uganda Backend",
    message: "API only. Use /api/health for status.",
    health: "/api/health",
  });
});
// Proper favicon handling - return 204 No Content instead of errors
app.get(["/favicon.ico", "/favicon.png"], (req, res) => {
  res.status(204).end();
});

// --- Use Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/screenings", screeningRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/health-facilities", facilityRoutes);
app.use("/api/fix-schema", fixSchemaRoutes);
app.use("/api/diagnostic", diagnosticRoutes);
app.use("/api/populate-users", populateUsersRoutes);
app.use("/api/seed-data", seedDataRoutes);
app.use("/api/simple-seed", simpleSeedRoutes);
app.use("/api/remote-config", remoteConfigRoutes);
app.use("/api/emergency-fix", emergencyFixRoutes);
app.use("/api/test-db", testDbRoutes);
app.use("/api/auto-fix", autoFixRoutes);
app.use("/api/temp-fix", tempFixRoutes);
app.use("/api/debug-dashboard", debugDashboardRoutes);
app.use("/api/simple-dashboard", simpleDashboardRoutes);
app.use("/api/check-schema", checkSchemaRoutes);
// app.use("/api/seed-production", seedProductionRoutes); // Module doesn't exist

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

// Export for Vercel serverless (no app.listen on Vercel)
module.exports = app;

// Start server only when NOT on Vercel (local or traditional hosting)
if (!process.env.VERCEL) {
const DEFAULT_PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = process.env.HOST || "0.0.0.0";

function startServer(port) {
  const server = app.listen(port, HOST, async () => {
  console.log(`
🚀 Santé Initiative Uganda Backend
📂 Environment: ${process.env.NODE_ENV || "development"}
🌐 Server running at http://${HOST}:${port}
📊 Health check: http://localhost:${port}/api/health
📱 For physical device: use your machine IP, e.g. http://YOUR_IP:${port}/api
  `);
  
  // Test database connection at startup (read-only check; no data modified)
  const forceSqliteStartup = process.env.USE_SQLITE && ["true", "1", "yes"].includes(String(process.env.USE_SQLITE).toLowerCase());
  const usingPostgresStartup = !forceSqliteStartup && !!(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() && (process.env.DATABASE_URL.startsWith("postgresql://") || process.env.DATABASE_URL.startsWith("postgres://")));
  console.log(usingPostgresStartup ? "📦 Using Postgres (DATABASE_URL set)" : "📦 Using SQLite (no DATABASE_URL or USE_SQLITE=true)");
  try {
    if (usingPostgresStartup) {
      await sql`SELECT 1 as ok`;
    } else {
      await sql`SELECT datetime('now') as now`;
    }
    console.log("✅ Database connected successfully");
    // Auto-run init-db when using Postgres (creates tables if missing; safe & idempotent)
    if (usingPostgresStartup) {
      try {
        const initScript = path.join(__dirname, "..", "scripts", "init-db.js");
        execSync(`node "${initScript}"`, { stdio: "inherit", env: process.env, cwd: path.join(__dirname, "..") });
        console.log("✅ Database schema ready");
      } catch (initErr) {
        console.error("⚠️ Init-db run failed (tables may already exist):", initErr.message);
      }
    }
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    if (usingPostgresStartup) {
      console.error("   Check DATABASE_URL is correct and the database is reachable.");
    }
  }

  // Start background payment reminder scheduler (hire purchase)
  try {
    startPaymentReminderScheduler(sql);
  } catch (err) {
    console.error("❌ Failed to start payment reminder scheduler:", err.message);
  }
});
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && port < DEFAULT_PORT + 10) {
      console.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Could not bind to ports ${DEFAULT_PORT}-${port}. Kill processes: kill $(lsof -t -i:5000)\n`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);
}
