# Screens Updated to Use Dynamic Data

## ✅ Completed Updates

### 1. CHWDashboardScreen.tsx
**Changes:**
- Added `useState` and `useEffect` hooks
- Loads dashboard stats from `apiService.getDashboardStats()`
- Displays real user name and statistics
- Shows loading state while fetching data
- Auto-refreshes on mount

**Dynamic Data:**
- `screenings_this_week` - from database
- `clients_needing_glasses` - from database
- User name and village - from auth

### 2. InventoryScreen.tsx
**Changes:**
- Loads inventory from `apiService.getInventorySummary()`
- Maps products with frame breakdown (standard, metal, fashion)
- Auto-calculates stock status (normal, low, critical)
- Pull-to-refresh functionality
- Loading state

**Dynamic Data:**
- All products with stock quantities
- Frame type breakdown per product
- Total inventory counts

### 3. PaymentsScreen.tsx
**Changes:**
- Loads payments from `apiService.getPayments()`
- Filters by status (pending/completed)
- Search functionality
- Pull-to-refresh
- Loading state

**Dynamic Data:**
- All payment records
- Client names and phone numbers
- Payment status and amounts
- Transaction IDs

## 🔄 Screens That Need Similar Updates

### High Priority (Core Features)

#### 4. ReferralsScreen.tsx
**Location:** `frontend/src/screens/chw/ReferralsScreen.tsx`

**Required Changes:**
```typescript
import { apiService } from "../../services/api";

const [referrals, setReferrals] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadReferrals();
}, []);

const loadReferrals = async () => {
  const response = await apiService.getReferrals();
  if (response.success) {
    setReferrals(response.data);
  }
};
```

#### 5. ReportsScreen.tsx
**Location:** `frontend/src/screens/chw/ReportsScreen.tsx`

**Required Changes:**
```typescript
const loadReports = async () => {
  const response = await apiService.getReports(reportType, startDate, endDate);
  if (response.success) {
    setReportData(response.data);
  }
};
```

#### 6. MyClientsScreen.tsx
**Location:** `frontend/src/screens/chw/MyClientsScreen.tsx`

**Required Changes:**
```typescript
const loadClients = async () => {
  const response = await apiService.getClients();
  if (response.success) {
    setClients(response.data);
  }
};
```

### Registration Screens

#### 7. CHWRegistrationStep4.tsx
**Location:** `frontend/src/screens/auth/CHWRegistrationStep4.tsx`

**Required Changes:**
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

  const response = await apiService.verifyOTP(
    phoneNumber,
    otp,
    registrationData
  );

  if (response.success) {
    navigation.navigate("CHWDashboard");
  }
};
```

#### 8. VSLARegistrationStep4.tsx
**Location:** `frontend/src/screens/auth/VSLARegistrationStep4.tsx`

**Required Changes:**
Similar to CHW but with `role: "vsla"` and VSLA-specific fields.

#### 9. OutletRegistrationStep4.tsx
**Location:** `frontend/src/screens/auth/OutletRegistrationStep4.tsx`

**Required Changes:**
Similar to CHW but with `role: "outlet"` and outlet-specific fields.

### Screening Workflow

#### 10. VisionScreen6.tsx (Final Step)
**Location:** `frontend/src/screens/screening/VisionScreen6.tsx`

**Required Changes:**
```typescript
const handleComplete = async () => {
  const screeningData = {
    clientName: clientInfo.name,
    clientPhone: clientInfo.phone,
    clientAge: clientInfo.age,
    clientGender: clientInfo.gender,
    clientVillage: clientInfo.village,
    distanceVisionLeft: visionTests.distanceLeft,
    distanceVisionRight: visionTests.distanceRight,
    distanceVisionBoth: visionTests.distanceBoth,
    nearVisionResult: visionTests.near,
    pinholeTestLeft: visionTests.pinholeLeft,
    pinholeTestRight: visionTests.pinholeRight,
    needsGlasses: results.needsGlasses,
    needsReferral: results.needsReferral,
    referralReason: results.referralReason,
    recommendedProductId: selectedProduct?.id,
    recommendedPower: selectedProduct?.power,
    selectedFrameType: selectedFrameType,
    notes: additionalNotes,
  };

  const response = await apiService.createScreening(screeningData);
  
  if (response.success) {
    Alert.alert("Success", "Screening saved successfully");
    navigation.navigate("CHWDashboard");
  }
};
```

## 📋 Update Pattern (Copy-Paste Template)

For any screen with static data, follow this pattern:

### 1. Add Imports
```typescript
import { useState, useEffect } from "react";
import { ActivityIndicator, RefreshControl } from "react-native";
import { apiService } from "../../services/api";
```

### 2. Add State
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
```

