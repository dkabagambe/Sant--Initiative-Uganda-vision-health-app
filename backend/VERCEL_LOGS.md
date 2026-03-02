# How to check Vercel logs (login / app crash)

## Where to look

1. Go to [vercel.com](https://vercel.com) → your project (backend).
2. **Deployments** → click the latest deployment → **Functions** (or **Logs**).
3. Or: **Logs** in the top tab → filter by time and look for errors.

## What to check when login fails or app closes

- **Runtime errors**  
  Look for red errors or stack traces. Common causes:
  - `JWT_SECRET` missing or too short (must be ≥ 16 characters).
  - `DATABASE_URL` missing or wrong (Neon connection errors).
  - `Failed to load Neon client` or `connection refused` → database unreachable.

- **Auth routes**  
  Filter or search for:
  - `/api/auth/login` – when user taps “Send OTP”.
  - `/api/auth/verify-otp` – when user submits OTP.
  If these return **500**, the log for that request usually shows the error (e.g. missing env, DB error, Twilio error).

- **Environment variables**  
  **Project Settings → Environment Variables** (Production):
  - `DATABASE_URL` – Neon Postgres URL.
  - `JWT_SECRET` – at least 16 characters.
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` – for OTP.

After changing env vars, **redeploy** (Deployments → ⋮ → Redeploy).

## Quick test from terminal

```bash
# Test health
curl -s https://backend-tau-sepia-43.vercel.app/api/health | head -20

# Test login (replace with a registered number)
curl -s -X POST https://backend-tau-sepia-43.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0705686573"}'
```

If these return 200 and JSON, the backend is up. If 500, check the Vercel function log for that request.
