/**
 * Database layer: uses Neon (Postgres) when DATABASE_URL is set and USE_SQLITE is not true.
 * Use the same Neon DATABASE_URL locally and in Vercel so dev and production share one DB.
 * Set USE_SQLITE=true (or 1) in .env only when Neon is unreachable (falls back to SQLite).
 * Exposes async `sql` so controllers can always use await.
 * Connecting never deletes or overwrites data; init-db and migrations are additive only.
 */
require("dotenv").config();

let sql;
let db = null;

const useSqliteEnv = process.env.USE_SQLITE && ["true", "1", "yes"].includes(String(process.env.USE_SQLITE).toLowerCase());
const rawUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();
const hasPostgresUrl = rawUrl && (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://"));

if (hasPostgresUrl && !useSqliteEnv) {
  // Production/Heroku: Neon/Postgres (async). Connection is per-query; no data is modified on connect.
  try {
    const { neon } = require("@neondatabase/serverless");
    const neonSql = neon(rawUrl);
    
    // Wrap with retry mechanism for network issues
    sql = async function(strings, ...values) {
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await neonSql(strings, ...values);
          return result;
        } catch (error) {
          console.warn(`Neon query attempt ${attempt} failed:`, error.message);
          
          if (attempt === maxRetries) {
            console.error('Neon connection failed after retries, falling back to SQLite');
            // Fallback to SQLite for this query
            const dbLocal = require("./db-local");
            const syncSql = dbLocal.sql;
            return syncSql.apply(null, [strings, ...values]);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    };
    
    console.log('🔗 Using Neon database with automatic retry fallback');
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
      "Do not set USE_SQLITE=true on Vercel."
    );
  }
  // Local: SQLite via db-local (sync). Wrap in Promise so callers can await.
  if (useSqliteEnv) {
    console.log("📦 USE_SQLITE=true: using SQLite (ignore DATABASE_URL for this run).");
  }
  const dbLocal = require("./db-local");
  const syncSql = dbLocal.sql;
  sql = function (strings, ...values) {
    return Promise.resolve(syncSql.apply(null, [strings, ...values]));
  };
  db = dbLocal.db;
  module.exports = { sql, db };
}
