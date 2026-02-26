#!/bin/bash
# Deploy backend to Heroku and ensure database works.
# Run from repo root: ./deploy-heroku.sh

set -e
APP_NAME="${HEROKU_APP_NAME:-sante-production-app-42dca70009b0}"
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

echo "🚀 Deploying Santé Backend to Heroku ($APP_NAME)"
echo ""

# Heroku CLI
if ! command -v heroku &> /dev/null; then
  echo "❌ Heroku CLI not installed. Install: https://devcenter.heroku.com/articles/heroku-cli"
  exit 1
fi

# 1) Use Neon from backend/.env if present; otherwise ensure Heroku Postgres exists
ENV_FILE="$REPO_ROOT/backend/.env"
if [ -f "$ENV_FILE" ]; then
  DATABASE_URL_FROM_ENV=$(grep -v '^#' "$ENV_FILE" | grep '^DATABASE_URL=' | sed 's/^DATABASE_URL=//' | tr -d '\r"')
  if [ -n "$DATABASE_URL_FROM_ENV" ] && [[ "$DATABASE_URL_FROM_ENV" == postgres* ]]; then
    echo "📦 Setting DATABASE_URL and JWT_SECRET from backend/.env..."
    heroku config:set "DATABASE_URL=$DATABASE_URL_FROM_ENV" -a "$APP_NAME"
    JWT_FROM_ENV=$(grep -v '^#' "$ENV_FILE" | grep '^JWT_SECRET=' | sed 's/^JWT_SECRET=//' | tr -d '\r"')
    if [ -n "$JWT_FROM_ENV" ]; then
      heroku config:set "JWT_SECRET=$JWT_FROM_ENV" -a "$APP_NAME"
    else
      heroku config:set "JWT_SECRET=$(openssl rand -hex 32)" -a "$APP_NAME"
    fi
    echo "✅ Config set from .env"
  fi
fi

# If DATABASE_URL still not set, add Heroku Postgres
CURRENT_DB=$(heroku config:get DATABASE_URL -a "$APP_NAME" 2>/dev/null || true)
if [ -z "$CURRENT_DB" ]; then
  echo "📦 Adding Heroku Postgres (DATABASE_URL will be set automatically)..."
  heroku addons:create heroku-postgresql:essential-0 -a "$APP_NAME" || true
  echo "   Waiting for addon to provision..."
  sleep 10
fi

# Ensure NODE_ENV and JWT_SECRET
heroku config:set NODE_ENV=production -a "$APP_NAME"
JWT=$(heroku config:get JWT_SECRET -a "$APP_NAME" 2>/dev/null || true)
if [ -z "$JWT" ]; then
  heroku config:set "JWT_SECRET=$(openssl rand -hex 32)" -a "$APP_NAME"
fi

# Heroku remote
if ! git remote | grep -q heroku; then
  echo "🔗 Adding Heroku remote..."
  heroku git:remote -a "$APP_NAME"
fi

# Deploy
echo ""
echo "🔨 Pushing to Heroku..."
git push heroku main 2>/dev/null || git push heroku master:main

echo ""
echo "⏳ Waiting for app to start..."
sleep 8

# Create tables (safe: only creates if not exist, no data loss)
echo ""
echo "📦 Creating tables if needed (init-db)..."
heroku run "cd backend && node scripts/init-db.js" -a "$APP_NAME" || true

echo ""
echo "📊 Health check:"
curl -s "https://$APP_NAME.herokuapp.com/api/health" | head -c 500
echo ""
echo ""
echo "✅ Done. App: https://$APP_NAME.herokuapp.com"
echo "   Logs: heroku logs --tail -a $APP_NAME"
