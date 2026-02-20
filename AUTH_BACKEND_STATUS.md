# Auth Screens - Backend Integration Status

## ❌ Current Status: NOT Connected to Backend

Your auth screens are currently using **MOCK data** and not sending to the real backend.

## Files That Need Updating

### 1. RoleLoginScreen.tsx
**Current:** Uses mock `OTPService.generateOTP()`  
**Needs:** Use `apiService.login(phoneNumber)`

**Fix:**
```typescript
// Replace OTPService with:
import { apiService } from "../../services/api";

const handleSendOTP = async () => {
  const fullPhone = `0${phone.replace(/\s/g, "")}`;
  const result = await apiService.login(fullPhone);
  
  if (result.success) {
    Alert.alert("OTP Sent", `Your OTP: ${result.otp}`, [
      { text: "OK", onPress: () => navigation.navigate("OTP", { phone: fullPhone, role }) }
    ]);
  }
};
```

### 2. OTPScreen.tsx
**Current:** Uses mock `OTPService.verifyOTP()`  
**Needs:** Use `apiService.verifyOTP(phone, otp, registrationData)`

**Fix:**
```typescript
import { apiService } from "../../services/api";

const handleVerifyOTP = async () => {
  const otpString = otp.join("");
  const result = await apiService.verifyOTP(phone, otpString);
  
  if (result.success) {
    navigation.navigate("AppTabs", { role });
  }
};
```

### 3. CHWRegistrationStep4.tsx
**Current:** No backend call  
**Needs:** Send all registration data to backend

**Fix:**
```typescript
const handleComplete = async () => {
  const registrationData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    gender: formData.gender,
    nationalId: formData.nationalId,
    dateOfBirth: formData.dateOfBirth,
    role: "health_worker",
    village: formData.village,
    parish: formData.parish,
    subCounty: formData.subCounty,
    district: formData.district,
    region: formData.region,
    organizationName: formData.organizationName,
    registrationNumber: formData.registrationNumber,
    yearsOfExperience: formData.yearsOfExperience,
    trainingCertificate: formData.trainingCertificate,
  };

  const result = await apiService.verifyOTP(phoneNumber, otp, registrationData);
  
  if (result.success) {
    navigation.navigate("CHWDashboard");
  }
};
```

### 4. VSLARegistrationStep4.tsx
**Current:** No backend call  
**Needs:** Same as CHW but with `role: "vsla"`

### 5. OutletRegistrationStep4.tsx
**Current:** No backend call  
**Needs:** Same as CHW but with `role: "outlet"`

## Quick Fix Script

Run this to update all auth screens at once:

```bash
# 1. Update RoleLoginScreen
sed -i 's/OTPService.generateOTP/apiService.login/g' frontend/src/screens/auth/RoleLoginScreen.tsx

# 2. Update OTPScreen  
sed -i 's/OTPService.verifyOTP/apiService.verifyOTP/g' frontend/src/screens/auth/OTPScreen.tsx

# 3. Add import to all auth screens
find frontend/src/screens/auth -name "*.tsx" -exec sed -i '1i import { apiService } from "../../services/api";' {} \;
```

## What Happens Now

### ❌ Without Backend Connection:
- Login sends OTP → **Goes nowhere**
- OTP verification → **Fake success**
- Registration → **Data not saved**
- User data → **Not in database**

### ✅ With Backend Connection:
- Login sends OTP → **Saved in database**
- OTP verification → **Checked against database**
- Registration → **User created in database**
- User data → **Persisted and retrievable**

## Test Backend Connection

1. **Start backend:**
   ```bash
   cd backend
   node src/index.js
   ```

2. **Test login endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"0700123456"}'
   ```

3. **Should return:**
   ```json
   {
     "success": true,
     "message": "OTP sent successfully",
     "phoneNumber": "0700123456",
     "otp": "123456"
   }
   ```

## Priority Actions

1. ✅ **Backend is ready** - All endpoints work
2. ✅ **API service is ready** - All methods implemented
3. ❌ **Auth screens need update** - Still using mocks
4. ❌ **Registration screens need update** - Not sending data

## Next Steps

1. Update `RoleLoginScreen.tsx` to use `apiService.login()`
2. Update `OTPScreen.tsx` to use `apiService.verifyOTP()`
3. Update all 3 registration Step4 screens to send data
4. Test complete flow: Login → OTP → Register → Dashboard
5. Verify data appears in database

**Estimated time:** 30 minutes to update all auth screens

Would you like me to update these files now?
