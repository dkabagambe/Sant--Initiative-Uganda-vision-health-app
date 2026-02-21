# Login Fix - User Data Display ✅

## Issue
Dashboard was showing "User" and "District" instead of actual user name and district from database.

## Root Cause
Backend was returning camelCase keys (`fullName`, `firstName`) but frontend expected snake_case keys (`full_name`, `first_name`).

## Fix Applied

### Backend (authController.js)
Changed response keys from camelCase to snake_case:

**Before:**
```javascript
user: {
  id: userData.id,
  phoneNumber: userData.phone_number,  // ❌ camelCase
  fullName: userData.full_name,        // ❌ camelCase
  firstName: userData.first_name,      // ❌ camelCase
  lastName: userData.last_name,        // ❌ camelCase
  role: userData.role,
  village: userData.village,
  district: userData.district,
}
```

**After:**
```javascript
user: {
  id: userData.id,
  phone_number: userData.phone_number,  // ✅ snake_case
  full_name: userData.full_name,        // ✅ snake_case
  first_name: userData.first_name,      // ✅ snake_case
  last_name: userData.last_name,        // ✅ snake_case
  role: userData.role,
  village: userData.village,
  district: userData.district,
}
```

### Frontend (OTPScreen.tsx)
Added console logs for debugging:
```typescript
const result = await apiService.verifyOTP(phone, otpString);
console.log("OTP verification result:", result);
console.log("Storing user data:", result.user);
```

### Frontend (CHWDashboard.tsx)
Added console log to verify data loading:
```typescript
const user = await apiService.getCurrentUser();
console.log("Loaded user data:", user);
```

## Test Result

### API Response (Verified)
```bash
curl -X POST http://20.20.42.133:5000/api/auth/verify-otp \
  -d '{"phoneNumber":"0700123456","otp":"123456"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "id": "B7B5C0E1921DF64ED91C21AB6B592E5A",
    "phone_number": "0700123456",
    "full_name": "Jane Nambi",
    "first_name": "Jane",
    "last_name": "Nambi",
    "role": "health_worker",
    "village": "Kasana",
    "district": "Luweero"
  }
}
```

## Expected Dashboard Display

### Header
```
Jane Nambi
VHT - Luweero District
```

### Welcome Section
```
Welcome, Jane Nambi
Luweero District

Ready to screen today?
```

## Data Flow (Fixed)

```
1. User enters phone: 0700123456
2. User enters OTP: 123456
3. Backend verifies and returns:
   {
     user: {
       full_name: "Jane Nambi",  ✅ snake_case
       district: "Luweero"
     }
   }
4. Frontend stores in AsyncStorage
5. Dashboard loads:
   userData?.full_name → "Jane Nambi" ✅
   userData?.district → "Luweero" ✅
```

## Test Login Credentials

**Phone:** 0700123456  
**OTP:** 123456 (valid for 1 hour)  
**Expected Name:** Jane Nambi  
**Expected District:** Luweero  
**Expected Role:** health_worker  

## Verification Steps

1. Open app
2. Enter phone: 0700123456
3. Click Continue
4. Enter OTP: 123456
5. Dashboard should show:
   - Header: "Jane Nambi" and "VHT - Luweero District"
   - Welcome: "Welcome, Jane Nambi" and "Luweero District"
   - Stats: All Jane's data (28 screenings, 20 glasses, etc.)

## Console Logs to Check

When you log in, check the console for:
```
OTP verification result: { success: true, user: { full_name: "Jane Nambi", ... } }
Storing user data: { full_name: "Jane Nambi", district: "Luweero", ... }
Loaded user data: { full_name: "Jane Nambi", district: "Luweero", ... }
```

If you see `full_name: "Jane Nambi"` in the logs, the data is correct!

## ✅ Fixed
Backend now returns snake_case keys that match what the frontend expects. User name and district should display correctly.
