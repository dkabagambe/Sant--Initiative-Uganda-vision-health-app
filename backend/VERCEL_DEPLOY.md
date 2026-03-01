# Deploy Backend to Vercel via CLI

## Prerequisites
- [Node.js](https://nodejs.org/) installed
- Vercel account (sign up at [vercel.com](https://vercel.com))

## 1. Install Vercel CLI

```bash
npm install -g vercel
```

## 2. Deploy from backend directory

```bash
cd backend
vercel
```

First run: Vercel will prompt you to log in, set up the project, and link to your Vercel account.

## 3. Set environment variables in Vercel

**Required for production (set in Vercel Dashboard → Project → Settings → Environment Variables):**

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string (e.g. `postgresql://user:pass@host/db?sslmode=require`) |
| `JWT_SECRET` | Yes | Secret for JWT tokens |
| `NODE_ENV` | No | Set to `production` (default) |
| `USE_SQLITE` | No | Leave **unset** or set to `false` – SQLite does not work on Vercel |
| `TWILIO_ACCOUNT_SID` | Yes* | Twilio account SID (for OTP) |
| `TWILIO_AUTH_TOKEN` | Yes* | Twilio auth token |
| `TWILIO_VERIFY_SERVICE_SID` | Yes* | Twilio Verify service SID |
| `CORS_ORIGIN` | No | Frontend URL for CORS (e.g. `https://yourapp.vercel.app`) |

\* Required for SMS OTP login

**Note:** Do not set `USE_SQLITE=true` on Vercel. Use Postgres (Neon) only.

## 4. Production deployment

```bash
cd backend
vercel --prod
```

## 5. Redeploy after changes

```bash
cd backend
vercel --prod
```

Or push to your connected Git repo for automatic deployments.

## API base URL

After deployment, your API will be at:

```
https://<your-project>.vercel.app/api
```

Example health check:
```
https://<your-project>.vercel.app/api/health
```
