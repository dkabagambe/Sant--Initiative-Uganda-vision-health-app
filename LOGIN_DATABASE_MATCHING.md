# Login Flow - Database User Matching ✅

## How It Works Now

### 1. User Enters Phone Number
```
Login Screen
    ↓
User enters: 0700123456
    ↓
Clicks "Continue"
```

### 2. Backend Sends OTP
```
POST /api/auth/login
Body: { phoneNumber: "0700123456" }
    ↓
Backend checks if user exists in database
    ↓
Generates OTP: 123456
    ↓
Stores in users table with expiry
    ↓
Returns: { success: true, otp: "123456" }
```

### 3. User Enters OTP
```
OTP Screen
    ↓
User enters: 1 2 3 4 5 6
    ↓
Clicks "Verify" or auto-submits
```

### 4. Backend Verifies & Returns User Data
```
POST /api/auth/verify-otp
Body: { phoneNumber: "0700123456", otp: "123456" }
    ↓
Backend queries database:
SELECT * FROM users 
WHERE phone_number = '0700123456' 
AND otp_code = '123456'
AND otp_expires_at > datetime('now')
    ↓
Returns complete user data:
{
  success: true,
  token: "jwt_token_here",
  user: {
    id: "B7B5C0E1921DF64ED91C21AB6B592E5A",
    phoneNumber: "0700123456",
    fullName: "Jane Nambi",
    firstName: "Jane",
    lastName: "Nambi",
    role: "health_worker",
    village: "Bombo Village",
    district: "Luweero"
  }
}
```

### 5. Frontend Stores User Data
```
OTP Screen receives response
    ↓
Stores user data in AsyncStorage:
await AsyncStorage.setItem("user", JSON.stringify(result.user))
    ↓
Navigates to dashboard with role
```

### 6. Dashboard Loads User Data
```
CHWDashboard loads
    ↓
useEffect runs loadUserData()
    ↓
const user = await apiService.getCurrentUser()
    ↓
Reads from AsyncStorage
    ↓
setUserData(user)
    ↓
UI updates with:
- Welcome, Jane Nambi
- Luweero District
- VHT - Luweero (in header)
```

## Code Flow

### Frontend (OTPScreen.tsx)
```typescript
const handleVerifyOTP = async () => {
  const otpString = otp.join("");
  
  // Call backend
  const result = await apiService.verifyOTP(phone, otpString);
  
  if (result.success && result.user) {
    // Store complete user data from database
    await apiService.storeUserData(result.user);
    
    // Navigate with user's actual role
    navigation.navigate("AppTabs", { role: result.user.role });
  }
};
```

### API Service (api.ts)
```typescript
async verifyOTP(phoneNumber: string, otp: string) {
  const response = await api.post("/auth/verify-otp", {
    phoneNumber,
    otp
  });
  return response.data;
}

async storeUserData(userData: any) {
  await AsyncStorage.setItem("user", JSON.stringify(userData));
}

async getCurrentUser() {
  const userData = await AsyncStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}
```

### Backend (authController.js)
```javascript
exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  // Verify OTP
  const user = await sql`
    SELECT * FROM users 
    WHERE phone_number = ${phoneNumber} 
    AND otp_code = ${otp}
    AND otp_expires_at > datetime('now')
  `;
  
  if (user.length === 0) {
    return res.status(401).json({ 
      success: false, 
      error: "Invalid or expired OTP" 
    });
  }
  
  // Clear OTP and update last login
  await sql`
    UPDATE users SET
      otp_code = NULL,
      otp_expires_at = NULL,
      last_login = datetime('now')
    WHERE phone_number = ${phoneNumber}
  `;
  
  // Return user data
  res.json({
    success: true,
    token: jwt.sign({ userId: user[0].id, ... }),
    user: {
      id: user[0].id,
      phoneNumber: user[0].phone_number,
      fullName: user[0].full_name,
      firstName: user[0].first_name,
      lastName: user[0].last_name,
      role: user[0].role,
      village: user[0].village,
      district: user[0].district
    }
  });
};
```

## Test Login

### Jane Nambi (CHW)
```
Phone: 0700123456
OTP: 123456
Expected Result:
- Welcome, Jane Nambi
- Luweero District
- Role: health_worker
```

### Database Query
```sql
SELECT phone_number, full_name, district, role, otp_code 
FROM users 
WHERE phone_number = '0700123456';

Result:
0700123456 | Jane Nambi | Luweero | health_worker | 123456
```

## User Data Flow

```
┌─────────────────────────────────────────────────┐
│  1. Login Screen                                │
│  Enter: 0700123456                              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Backend: Generate OTP                       │
│  Query: SELECT * FROM users                     │
│         WHERE phone_number = '0700123456'       │
│  Store: otp_code = '123456'                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. OTP Screen                                  │
│  Enter: 1 2 3 4 5 6                             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. Backend: Verify & Fetch User               │
│  Query: SELECT * FROM users                     │
│         WHERE phone_number = '0700123456'       │
│         AND otp_code = '123456'                 │
│  Return: Full user object                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  5. Frontend: Store User Data                   │
│  AsyncStorage.setItem("user", {                 │
│    fullName: "Jane Nambi",                      │
│    district: "Luweero",                         │
│    role: "health_worker",                       │
│    ...                                          │
│  })                                             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  6. Dashboard: Display User Data                │
│  Welcome, Jane Nambi                            │
│  Luweero District                               │
│  All stats for this user                        │
└─────────────────────────────────────────────────┘
```

## ✅ Complete

- Phone number entered on login matches database user
- OTP verification fetches complete user profile
- User data stored locally in AsyncStorage
- Dashboard displays user's actual name and district
- All stats filtered by user's ID from database
