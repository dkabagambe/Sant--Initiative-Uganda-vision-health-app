/**
 * Database layer: uses Postgres when DATABASE_URL is set and SQLite is not explicitly allowed.
 * Keep the same Neon DATABASE_URL locally and in Vercel so dev and production share one DB.
 * SQLite is disabled by default to prevent accidental drift from the shared Play Store database.
 * Exposes async `sql` so controllers can always use await.
 */
require("dotenv").config();

let sql;
let db = null;

const allowSqliteLocal =
  process.env.ALLOW_SQLITE_LOCAL &&
  ["true", "1", "yes"].includes(
    String(process.env.ALLOW_SQLITE_LOCAL).toLowerCase(),
  );
const useSqliteEnv =
  process.env.USE_SQLITE &&
  ["true", "1", "yes"].includes(String(process.env.USE_SQLITE).toLowerCase());
const rawUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();
const hasPostgresUrl =
  rawUrl &&
  (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://"));

if (useSqliteEnv && !allowSqliteLocal) {
  const message =
    "SQLite startup is blocked by default. Remove USE_SQLITE or set ALLOW_SQLITE_LOCAL=true only for an intentional one-off test. Local dev must use the shared Postgres DATABASE_URL.";
  console.error(message);
  throw new Error(message);
}

if (hasPostgresUrl && !useSqliteEnv) {
  // Production: Neon/Postgres (async). Same database as Vercel.
  try {
    const { neon } = require("@neondatabase/serverless");

    // Create Neon client with custom configuration for corporate networks
    const neonSql = neon(rawUrl, {
      connectionTimeoutMillis: 10000,
      queryTimeoutMillis: 30000,
    });

    // Test connection immediately
    const testConnection = async () => {
      try {
        const result = await neonSql`SELECT NOW() as test`;
        console.log("✅ Neon database connection successful");
        return true;
      } catch (error) {
        console.error("❌ Neon connection test failed:", error.message);
        return false;
      }
    };

    // Wrap with retry mechanism
    sql = async function (strings, ...values) {
      const maxRetries = 3;
      const baseDelay = 1000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await neonSql(strings, ...values);
        } catch (error) {
          console.warn(`Neon query attempt ${attempt} failed:`, error.message);

          if (attempt === maxRetries) {
            throw new Error(
              `Database connection failed after ${maxRetries} attempts: ${error.message}`,
            );
          }

          // Exponential backoff
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    // Test connection on startup and fail loudly when the shared Postgres URL is unavailable.
    // Local dev should match the same DB used by the Play Store build unless SQLite is intentionally chosen.
    testConnection()
      .then((success) => {
        if (success) {
          console.log("🔗 Using Neon database (same as Vercel production)");
        } else {
          const message =
            "⚠️ Postgres connection check failed. Local development must use the same DATABASE_URL as production; set USE_SQLITE=true only for explicit SQLite testing.";
          console.error(message);
          throw new Error(message);
        }
      })
      .catch((err) => {
        console.error(
          "❌ Neon connection failed while starting app:",
          err.message,
        );
        throw err;
      });

    // Export immediately for synchronous access
    module.exports = { sql, db };
  } catch (err) {
    console.error("Failed to load Neon client:", err.message);
    throw err;
  }
} else {
  // Vercel serverless: SQLite does not work (read-only filesystem). Must use Postgres.
  if (process.env.VERCEL) {
    throw new Error(
      "Vercel deployment requires DATABASE_URL (Neon Postgres). " +
        "Add it in Vercel Dashboard → Project Settings → Environment Variables. " +
        "Do not set USE_SQLITE=true on Vercel.",
    );
  }
  // Local: SQLite via db-local (sync). Only enabled for intentional one-off testing.
  if (useSqliteEnv) {
    console.log(
      "⚠️ ALLOW_SQLITE_LOCAL=true: using SQLite for a temporary local-only test.",
    );
  }
  const dbLocal = require("./db-local");
  const syncSql = dbLocal.sql;
  sql = function (strings, ...values) {
    return Promise.resolve(syncSql.apply(null, [strings, ...values]));
  };
  db = dbLocal.db;
  module.exports = { sql, db };
}
