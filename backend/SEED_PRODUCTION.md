# Seed production database (Neon) so the app shows data

Your **Vercel backend** uses **Neon Postgres**. If the database is empty, the app shows zeros (no products, no inventory). Use the same Neon database for **local development and production** so data is identical and you avoid sync/seed mismatches.

---

## One database for dev and production (recommended)

- **Local backend:** In `backend/.env` set `USE_SQLITE=false` and use the **same** `DATABASE_URL` as in Vercel (your Neon connection string). Local and production then share one database.
- **Vercel:** Never set `USE_SQLITE`; it always uses `DATABASE_URL` (Neon).
- Result: one source of truth, no “empty production” vs “full dev” confusion. Seed once; it applies everywhere.

---

## Option A: Seed via API (recommended)

1. **Add `SEED_SECRET` in Vercel**
   - Vercel Dashboard → your backend project → **Settings** → **Environment Variables**
   - Add: Name `SEED_SECRET`, Value any secret string (e.g. `my-secret-seed-123`).
   - Save and **redeploy** the backend.

2. **Call the seed endpoint once** (from terminal or Postman):

   ```bash
   curl -X POST https://backend-tau-sepia-43.vercel.app/api/seed-production \
     -H "Content-Type: application/json" \
     -H "x-seed-secret: YOUR_SEED_SECRET"
   ```

   Replace `YOUR_SEED_SECRET` with the value you set in Vercel. Replace the URL with your real backend URL if different.

3. **Seed sample activity for all users** (so every user sees dashboard data):

   ```bash
   curl -X POST https://backend-tau-sepia-43.vercel.app/api/seed-production/sample-activity \
     -H "Content-Type: application/json" \
     -H "x-seed-secret: YOUR_SEED_SECRET"
   ```

   This adds 2 sample screenings and 1 payment per user (only for users who have no screenings yet). Run once after products are seeded.

4. **Reload the app**
   You should see products, inventory, and dashboard data. All users get sample activity; no user sees empty zeros.

---

## Option B: Seed via script (from your machine)

1. **Get your Neon `DATABASE_URL`** from Vercel → Project → Settings → Environment Variables.

2. **Run** (from project root or backend folder):

   ```bash
   cd backend
   FORCE_POSTGRES=1 DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" node scripts/init-db.js
   ```

   Or set `DATABASE_URL` in `.env` (and do **not** set `USE_SQLITE`), then:

   ```bash
   npm run seed:production
   ```

---

## What gets seeded

- **Products (POST /api/seed-production):** Six reading-glasses products (+1.00 to +3.50) with stock and prices. If products already exist, the seed does nothing.
- **Sample activity (POST /api/seed-production/sample-activity):** For **every user** who has no screenings yet: 2 sample screenings (one needing glasses, one referred) and 1 completed payment. So all users see dashboard data; no one sees zeros.
- **Option B** (script) also creates tables (`users`, `products`, `screenings`, etc.) if they don't exist.

**Users** (from login/registration) are already in Neon; the seed does not change them.
