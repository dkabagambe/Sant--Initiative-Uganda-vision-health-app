# Quick API Fix for Login Issues

## Problem: App can't connect to server after Vercel migration

## Solution: Update API URL in your app

### Method 1: Use Remote Config (if your app has it)
1. Open your app
2. Look for "Settings" or "Configuration" 
3. Enter this URL: `https://backend-tau-sepia-43.vercel.app/api`
4. Save

### Method 2: Manual Update (if needed)
The app needs to be pointed to the new Vercel backend instead of the old Render backend.

### Current Working Backend URL:
```
https://backend-tau-sepia-43.vercel.app/api
```

### Test Connection:
You can test this URL works by visiting:
```
https://backend-tau-sepia-43.vercel.app/api/health
```

### If you still can't login:
1. Make sure your app is using the Vercel URL above
2. Clear app cache/data and restart
3. Reinstall the app if needed

The backend is working perfectly - just need to update the API URL in your app!
