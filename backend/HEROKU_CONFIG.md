# Heroku config for production

**Same code everywhere:** The backend uses one codebase. On your machine it uses **SQLite** when `DATABASE_URL` is not set; on Heroku it uses **Postgres** (Neon or Heroku Postgres) when `DATABASE_URL` is set. No code changes—only environment variables.

**Connect without losing data:** Connecting the database (setting `DATABASE_URL` and running `init-db`) never deletes or overwrites existing data. `init-db` only creates tables if they don’t exist and inserts sample products only when the products table is empty. All migrations are additive (e.g. add column), never destructive.

---

## Deploy and make it work on Heroku (recommended)

From the **repo root**:

```bash
chmod +x deploy-heroku.sh
./deploy-heroku.sh
```

This script will:

1. Set `DATABASE_URL` and `JWT_SECRET` from `backend/.env` if you use Neon, **or** add Heroku Postgres so `DATABASE_URL` is set automatically.
2. Set `NODE_ENV=production` and ensure `JWT_SECRET` exists.
3. Push the app to Heroku.
4. Run `init-db` so tables exist and the database shows **connected**.

After it finishes, open `https://sante-production-app-42dca70009b0.herokuapp.com/api/health` and confirm `"database": "connected"`.

---

## Option 1: Set config from backend/.env only (no deploy)

If you have `backend/.env` with `DATABASE_URL` and optionally `JWT_SECRET`:

```bash
chmod +x backend/scripts/set-heroku-env.sh
./backend/scripts/set-heroku-env.sh
```

This sets `DATABASE_URL` and `JWT_SECRET` on Heroku and restarts the app.

## Option 2: Manual

```bash
# Required: Postgres (use your Neon URL or add Heroku Postgres)
heroku config:set DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" -a sante-production-app-42dca70009b0

# Required: JWT secret for auth
heroku config:set JWT_SECRET="$(openssl rand -hex 32)" -a sante-production-app-42dca70009b0

# Optional: already default
heroku config:set NODE_ENV=production -a sante-production-app-42dca70009b0
```

If you use **Neon**: copy `DATABASE_URL` from your Neon dashboard (or from backend `.env`) and set it on Heroku.

If you use **Heroku Postgres**:

```bash
heroku addons:create heroku-postgresql:essential-0 -a sante-production-app-42dca70009b0
# DATABASE_URL is set automatically
```

Then run migrations and seed (if using Neon/Postgres):

```bash
heroku run "cd backend && node scripts/init-db.js" -a sante-production-app-42dca70009b0
```

App URL: https://sante-production-app-42dca70009b0.herokuapp.com
