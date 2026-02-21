# Google Play Store Deployment Guide

## ✅ Backend Deployed to Heroku
- **URL**: https://sante-production-app-42dca70009b0.herokuapp.com
- **Status**: Live and running
- **Database**: PostgreSQL (Neon)
- **Health Check**: https://sante-production-app-42dca70009b0.herokuapp.com/api/health

## ✅ Frontend Updated
- Frontend now points to Heroku backend
- All API calls will use production URL

## 📱 Build Android App for Google Play

### Prerequisites
1. EAS CLI installed: `npm install -g eas-cli`
2. Expo account logged in: `eas login`
3. Google Play Console account

### Step 1: Build Production APK/AAB

```bash
cd frontend

# Build for Google Play Store (AAB format)
eas build --platform android --profile production

# This will:
# - Create an optimized Android App Bundle (.aab)
# - Sign it with your credentials
# - Upload to EAS servers
# - Provide download link
```

### Step 2: Download the Build

After build completes (10-20 minutes):
- You'll get a download link
- Download the `.aab` file
- This is what you upload to Google Play Console

### Step 3: Google Play Console Setup

1. **Go to**: https://play.google.com/console
2. **Create App**:
   - App name: "Santé Initiative Uganda"
   - Default language: English
   - App type: App
   - Free or Paid: Free

3. **App Details**:
   - Short description (80 chars max)
   - Full description (4000 chars max)
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots: At least 2 (phone)

4. **Content Rating**:
   - Fill out questionnaire
   - Health app category

5. **Target Audience**:
   - Age groups
   - Privacy policy URL (required)

6. **Privacy Policy**:
   - Host your PRIVACY_POLICY.md online
   - Or use GitHub Pages

7. **Upload AAB**:
   - Go to "Production" → "Create new release"
   - Upload your `.aab` file
   - Add release notes
   - Review and rollout

### Step 4: App Information Required

Update `app.json` with complete info:

```json
{
  "expo": {
    "name": "Santé Initiative Uganda",
    "slug": "sante-initiative",
    "version": "1.0.2",
    "android": {
      "package": "com.sante.initiative",
      "versionCode": 3,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

## 🔑 Signing Credentials

EAS handles signing automatically. To manage credentials:

```bash
# View credentials
eas credentials

# Configure credentials
eas credentials --platform android
```

## 📊 Testing Before Submission

### Internal Testing
```bash
# Build for internal testing
eas build --platform android --profile preview

# Share with testers
eas submit --platform android --track internal
```

### Closed Testing
- Add testers in Google Play Console
- Create closed testing track
- Get feedback before public release

## 🚀 Quick Build Command

```bash
cd /home/daniel/websites/sante-initiative/frontend
eas build --platform android --profile production
```

## 📝 Checklist Before Submission

- [ ] Backend deployed and tested on Heroku
- [ ] Frontend points to production backend
- [ ] App icon and splash screen ready
- [ ] Privacy policy hosted online
- [ ] Screenshots prepared (2-8 images)
- [ ] Feature graphic created (1024x500)
- [ ] App description written
- [ ] Content rating completed
- [ ] Target audience defined
- [ ] AAB file built and downloaded
- [ ] Tested on physical device

## 🔗 Important Links

- **Backend**: https://sante-production-app-42dca70009b0.herokuapp.com
- **EAS Builds**: https://expo.dev/accounts/[your-account]/projects/sante-initiative/builds
- **Google Play Console**: https://play.google.com/console
- **Privacy Policy**: /frontend/PRIVACY_POLICY.md

## 📱 App Store Listing Info

**App Name**: Santé Initiative Uganda

**Short Description** (80 chars):
Vision health screening and eyewear distribution for rural Uganda

**Category**: Medical

**Tags**: health, vision, screening, eyewear, Uganda, healthcare

## 🎯 Next Steps

1. Run: `cd frontend && eas build --platform android --profile production`
2. Wait for build to complete (~15 minutes)
3. Download the AAB file
4. Upload to Google Play Console
5. Complete store listing
6. Submit for review

## ⚠️ Important Notes

- First review takes 3-7 days
- Updates take 1-3 days
- Keep version numbers incremented
- Test thoroughly before each release
- Monitor crash reports in Play Console
