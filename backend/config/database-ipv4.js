const { Client } = require("pg");
require("dotenv").config();

console.log("🔌 Using direct database connection (no pool)...");

class Database {
  constructor() {
    this.connectionString =
      "postgresql://neondb_owner:npg_32ZUowprYDxG@ep-cold-mud-aif2hxot-pooler.c-4.us-east-1.aws.neon.tech/neondb";
    this.config = {
      connectionString: this.connectionString,
      ssl: { rejectUnauthorized: false },
      // Force IPv4
      family: 4,
      // Shorter timeout
      connectionTimeoutMillis: 10000,
    };
  }

  async query(text, params) {
    const client = new Client(this.config);

    try {
      await client.connect();
      const result = await client.query(text, params);
      await client.end();
      return result;
    } catch (error) {
      console.error("Query error:", error.message);
      await client.end().catch(() => {});
      throw error;
    }
  }

  async connect() {
    const client = new Client(this.config);
    await client.connect();
    return {
      query: (text, params) => client.query(text, params),
      release: () => client.end(),
    };
  }
}

const db = new Database();

// Test connection
setTimeout(async () => {
  try {
    const result = await db.query("SELECT version()");
    console.log("✅ Database connected!");
    console.log("📊 PostgreSQL:", result.rows[0].version.split(",")[0]);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("💡 Using fallback mock mode");
  }
}, 500);

module.exports = db;
