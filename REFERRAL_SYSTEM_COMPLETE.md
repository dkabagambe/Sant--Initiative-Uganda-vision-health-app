# Referral System - Complete Implementation

## ✅ What Was Fixed

### 1. Health Facilities Database
Created `health_facilities` table with 8 facilities across Uganda districts:
- Luweero Hospital (Luweero)
- Bombo Military Hospital (Luweero)
- Kampala Eye Clinic (Kampala)
- Mulago National Referral Hospital (Kampala)
- Nakaseke Hospital (Nakaseke)
- Wakiso Health Centre IV (Wakiso)
- Entebbe Hospital (Wakiso)
- Masaka Regional Referral Hospital (Masaka)

### 2. Screening Context Updates
Added referral tracking fields:
- `referralUrgency`: "high" | "normal" | "low"
- `referralStep`: Which step triggered the referral
- `referralReason`: Detailed reason for referral

### 3. Step 4 - Torch Light Test
**Before**: Alert only, no actual referral
**After**: 
- Saves referral data to context
- Marks urgency as "high" (abnormal eye signs)
- Records abnormal signs in reason
- Navigates to Step 6 to complete referral

### 4. Step 5 - Distance Vision Test
**Before**: Alert only, no actual referral
**After**:
- Saves referral data to context
- Marks urgency as "normal"
- Records which eye failed and scores
- Navigates to Step 6 to complete referral

### 5. Step 6 - Final Submission
**Before**: Only handled near vision referrals
**After**:
- Checks if referral already flagged from Steps 4 or 5
- Creates screening record
- Automatically creates referral with hospital assignment
- Assigns nearest hospital based on client's district
- Shows facility name in success message

### 6. Backend API
**New Endpoints**:
- `GET /api/health-facilities` - Get all facilities
- `GET /api/health-facilities?district=Luweero` - Filter by district
- `GET /api/health-facilities/:id` - Get specific facility

**Updated**:
- `POST /api/referrals` - Now accepts `clientName` field

## How It Works

### Referral Flow

1. **VHT performs screening** (Steps 1-6)

2. **Abnormal signs detected** (Step 4 or 5):
   ```
   - Save referral data to ScreeningContext
   - Set urgency level (high/normal)
   - Record reason and step
   - Navigate to Step 6
   ```

3. **Step 6 submission**:
   ```
   - Create screening record in database
   - Check if needsReferral = true
   - Query health_facilities by client's district
   - Get nearest facility (first result)
   - Create referral with:
     * screeningId
     * clientName
     * reason
     * urgency
     * facilityName (auto-assigned)
     * facilityLocation (auto-assigned)
     * notes (which step triggered it)
   ```

4. **VHT sees confirmation**:
   ```
   "Screening completed. Referral created for Luweero Hospital"
   ```

### Hospital Assignment Logic

```javascript
// Get facilities in client's district
const facilities = await apiService.getHealthFacilities(screeningData.district);

// Assign first/nearest facility
const facility = facilities.data?.[0];

// Create referral with facility details
await apiService.createReferral({
  facilityName: facility?.name || "Nearest Health Facility",
  facilityLocation: facility?.location || screeningData.district,
  // ... other fields
});
```

### Database Schema

**referrals table**:
```sql
id, screening_id, client_id, health_worker_id, client_name,
reason, urgency, facility_name, facility_location,
status, referred_date, completed_date, notes, created_at
```

**health_facilities table**:
```sql
id, name, type, district, location, phone, services, created_at
```

## Testing

1. Start screening from CHW Dashboard
2. Enter client info (Step 1) - include district
3. Answer questions (Step 2)
4. Read safety info (Step 3)
5. **Test referral from Step 4**:
   - Select abnormal signs (e.g., "Redness", "Discharge")
   - Click "Record Findings"
   - Should navigate to Step 6
   - Submit → Creates referral to hospital in client's district

6. **Test referral from Step 5**:
   - Score Line 1: 0/3 or 1/3 (fail)
   - Should show referral alert
   - Navigate to Step 6
   - Submit → Creates referral

7. **Check ReferralsScreen**:
   - Should show new referral
   - Should display facility name
   - Should show urgency level

## All Referral Triggers

1. ❌ **Step 4 Failed** → High urgency → Abnormal eye signs
2. ❌ **Step 5 Failed** → Normal urgency → Poor distance vision
3. ❌ **Step 6 Failed (Age < 40)** → Normal urgency → Poor near vision
4. ✅ **Step 6 Passed (Age ≥ 40)** → No referral → Recommend reading glasses

## Files Modified

**Frontend**:
- `frontend/src/context/ScreeningContext.tsx`
- `frontend/src/screens/screening/VisionScreen4.tsx`
- `frontend/src/screens/screening/VisionScreen5.tsx`
- `frontend/src/screens/screening/VisionScreen6Wrapper.tsx`
- `frontend/src/services/api.ts`

**Backend**:
- `backend/src/controllers/facilityController.js` (new)
- `backend/src/controllers/referralController.js`
- `backend/src/routes/facilities.js` (new)
- `backend/src/index.js`
- Database: `health_facilities` table created

## ✅ Complete
All referrals now properly create records with hospital assignments based on client location!
