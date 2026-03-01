# Production Deployment Checklist

## ✅ Backend (Render)
- [x] Backend deployed on Render: https://sante-initiative-uganda-app.onrender.com
- [x] Health check working: `/api/health` returns OK
- [x] Database connected (PostgreSQL)
- [x] All API endpoints available
- [x] Environment: Production

## ✅ Frontend Configuration
- [x] API URL auto-detects environment (dev: local, prod: Render)
- [x] App version: 1.1.1
- [x] Version code: 4
- [x] Package name: com.sante.initiative
- [x] App name: Santé Initiative Uganda
- [x] Icons configured (icon, adaptive-icon, splash)

## ✅ Database Cleanup
- [x] Removed incomplete records (no names)
- [x] Removed duplicate referrals
- [x] Removed users with missing fields
- [x] All data validated and clean

## ✅ Features Tested
- [x] User authentication (OTP)
- [x] Dynamic user data (name, role, district)
- [x] Vision screening flow (7 steps)
- [x] Referral management (create, view, mark complete)
- [x] Inventory management (view, add, edit stock)
- [x] Payment tracking
- [x] Settings (profile, notifications, accessibility)
- [x] Offline mode with sync
- [x] All screens show correct user data

## 📱 Build AAB for Google Play

### Prerequisites
1. Ensure you're logged into EAS:
   ```bash
   cd frontend
   npx eas login
   ```

2. Build production AAB:
   ```bash
   npx eas build --platform android --profile production
   ```

3. Wait for build to complete (15-20 minutes)

4. Download AAB from EAS dashboard or CLI

### After Build
1. Go to Google Play Console
2. Create new release in Production track
3. Upload the AAB file
4. Fill in release notes
5. Submit for review

## 🔍 Testing Production Backend

Test API connection:
```bash
# Health check
curl https://sante-initiative-uganda-app.onrender.com/api/health

# Test login (replace with real phone)
curl -X POST https://sante-initiative-uganda-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0705686573"}'

# Test products
curl https://sante-initiative-uganda-app.onrender.com/api/products
```

## 📋 Google Play Store Listing

**App Details:**
- App name: Santé Initiative Uganda
- Short description: Community eye health screening and reading glasses distribution
- Full description: See PLAY_STORE_LISTING.md
- Category: Medical
- Content rating: Everyone
- Privacy policy: Required (create one)

**Screenshots needed:**
- At least 2 screenshots (1080x1920 or 1080x2340)
- Feature graphic: 1024x500
- App icon: 512x512

## 🚀 Deployment Steps

1. **Build AAB:**
   ```bash
   cd frontend
   npx eas build --platform android --profile production
   ```

2. **Test the build:**
   - Download APK for testing: `npx eas build --platform android --profile preview`
   - Install on device and test all features
   - Verify backend connection works

3. **Submit to Google Play:**
   - Upload AAB to Play Console
   - Complete store listing
   - Submit for review
   - Wait for approval (1-3 days)

## 🔐 Security Notes
- ✅ API uses HTTPS (Render)
- ✅ Authentication with JWT tokens
- ✅ OTP verification via Twilio
- ✅ No hardcoded secrets in code
- ✅ Environment variables for sensitive data

## 📊 Monitoring
- Backend logs: Render dashboard
- App crashes: Google Play Console
- User feedback: Play Store reviews
- API health: https://sante-initiative-uganda-app.onrender.com/api/health
