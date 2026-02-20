// test.js
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("✅ Database connected. Server time:", result[0].now);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

testConnection();
