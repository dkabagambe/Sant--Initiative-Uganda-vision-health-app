/**
 * Database layer: uses Neon (Postgres) when DATABASE_URL is set (production/Heroku),
 * otherwise uses local SQLite (db-local).
 * Exposes async `sql` so controllers can always use await.
 */
require("dotenv").config();

let sql;
let db = null;

if (process.env.DATABASE_URL) {
  // Production: Neon/Postgres (async)
  const { neon } = require("@neondatabase/serverless");
  sql = neon(process.env.DATABASE_URL);
  module.exports = { sql, db };
} else {
  // Local: SQLite via db-local (sync). Wrap in Promise so callers can await.
  const dbLocal = require("./db-local");
  const syncSql = dbLocal.sql;
  sql = function (strings, ...values) {
    return Promise.resolve(syncSql.apply(null, [strings, ...values]));
  };
  db = dbLocal.db;
  module.exports = { sql, db };
}
