/**
 * Database layer: uses Neon (Postgres) when DATABASE_URL is set (production/Heroku),
 * otherwise uses local SQLite (db-local).
 * Set USE_SQLITE=true (or 1) in .env to force SQLite locally when Neon is unreachable.
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
    sql = neon(rawUrl);
    module.exports = { sql, db };
  } catch (err) {
    console.error("Failed to load Neon client:", err.message);
    throw err;
  }
} else {
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
