const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const app = express();

// --- Initialize Neon SQL client ---
const sql = neon(process.env.DATABASE_URL);
app.locals.sql = sql; // <-- make it available to req.app.locals.sql

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Log requests ---
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// --- Health check ---
app.get("/api/health", async (req, res) => {
  try {
    const now = await req.app.locals.sql`SELECT NOW()`;
    res.json({
      status: "OK",
      database: now[0].now,
      environment: process.env.NODE_ENV,
    });
  } catch (err) {
    console.error("Health check error:", err);
    res.status(500).json({ status: "ERROR", database: "disconnected" });
  }
});

// --- Import routes ---
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
