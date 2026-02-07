const { Pool } = require("pg");
require("dotenv").config();

// Check if we have a database URL
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set. Using mock data mode.");
}

let pool;

if (process.env.DATABASE_URL) {
  // Parse the connection string to extract components
  const connectionString = process.env.DATABASE_URL;

  pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false, // This fixes the SSL warning for Neon
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  console.log("🔌 Database connection configured for Neon");
} else {
  // Mock pool for development without database
  pool = {
    query: (text, params) => {
      console.log("📝 Mock DB query:", text.substring(0, 100) + "...");
      return Promise.resolve({ rows: [], rowCount: 0 });
    },
    connect: () => {
      return {
        release: () => {},
        query: () => Promise.resolve({ rows: [], rowCount: 0 }),
      };
    },
  };
  console.log(
    "💡 No DATABASE_URL set - working in development mode with mock data",
  );
}

// Event listeners for real pool only
if (process.env.DATABASE_URL) {
  pool.on("connect", () => {
    console.log("🔌 New database connection established");
  });

  pool.on("error", (err) => {
    console.error("❌ Database connection error:", err.message);
  });
}

// Test connection for real pool
const testConnection = async () => {
  if (process.env.DATABASE_URL) {
    try {
      const client = await pool.connect();
      console.log("✅ Connected to PostgreSQL database (Neon)");

      const result = await client.query("SELECT version()");
      console.log(
        "📊 PostgreSQL Version:",
        result.rows[0].version.split(",")[0],
      );

      // Check our tables
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);

      console.log(`📋 Tables created: ${tables.rows.length}`);
      tables.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });

      // Check products count
      const products = await client.query(
        "SELECT COUNT(*) as count FROM products",
      );
      console.log(`👓 Sample products loaded: ${products.rows[0].count}`);

      client.release();
    } catch (err) {
      console.warn("⚠️  Could not connect to database:", err.message);
      console.log("💡 Check your DATABASE_URL in .env file");
    }
  } else {
    console.log("💡 Working with mock data - no database connection");
  }
};

// Call test on startup
setTimeout(() => {
  testConnection();
}, 1000); // Small delay to ensure server is up

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
  testConnection,
};
