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
  // Production/Development: Neon/Postgres (async). Same database as Vercel.
  try {
    const { neon } = require("@neondatabase/serverless");
    sql = neon(rawUrl);
    console.log('🔗 Using Neon database (same as Vercel production)');
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
