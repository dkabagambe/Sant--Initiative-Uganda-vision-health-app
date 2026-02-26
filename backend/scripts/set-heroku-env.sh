#!/bin/bash
# Set Heroku config from backend/.env so the database connects in production.
# Run from repo root: ./backend/scripts/set-heroku-env.sh
# Or from backend: ./scripts/set-heroku-env.sh

set -e
APP_NAME="${HEROKU_APP_NAME:-sante-production-app-42dca70009b0}"
ENV_FILE="$(dirname "$0")/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Not found: $ENV_FILE"
  echo "   Create backend/.env with DATABASE_URL and optionally JWT_SECRET, then run this script again."
  exit 1
fi

echo "📦 Setting Heroku config for $APP_NAME from backend/.env ..."

# Read DATABASE_URL (everything after DATABASE_URL= so URLs with = work)
DATABASE_URL=$(grep -v '^#' "$ENV_FILE" | grep '^DATABASE_URL=' | sed 's/^DATABASE_URL=//' | tr -d '\r"')
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in $ENV_FILE"
  exit 1
fi

heroku config:set "DATABASE_URL=$DATABASE_URL" -a "$APP_NAME"
echo "✅ DATABASE_URL set"

# JWT_SECRET: use from .env or generate
JWT_SECRET=$(grep -v '^#' "$ENV_FILE" | grep '^JWT_SECRET=' | sed 's/^JWT_SECRET=//' | tr -d '\r"')
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  echo "   Generated new JWT_SECRET"
fi
heroku config:set "JWT_SECRET=$JWT_SECRET" -a "$APP_NAME"
echo "✅ JWT_SECRET set"

echo ""
echo "🔄 Restarting app..."
heroku restart -a "$APP_NAME"
echo ""
echo "📊 Check health: https://$APP_NAME.herokuapp.com/api/health"
echo "   Then run: heroku run \"cd backend && node scripts/init-db.js\" -a $APP_NAME"
echo ""
