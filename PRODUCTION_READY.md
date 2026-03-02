# Production readiness checklist

## Backend (Vercel)

- **Env vars** (Vercel Dashboard → Project → Settings → Environment Variables):
  - `DATABASE_URL` – Neon Postgres URL (required)
  - `JWT_SECRET` – min 16 characters (required)
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` – for OTP
  - Optional: `CORS_ORIGIN` – your app/frontend origin
- **Do not set** `USE_SQLITE` on Vercel.
- The app will fail to start if `JWT_SECRET` or `DATABASE_URL` are missing in production.
- See `backend/VERCEL_DEPLOY.md` for deploy steps.

## Frontend (Expo / Google Play)

- **Production API**: In release builds (`__DEV__ === false`), the app uses `VERCEL_API_URL` in `configService.ts` (no `.env` needed for store builds).
- **Local / device testing**: Set `EXPO_PUBLIC_API_URL` in `frontend/.env` (e.g. `http://YOUR_IP:5000/api`); see `frontend/PHYSICAL_DEVICE_SETUP.md`.
- **Version**: Bump `version` and `android.versionCode` in `frontend/app.json` before each store release.
- **Build**: Use EAS Build or `expo prebuild` + `./gradlew bundleRelease` for Android.

## Pre-release tests

Run `backend/scripts/smoke-test-api.js` against your Vercel URL and complete the manual checklist in `PRE_PRODUCTION_TEST.md`.
