# Deploying Santé Initiative App to Google Play Store

## Step 1: Deploy Backend to Production

### Option A: Deploy to AWS EC2 (Recommended)

#### 1. Launch EC2 Instance
```bash
# Choose Ubuntu Server 22.04 LTS
# Instance type: t2.micro (free tier) or t2.small
# Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API)
```

#### 2. Connect and Setup Server
```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

#### 3. Upload Backend Code
```bash
# On your local machine
cd /home/daniel/websites/sante-initiative/backend
tar -czf backend.tar.gz .

# Upload to server
scp -i your-key.pem backend.tar.gz ubuntu@your-ec2-ip:~/

# On server
mkdir -p ~/sante-backend
cd ~/sante-backend
tar -xzf ~/backend.tar.gz
npm install --production
```

#### 4. Setup Environment Variables
```bash
# On server
nano .env
```

Add:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_PATH=/home/ubuntu/sante-backend/sante.db
```

#### 5. Start Backend with PM2
```bash
pm2 start src/index.js --name sante-api
pm2 save
pm2 startup
```

#### 6. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/sante-api
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 IP

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sante-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL (Optional but Recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option B: Deploy to Heroku (Easier)

#### 1. Install Heroku CLI
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

#### 2. Prepare Backend
```bash
cd /home/daniel/websites/sante-initiative/backend

# Create Procfile
echo "web: node src/index.js" > Procfile

# Update package.json
```

Add to package.json:
```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node src/index.js"
  }
}
```

#### 3. Deploy
```bash
# Initialize git if not already
git init
git add .
git commit -m "Prepare for Heroku deployment"

# Create Heroku app
heroku create sante-initiative-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-key

# Deploy
git push heroku master

# Check logs
heroku logs --tail
```

Your API will be at: `https://sante-initiative-api.herokuapp.com/api`

---

## Step 2: Update Frontend API URL

### Update API Configuration

Edit: `/home/daniel/websites/sante-initiative/frontend/src/services/api.ts`

```typescript
// Production API URL
const API_BASE_URL = __DEV__ 
  ? "http://10.0.2.2:5000/api"  // Development (Android emulator)
  : "https://your-domain.com/api";  // Production (your deployed backend)

// Or if using Heroku:
const API_BASE_URL = __DEV__ 
  ? "http://10.0.2.2:5000/api"
  : "https://sante-initiative-api.herokuapp.com/api";
```

---

## Step 3: Prepare App for Play Store

### 1. Update App Configuration

Edit: `frontend/app.json`
```json
{
  "expo": {
    "name": "Santé Initiative Uganda",
    "slug": "sante-initiative",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "package": "com.santeinitiative.uganda",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 2. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 3. Configure EAS Build

```bash
cd /home/daniel/websites/sante-initiative/frontend
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 4. Build APK/AAB for Play Store

#### For Testing (APK):
```bash
eas build --platform android --profile preview
```

#### For Production (AAB - required by Play Store):
```bash
eas build --platform android --profile production
```

This will:
- Build your app in the cloud
- Generate a signed AAB file
- Provide download link

---

## Step 4: Upload to Google Play Store

### 1. Create Google Play Console Account
- Go to: https://play.google.com/console
- Pay one-time $25 registration fee
- Complete account setup

### 2. Create New App
- Click "Create app"
- Fill in app details:
  - App name: "Santé Initiative Uganda"
  - Default language: English
  - App type: App
  - Free or paid: Free

### 3. Complete Store Listing

**App Details:**
- Short description (80 chars):
  ```
  Mobile health app for VHT eye screening and glasses distribution in Uganda
  ```

- Full description (4000 chars):
  ```
  Santé Initiative Uganda is a comprehensive mobile health application designed to support Village Health Teams (VHTs) in providing eye care services across Uganda.

  KEY FEATURES:
  • VHT Eye Screening - Complete 6-step eye examination protocol
  • Inventory Management - Track glasses stock by power and frame type
  • Payment Tracking - Manage cash and hire-purchase payments
  • Client Management - Maintain records of all screened clients
  • Referral System - Create and track referrals to health facilities
  • Offline Support - Work without internet, sync when online
  • Multi-language - English and Luganda support

  FOR HEALTH WORKERS:
  - Conduct standardized eye screenings
  - Recommend appropriate glasses
  - Track sales and revenue
  - Manage client payments
  - Generate reports

  FOR OUTLETS:
  - Manage glasses inventory
  - Process orders
  - Track sales

  FOR VSLAs:
  - Group management
  - Financial tracking
  - Member records

  This app helps bring quality eye care services closer to communities across Uganda.
  ```

- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (at least 2, up to 8)
  - Phone: 16:9 or 9:16 ratio
  - Minimum dimension: 320px
  - Maximum dimension: 3840px

**Categorization:**
- App category: Medical
- Tags: health, eye care, medical, screening

**Contact Details:**
- Email: support@santeinitiative.org
- Phone: +256...
- Website: https://santeinitiative.org

**Privacy Policy:**
- Required! Host at: https://your-domain.com/privacy-policy
- Or use: https://www.freeprivacypolicy.com/

### 4. Upload App Bundle

**Production Track:**
- Go to "Production" → "Create new release"
- Upload the AAB file from EAS build
- Add release notes:
  ```
  Initial release of Santé Initiative Uganda app
  
  Features:
  - VHT Eye Screening workflow
  - Inventory management
  - Payment tracking
  - Referral system
  - Offline support
  - English and Luganda languages
  ```

### 5. Content Rating
- Complete questionnaire
- Select "Medical" category
- Answer questions about app content

### 6. Target Audience
- Target age: 18+
- Appeal to children: No

### 7. App Content
- Privacy policy URL
- Ads: No (if you don't have ads)
- In-app purchases: No (if you don't have)
- Data safety: Complete form about data collection

### 8. Submit for Review
- Review all sections (must be green checkmarks)
- Click "Submit for review"
- Wait 1-7 days for approval

---

## Step 5: Testing Before Submission

### Internal Testing
```bash
# Create internal testing track
# Upload APK/AAB
# Add testers (up to 100 email addresses)
# Share testing link
```

### Closed Testing (Beta)
```bash
# Create closed testing track
# Upload APK/AAB
# Add testers or create Google Group
# Get feedback before production
```

---

## Checklist Before Submission

### Backend
- [ ] Backend deployed and accessible
- [ ] Database initialized with sample data
- [ ] API endpoints tested and working
- [ ] SSL certificate installed (HTTPS)
- [ ] Environment variables configured
- [ ] PM2/process manager running
- [ ] Backup strategy in place

### Frontend
- [ ] API URL updated to production
- [ ] App tested with production backend
- [ ] All features working
- [ ] No console errors
- [ ] Offline mode tested
- [ ] Language switching tested
- [ ] App icon and splash screen ready
- [ ] Screenshots taken (at least 2)

### Play Store
- [ ] Google Play Console account created
- [ ] App created in console
- [ ] Store listing completed
- [ ] Privacy policy URL provided
- [ ] Content rating completed
- [ ] AAB file built and ready
- [ ] Release notes written

---

## Quick Commands Summary

### Deploy Backend (AWS EC2)
```bash
# On server
pm2 start src/index.js --name sante-api
pm2 save
sudo systemctl restart nginx
```

### Build App (EAS)
```bash
# In frontend directory
eas build --platform android --profile production
```

### Check Backend Status
```bash
pm2 status
pm2 logs sante-api
```

### Update App
```bash
# Make changes
eas build --platform android --profile production
# Upload new AAB to Play Store
```

---

## Estimated Timeline

- Backend deployment: 2-4 hours
- App build and testing: 1-2 hours
- Play Store setup: 2-3 hours
- Review process: 1-7 days

**Total: ~1 week from start to published**

---

## Costs

- AWS EC2 t2.micro: Free tier (1 year) or ~$10/month
- Heroku: Free tier or $7/month
- Google Play Console: $25 one-time
- Domain name (optional): ~$12/year
- SSL certificate: Free (Let's Encrypt)

**Total: $25-50 to get started**

---

## Support & Monitoring

### Monitor Backend
```bash
# Check logs
pm2 logs sante-api

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart sante-api
```

### Monitor App
- Google Play Console → Statistics
- Track installs, crashes, ratings
- Respond to user reviews

---

## Next Steps After Publishing

1. **Marketing:**
   - Share with VHT networks
   - Contact health organizations
   - Social media promotion

2. **Updates:**
   - Fix bugs based on user feedback
   - Add new features
   - Regular updates every 2-4 weeks

3. **Support:**
   - Respond to Play Store reviews
   - Provide email support
   - Create user documentation

---

## Need Help?

- EAS Build: https://docs.expo.dev/build/introduction/
- Play Store: https://support.google.com/googleplay/android-developer
- AWS EC2: https://docs.aws.amazon.com/ec2/
- Heroku: https://devcenter.heroku.com/

Good luck with your launch! 🚀
