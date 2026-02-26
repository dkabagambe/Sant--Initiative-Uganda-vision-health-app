#!/bin/bash
# Final test before building AAB for Google Play Console.
# Run from repo root: ./final-test-before-build.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

echo "=============================================="
echo "  Final test before Google Play build"
echo "=============================================="
echo ""

# 1) Backend (local) - DB layer works with SQLite
echo "1. Backend (DB layer with SQLite)..."
cd "$REPO_ROOT/backend"
USE_SQLITE=1 timeout 8 node -e "
const { sql } = require('./src/db');
(async () => {
  const r = await sql\`SELECT 1 as ok\`;
  if (!r || !r[0]) throw new Error('DB check failed');
  console.log('   Backend DB: OK');
})().catch(e => { console.error('   Backend DB:', e.message); process.exit(1); });
" 2>/dev/null && echo "   Backend code: OK" || { echo "   Backend: FAILED"; exit 1; }
echo ""

# 2) Frontend TypeScript
echo "2. Frontend TypeScript..."
cd "$REPO_ROOT/frontend"
npx tsc --noEmit 2>&1 && echo "   TypeScript: OK" || { echo "   TypeScript: FAILED"; exit 1; }
echo ""

# 3) API config
echo "3. Frontend API target..."
grep -q "sante-production-app-42dca70009b0.herokuapp.com" src/services/api.ts && echo "   API base URL: Heroku (production)" || echo "   API base URL: check api.ts"
echo ""

# 4) Heroku health (informational)
echo "4. Heroku API (live)..."
HEALTH=$(curl -s -m 5 "https://sante-production-app-42dca70009b0.herokuapp.com/api/health" 2>/dev/null || echo "{}")
if echo "$HEALTH" | grep -q '"status":"OK"'; then
  echo "   Heroku app: reachable"
  if echo "$HEALTH" | grep -q '"database":"connected"'; then
    echo "   Heroku database: connected"
  else
    echo "   Heroku database: not connected (set DATABASE_URL and run init-db for full API)"
  fi
else
  echo "   Heroku app: unreachable or error (check network)"
fi
echo ""

echo "=============================================="
echo "  Tests done. Build AAB when ready:"
echo "  cd frontend && eas build --platform android --profile production"
echo "=============================================="
