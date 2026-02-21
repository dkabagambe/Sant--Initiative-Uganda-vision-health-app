# Heroku Deployment Guide

## Prerequisites
- ✅ Heroku account created
- ✅ Pipeline created: `sante1`
- ✅ Staging app: `sante-production-app`

## Deployment Steps

### 1. Install Heroku CLI (if not installed)
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Add Heroku Remote
```bash
cd /home/daniel/websites/sante-initiative/backend
heroku git:remote -a sante-production-app
```

### 4. Set Environment Variables
```bash
heroku config:set NODE_ENV=production -a sante-production-app
heroku config:set JWT_SECRET=$(openssl rand -hex 32) -a sante-production-app
heroku config:set PORT=5000 -a sante-production-app
```

Optional (if using Twilio):
```bash
heroku config:set TWILIO_ACCOUNT_SID=your_sid -a sante-production-app
heroku config:set TWILIO_AUTH_TOKEN=your_token -a sante-production-app
heroku config:set TWILIO_PHONE_NUMBER=your_number -a sante-production-app
```

### 5. Deploy to Heroku
```bash
git push heroku main
```

If your branch is named differently:
```bash
git push heroku master:main
```

### 6. Check Deployment
```bash
heroku logs --tail -a sante-production-app
heroku open -a sante-production-app
```

### 7. Test API
```bash
curl https://sante-production-app.herokuapp.com/api/health
```

## Database Setup

### Option A: SQLite (Current - Simple)
- ✅ Already configured
- ⚠️ Data resets on dyno restart
- Good for testing/staging

### Option B: PostgreSQL (Recommended for Production)
```bash
# Add Postgres addon
heroku addons:create heroku-postgresql:mini -a sante-production-app

# Get database URL
heroku config:get DATABASE_URL -a sante-production-app

# Set database type
heroku config:set DB_TYPE=postgres -a sante-production-app
```

## Update Frontend API URL

After deployment, update frontend:
```typescript
// frontend/src/services/api.ts
const API_BASE_URL = "https://sante-production-app.herokuapp.com/api";
```

## Troubleshooting

### Check Logs
```bash
heroku logs --tail -a sante-production-app
```

### Restart App
```bash
heroku restart -a sante-production-app
```

### Check Dynos
```bash
heroku ps -a sante-production-app
```

### Run Commands
```bash
heroku run bash -a sante-production-app
```

## Production Checklist

- [ ] Environment variables set
- [ ] Database configured
- [ ] API health check working
- [ ] Frontend API URL updated
- [ ] CORS configured for frontend domain
- [ ] Error logging enabled
- [ ] Monitoring setup

## Your App URLs

- **Staging**: https://sante-production-app.herokuapp.com
- **API Health**: https://sante-production-app.herokuapp.com/api/health
- **Dashboard**: https://dashboard.heroku.com/apps/sante-production-app

## Next Steps

1. Deploy backend to staging
2. Test all endpoints
3. Update frontend API URL
4. Build mobile app with EAS
5. Promote to production when ready
