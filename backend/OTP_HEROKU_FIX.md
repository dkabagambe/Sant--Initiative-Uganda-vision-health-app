# OTP Fix for Heroku Deployment

## Problem
The OTP system was generating codes but verification was failing on Heroku because:
1. Code was hardcoded to use SQLite instead of PostgreSQL
2. SQL queries used SQLite-specific syntax (`datetime('now')`) incompatible with PostgreSQL
3. OTP expiration check was done in SQL instead of JavaScript

## Changes Made

### 1. Fixed Database Selection (src/index.js)
- Auto-detects PostgreSQL on Heroku via `DATABASE_URL`
- Falls back to SQLite for local development
- No manual configuration needed

### 2. Fixed OTP Verification (src/controllers/authController.js)
- Changed OTP expiration check from SQL to JavaScript (works with both databases)
- Replaced `datetime('now')` with `new Date().toISOString()`
- Fixed timestamp handling for both registration and login flows

### 3. Fixed Payment Status Updates (src/controllers/paymentController.js)
- Replaced raw SQL queries with tagged template syntax
- Fixed timestamp handling for payment verification

## Deployment Steps

### Option 1: Quick Deploy (Recommended)
```bash
cd backend
./deploy-heroku.sh
```

### Option 2: Manual Deploy
```bash
cd backend

# Login to Heroku
heroku login

# Set environment variables
heroku config:set NODE_ENV=production -a sante-production-app
heroku config:set DATABASE_URL=<your-postgres-url> -a sante-production-app
heroku config:set JWT_SECRET=$(openssl rand -hex 32) -a sante-production-app

# Add PostgreSQL if not exists
heroku addons:create heroku-postgresql:essential-0 -a sante-production-app

# Initialize database
heroku run node scripts/init-db.js -a sante-production-app

# Deploy
git add .
git commit -m "Fix OTP verification for PostgreSQL"
git push heroku main

# Check logs
heroku logs --tail -a sante-production-app
```

## Testing OTP

### 1. Request OTP
```bash
curl -X POST https://sante-production-app.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0700123456"}'
```

Response will include the OTP (since Twilio is disabled):
```json
{
  "success": true,
  "message": "OTP generated (SMS unavailable)",
  "phoneNumber": "0700123456",
  "otp": "123456"
}
```

### 2. Verify OTP
```bash
curl -X POST https://sante-production-app.herokuapp.com/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0700123456",
    "otp": "123456"
  }'
```

Should return:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {...}
}
```

## Environment Variables Required

```bash
# Required
NODE_ENV=production
DATABASE_URL=postgresql://...  # Auto-set by Heroku Postgres addon
JWT_SECRET=<random-secret>

# Optional (for SMS)
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_VERIFY_SERVICE_SID=<your-service-sid>
```

## Database Compatibility

The code now works with both:
- **SQLite** (local development) - Uses `better-sqlite3`
- **PostgreSQL** (Heroku/production) - Uses `@neondatabase/serverless`

Auto-detection based on `DATABASE_URL` format.

## Troubleshooting

### OTP Still Not Working?
```bash
# Check logs
heroku logs --tail -a sante-production-app

# Check database connection
heroku run node -e "const {neon}=require('@neondatabase/serverless');const sql=neon(process.env.DATABASE_URL);sql\`SELECT NOW()\`.then(r=>console.log('DB OK:',r))" -a sante-production-app

# Restart app
heroku restart -a sante-production-app
```

### Database Not Initialized?
```bash
heroku run node scripts/init-db.js -a sante-production-app
```

### Check Environment Variables
```bash
heroku config -a sante-production-app
```

## Next Steps

1. Deploy to Heroku: `./deploy-heroku.sh`
2. Initialize database: `heroku run node scripts/init-db.js -a sante-production-app`
3. Test OTP flow with the curl commands above
4. Update frontend API URL to point to Heroku app
5. (Optional) Enable Twilio for real SMS

## Files Modified

- `backend/src/index.js` - Auto-detect database type
- `backend/src/controllers/authController.js` - Fix OTP verification
- `backend/src/controllers/paymentController.js` - Fix timestamp handling
- `backend/deploy-heroku.sh` - New deployment script
- `backend/OTP_HEROKU_FIX.md` - This documentation
