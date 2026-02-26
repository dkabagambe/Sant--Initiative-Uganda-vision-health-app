#!/usr/bin/env bash
# Run database init locally using the same Postgres as Render.
# Use when Render free tier (no Shell) or when you prefer running migrations from your machine.
#
# 1. Get DATABASE_URL from Render: Dashboard → your service → Environment → DATABASE_URL
# 2. Run one of:
#
#    DATABASE_URL='postgresql://user:pass@host/db?sslmode=require' ./run-init-db.sh
#
#    or export it first:
#    export DATABASE_URL='postgresql://...'
#    ./run-init-db.sh

set -e
cd "$(dirname "$0")/backend"

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set."
  echo ""
  echo "Get it from Render: Dashboard → Sante-Initiative-Uganda-app → Environment → DATABASE_URL"
  echo "Then run:"
  echo "  DATABASE_URL='your-postgres-url' ./run-init-db.sh"
  exit 1
fi

echo "📦 Running init-db against your Postgres (same as Render)..."
node scripts/init-db.js
echo "✅ Done. Render will use these tables once DATABASE_URL is set there."
