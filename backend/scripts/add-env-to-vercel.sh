#!/bin/bash
# Adds variables from .env to Vercel (keeps secrets in .env, not in command history)
# Run from backend/: ./scripts/add-env-to-vercel.sh

cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  echo "No .env file found in backend/"
  exit 1
fi

# Vercel env add for production
echo "Adding env vars to Vercel (production)..."
while IFS= read -r line; do
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  key=$(echo "$key" | tr -d ' ')
  [[ -z "$key" ]] && continue
  # Skip commented and empty keys
  [[ "$key" =~ ^# ]] && continue
  # Skip USE_SQLITE on Vercel — must use Postgres (DATABASE_URL)
  [[ "$key" == "USE_SQLITE" ]] && continue
  echo "  Adding $key..."
  printf '%s' "$value" | npx vercel env add "$key" production --force 2>/dev/null || printf '%s' "$value" | npx vercel env add "$key" production
done < .env

echo ""
echo "Done. Redeploy with: npx vercel --prod"
