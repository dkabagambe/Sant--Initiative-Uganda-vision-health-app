# Production checklist: Database + AAB for Play Store

## 1. Database on Heroku (currently disconnected)

Right now the health endpoint shows **`"database": "disconnected"`**. Until you set `DATABASE_URL`, routes that use the DB (products, auth, screenings, payments, etc.) will fail.

**Do this once:**

```bash
# Option A: Use your existing Neon DB (copy from backend/.env)
heroku config:set DATABASE_URL="postgresql://neondb_owner:YOUR_PASS@ep-cold-mud-aif2hxot-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" -a sante-production-app

# Option B: Use Heroku Postgres
heroku addons:create heroku-postgresql:essential-0 -a sante-production-app
# DATABASE_URL is set automatically

# JWT for auth (if not set)
heroku config:set JWT_SECRET="$(openssl rand -hex 32)" -a sante-production-app

# Create tables and seed products (Neon or Heroku Postgres)
heroku run "cd backend && node scripts/init-db.js" -a sante-production-app
```

Then check: https://sante-production-app-42dca70009b0.herokuapp.com/api/health  
You should see **`"database": "connected"`** and **GET /api/products** should return data.

---

## 2. Routes

- **No DB needed:** `GET /api/health` → works now.
- **Need DB:** `/api/products`, `/api/auth/*`, `/api/screenings`, `/api/payments`, `/api/dashboard/*`, etc. → work after `DATABASE_URL` is set and init-db has run.

---

## 3. Build AAB for Google Play Store

Your app is already set up for **AAB** (`eas.json` → `"buildType": "app-bundle"`).

**From your machine (in `frontend` folder):**

```bash
cd frontend

# Install EAS CLI if needed
npm install -g eas-cli

# Log in to Expo (once)
eas login

# Build production AAB (uses Heroku API by default)
eas build --platform android --profile production
```

Or use the script:

```bash
cd frontend
./build-playstore.sh
```

- The build runs in the cloud (10–20 min).
- You get a link to download the **.aab** file.
- Upload that **.aab** in [Google Play Console](https://play.google.com/console) → your app → Production → Create new release.

**Note:** The frontend is already configured to use the Heroku API by default, so the AAB will talk to `https://sante-production-app-42dca70009b0.herokuapp.com/api` unless you set `EXPO_PUBLIC_API_URL` in an env or EAS secrets.
