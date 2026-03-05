# 🚀 Play Store Deployment Guide - Santé Initiative

## 📋 Pre-Deployment Checklist

### ✅ Frontend Configuration
- [ ] API URL switched to Vercel production
- [ ] Remote config service integrated
- [ ] Environment variables set for production
- [ ] TypeScript compilation passes
- [ ] ESLint warnings addressed

### ✅ Backend Configuration  
- [ ] Vercel deployment working
- [ ] All API endpoints tested
- [ ] Database schema verified
- [ ] Remote config endpoint working
- [ ] Error handling implemented

### ✅ App Store Requirements
- [ ] App icon (512x512px)
- [ ] Feature graphic (1024x500px)
- [ ] Screenshots (phone & tablet)
- [ ] Privacy policy URL
- [ ] Content rating completed
- [ ] Target audience set

---

## 🛠️ Build Process

### 1. Environment Setup
```bash
# Navigate to frontend directory
cd /home/daniel/websites/sante-initiative/frontend

# Install EAS CLI (if not installed)
npm install -g @expo/eas-cli

# Login to Expo account
eas login
```

### 2. Configure app.json
```json
{
  "expo": {
    "name": "Santé Initiative",
    "slug": "sante-initiative",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.santeinitiative.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.santeinitiative.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-font"
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 3. Build AAB for Play Store
```bash
# Run the build script
./build-aab.sh

# Or build manually
eas build --platform android --profile production
```

---

## 🔄 Remote Configuration System

### 📡 What Can Be Updated Remotely

**✅ API Configuration:**
- Backend URL changes
- Emergency server switches
- Connection timeouts

**✅ Feature Toggles:**
- Enable/disable payments
- Enable/disable referrals  
- Enable/disable stock management
- Enable/disable reports

**✅ App Behavior:**
- Maintenance mode
- Force update requirements
- Welcome messages
- Error messages

### 🛠️ Remote Config API

**Get Current Config:**
```bash
GET https://sante-initiative.vercel.app/api/remote-config
```

**Update Config (Admin):**
```bash
PATCH https://sante-initiative.vercel.app/api/remote-config
{
  "apiBaseUrl": "https://new-server.com/api",
  "maintenanceMode": true,
  "features": {
    "paymentsEnabled": false
  }
}
```

**Emergency URL Update:**
```bash
POST https://sante-initiative.vercel.app/api/remote-config/emergency-url
{
  "apiBaseUrl": "https://emergency-server.com/api"
}
```

---

## 📱 Play Store Upload Process

### 1. Prepare Assets
- **App Icon:** 512x512px PNG
- **Feature Graphic:** 1024x500px PNG  
- **Screenshots:** Minimum 2, maximum 8
- **Privacy Policy:** Hosted on your website

### 2. Google Play Console Setup
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing
3. Complete store listing:
   - App name: "Santé Initiative"
   - Short description: 80 characters max
   - Full description: 4000 characters max
   - Category: Health & Fitness > Medical
   - Content rating: Complete questionnaire

### 3. Upload AAB
1. Download AAB from build link
2. Go to "Release" > "Production" > "Create new release"
3. Upload AAB file
4. Add release notes
5. Review and roll out

---

## 🔧 Post-Deployment Management

### 📊 Monitoring
- Check crash reports in Google Play Console
- Monitor API performance on Vercel
- Track user analytics
- Watch error logs

### 🔄 Updates Without New Releases

**Change API Server:**
```javascript
// Update via remote config API
PATCH /api/remote-config
{
  "apiBaseUrl": "https://new-api-server.com/api"
}
```

**Disable Features:**
```javascript
// Disable payments temporarily
PATCH /api/remote-config  
{
  "features": {
    "paymentsEnabled": false
  }
}
```

**Maintenance Mode:**
```javascript
// Put app in maintenance
PATCH /api/remote-config
{
  "maintenanceMode": true,
  "messages": {
    "maintenance": "System upgrade in progress. Back in 2 hours."
  }
}
```

**Force Update:**
```javascript
// Force users to update
PATCH /api/remote-config
{
  "forceUpdateVersion": "1.1.0",
  "messages": {
    "updateRequired": "Please update to latest version for new features."
  }
}
```

---

## 🚨 Emergency Procedures

### Server Downtime
1. Update API URL via emergency endpoint
2. Enable maintenance mode
3. Notify users via app message

### Critical Bug Fix
1. Fix backend issue on Vercel
2. Update remote config if needed
3. Force update if app changes required

### Security Issue
1. Disable affected features via remote config
2. Put app in maintenance mode
3. Deploy fix, then re-enable

---

## 📈 Best Practices

### ✅ Do's
- Test remote config changes in staging first
- Always have rollback plan
- Monitor app performance after updates
- Keep users informed about changes

### ❌ Don'ts
- Don't change database schema via remote config
- Don't disable critical features without notice
- Don't forget to test emergency procedures
- Don't ignore user feedback after updates

---

## 🎯 Success Metrics

### Technical
- [ ] AAB builds successfully
- [ ] App installs from Play Store
- [ ] Remote config updates work
- [ ] API calls to production work

### User Experience  
- [ ] App loads quickly
- [ ] All features work as expected
- [ ] Error handling is graceful
- [ ] Updates are smooth

### Business
- [ ] User adoption increases
- [ ] Support requests decrease
- [ ] App ratings improve
- [ ] Feature usage grows

---

## 🆘 Support

### Common Issues
**Build Fails:** Check environment variables and app.json
**API Errors:** Verify Vercel deployment and remote config
**Store Rejection:** Check content rating and permissions

### Get Help
- Expo documentation: https://docs.expo.dev
- Google Play Console: https://support.google.com/googleplay/android-developer
- Remote config issues: Check backend logs

---

**🎉 Your app is ready for Play Store deployment!** 

**Remember: Remote configuration gives you the power to update the app without releasing new versions!** 🚀
