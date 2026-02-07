const { Pool } = require("pg");
require("dotenv").config();

console.log("🔧 Initializing fixed database connection...");

// Use the exact connection string that worked with psql
const connectionString =
  "postgresql://neondb_owner:npg_32ZUowprYDxG@ep-cold-mud-aif2hxot-pooler.c-4.us-east-1.aws.neon.tech/neondb";

console.log(
  `📡 Connecting to: ${connectionString.replace(/:[^:@]+@/, ":****@")}`,
);

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // This is key for Neon
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection immediately
pool.on("connect", () => {
  console.log("✅ New database connection established");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err.message);
});

// Test query on startup
async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log("🎉 Successfully connected to Neon PostgreSQL!");

    const version = await client.query("SELECT version()");
    console.log(
      "📊 PostgreSQL Version:",
      version.rows[0].version.split(",")[0],
    );

    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`📋 Found ${tables.rows.length} tables:`);
    tables.rows.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    // Check data in products table
    const products = await client.query(
      "SELECT COUNT(*) as count FROM products",
    );
    console.log(`👓 Products in database: ${products.rows[0].count}`);

    if (products.rows[0].count > 0) {
      const sampleProducts = await client.query(
        "SELECT name, power, price FROM products LIMIT 3",
      );
      console.log("📦 Sample products:");
      sampleProducts.rows.forEach((product) => {
        console.log(
          `   • ${product.name} (${product.power}) - ${product.price} UGX`,
        );
      });
    }

    client.release();
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    console.error("Full error:", error);

    // Try alternative SSL configuration
    console.log("\n🔄 Trying alternative SSL configuration...");

    if (client) client.release();

    // Create a new pool with different SSL settings
    const altPool = new Pool({
      connectionString: connectionString,
      ssl: true, // Try just 'true' instead of object
      connectionTimeoutMillis: 10000,
    });

    try {
      const altClient = await altPool.connect();
      console.log("✅ Alternative SSL configuration worked!");
      altClient.release();
      await altPool.end();
    } catch (altError) {
      console.error("❌ Alternative also failed:", altError.message);
    }
  }
}

// Run test after a short delay
setTimeout(() => {
  testConnection();
}, 500);

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
