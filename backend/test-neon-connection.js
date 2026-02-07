const { Client } = require("pg");
require("dotenv").config();

async function testConnection() {
  console.log("🧪 Testing Neon Database Connection...\n");

  // Your connection string from .env
  const connectionString = process.env.DATABASE_URL;

  // Extract parts for logging (without password)
  const safeString = connectionString.replace(/:[^:@]+@/, ":****@");
  console.log("Connection string:", safeString);

  // Try different SSL configurations
  const sslConfigs = [
    {
      name: "require (current)",
      config: { ssl: { rejectUnauthorized: false } },
    },
    { name: "verify-full", config: { ssl: { rejectUnauthorized: true } } },
    { name: "no SSL", config: { ssl: false } },
    {
      name: "allow",
      config: { ssl: { rejectUnauthorized: false, require: true } },
    },
  ];

  for (const sslConfig of sslConfigs) {
    console.log(`\n🔧 Testing with: ${sslConfig.name}`);

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ...sslConfig.config,
    });

    try {
      await client.connect();
      console.log("✅ Connected successfully!");

      // Test a query
      const result = await client.query("SELECT version()");
      console.log("📊 PostgreSQL:", result.rows[0].version.split(",")[0]);

      // Check tables
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      console.log(`📋 Tables found: ${tables.rows.length}`);
      tables.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });

      await client.end();
      console.log("🎉 Connection test passed!");
      return; // Stop at first successful connection
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      if (error.code) console.log(`   Error code: ${error.code}`);
    }
  }

  console.log("\n💡 All SSL modes failed. Possible issues:");
  console.log("1. Database might be paused in Neon dashboard");
  console.log("2. IP address not allowed (check Neon IP settings)");
  console.log("3. Incorrect password");
  console.log("4. Network firewall blocking connection");
}

testConnection().catch(console.error);