### 3. Add Load Function
```typescript
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const response = await apiService.getYourData();
    if (response.success) {
      setData(response.data);
    }
  } catch (error) {
    console.error("Failed to load:", error);
    Alert.alert("Error", "Failed to load data");
  } finally {
    setLoading(false);
  }
};

const onRefresh = async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
};
```

### 4. Add Loading UI
```typescript
if (loading) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}
```

### 5. Add Pull-to-Refresh
```typescript
<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
```

### 6. Replace Static Data
```typescript
// Before:
const staticData = [{ id: 1, name: "Test" }];

// After:
{data.map((item) => (
  <YourComponent key={item.id} {...item} />
))}
```

## 🎯 Priority Order

1. ✅ **CHWDashboardScreen** - DONE
2. ✅ **InventoryScreen** - DONE
3. ✅ **PaymentsScreen** - DONE
4. **ReferralsScreen** - Next
5. **ReportsScreen** - Next
6. **MyClientsScreen** - Next
7. **VisionScreen6** (screening submission) - Critical
8. **CHWRegistrationStep4** - Important
9. **VSLARegistrationStep4** - Important
10. **OutletRegistrationStep4** - Important

## 🧪 Testing Checklist

After updating each screen:

- [ ] Screen loads without errors
- [ ] Loading state shows correctly
- [ ] Data displays from database
- [ ] Pull-to-refresh works
- [ ] Error handling works (try with backend off)
- [ ] Empty state shows when no data
- [ ] Search/filter works (if applicable)
- [ ] Navigation works correctly

## 📝 Common Issues & Solutions

### Issue: "Cannot read property 'map' of undefined"
**Solution:** Initialize state as empty array: `useState([])`

### Issue: "Network request failed"
**Solution:** Check API_BASE_URL in `api.ts` matches your setup

### Issue: Data not updating
**Solution:** Add `useEffect` dependency array or call `loadData()` on focus

### Issue: Token expired
**Solution:** Implement token refresh or re-login flow

## 🚀 Quick Start

1. Start backend: `cd backend && ./start.sh`
2. Update API_BASE_URL in `frontend/src/services/api.ts`
3. Update screens one by one using the pattern above
4. Test each screen after updating
5. Commit changes after each working screen

## 📚 API Methods Available

```typescript
// Auth
apiService.login(phoneNumber)
apiService.verifyOTP(phoneNumber, otp, registrationData)
apiService.getCurrentUser()

// Dashboard
apiService.getDashboardStats()
apiService.getInventorySummary()
apiService.getReports(type, startDate, endDate)
apiService.getClients()

// Screenings
apiService.createScreening(data)
apiService.getScreenings()
apiService.getScreeningStats()

// Payments
apiService.createPayment(data)
apiService.getPayments()
apiService.getPaymentStats()
apiService.updatePaymentStatus(id, status)

// Referrals
apiService.createReferral(data)
apiService.getReferrals(status)
apiService.getReferralStats()
apiService.updateReferralStatus(id, status, notes)

// Products
apiService.getProducts()
apiService.updateProductStock(id, change, frameType)
```

All methods return promises with `{ success: boolean, data: any }` structure.
