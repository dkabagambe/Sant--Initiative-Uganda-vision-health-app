# Deploy backend to Render

Yes, the backend works on Render. No code changes are required.

## 1. Create a Render account and connect the repo

- Go to [render.com](https://render.com) and sign up / log in.
- **Dashboard** → **New** → **Web Service**.
- Connect your GitHub repo (`sante-initiative`).

## 2. Configure the Web Service

- **Name:** `sante-backend` (or any name).
- **Region:** Choose one (e.g. Oregon).
- **Root Directory:** `backend` (important).
- **Runtime:** Node.
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Render sets `PORT` for you; the app already uses `process.env.PORT`.

## 3. Environment variables (required for production)

In the Render service → **Environment** tab, add:

| Key            | Value |
|----------------|--------|
| `NODE_ENV`     | `production` |
| `DATABASE_URL` | Your Postgres URL (e.g. Neon: `postgresql://user:pass@host/db?sslmode=require`) |
| `JWT_SECRET`   | A long random string (same as you use elsewhere for sessions) |

Optional:

- `CORS_ORIGIN` – e.g. `https://your-app.com` if you want to restrict CORS.

Do **not** set `USE_SQLITE` on Render; production should use Postgres via `DATABASE_URL`.

## 4. Database (Postgres)

- Use your existing **Neon** Postgres URL as `DATABASE_URL`, or
- Create a **Render Postgres** database (Dashboard → New → PostgreSQL) and use its Internal/External URL as `DATABASE_URL`.

## 5. Run migrations once after first deploy

After the first deploy, run the init script once so tables exist:

- Render Dashboard → your **sante-backend** service → **Shell** tab (or use Render’s “Background Worker” for a one-off if you prefer), then:

```bash
node scripts/init-db.js
```

Or locally with the production DB (set `DATABASE_URL` to the same URL Render uses):

```bash
cd backend && DATABASE_URL="postgresql://..." node scripts/init-db.js
```

## 6. Point the frontend to Render

Your backend URL will look like: `https://sante-backend.onrender.com` (or the name you gave the service).

**Option A – Build-time (recommended)**  
When building the app (e.g. for Google Play), set:

```bash
EXPO_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
```

Then run your EAS build. The app will use the Render API.

**Option B – Change default in code**  
In `frontend/src/services/api.ts`, set the default base URL to your Render URL so production builds use it without env:

```ts
const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "https://YOUR-RENDER-SERVICE.onrender.com/api";
```

## 7. Free tier notes

- Render free tier spins down after ~15 minutes of no traffic; the first request after that can take 30–60 seconds (cold start). Your frontend already uses a 30s timeout, which helps.
- For always-on and no cold starts, use a paid plan.

## Summary

| Item            | Heroku              | Render                    |
|-----------------|---------------------|---------------------------|
| Node / Express  | ✅                  | ✅                        |
| PORT            | Set by Heroku       | Set by Render             |
| Postgres        | Add-on or Neon      | Neon or Render Postgres   |
| Env vars        | Dashboard / CLI     | Dashboard                 |
| Migrations      | `heroku run`        | Shell or local with URL   |

Switching to Render is only a matter of deployment target and env/URL; the same backend code works on both.
