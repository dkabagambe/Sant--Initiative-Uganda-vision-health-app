# Referral Management Screen - Exact Design ✅

## Screen Layout

```
┌─────────────────────────────────────┐
│ Santé Initiative Uganda             │
│ Jane Nambi                          │
│ ─────────────────────────────────── │
│ CHW - Luweero                       │
│                                     │
│ Referral Management                 │
│ Advanced eye care & NCD screening   │
│                                     │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │Active│ │ High │ │Compl.│        │
│ │  12  │ │  5   │ │  28  │        │
│ └──────┘ └──────┘ └──────┘        │
│                                     │
│ [Impact] [Export] [New]             │
│                                     │
│ Active Referrals | Completed        │
│ ─────────────────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Nansubuga Sarah        [Urgent] │ │
│ │ Age 58 • 0700111222            │ │
│ │                                 │ │
│ │ Reason for referral             │ │
│ │ Suspected cataract, vision loss │ │
│ │                                 │ │
│ │ Referred to                     │ │
│ │ Luweero Hospital Eye Clinic     │ │
│ │                                 │ │
│ │ Referred on                     │ │
│ │ Jan 12, 2026                    │ │
│ │                                 │ │
│ │ [Mark Complete]                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Create New Referral]             │
│                                     │
│ Partner Facilities                  │
│ • Luweero Hospital Eye Clinic       │
│ • Bombo Health Center IV            │
│ • Kiwoko Hospital                   │
│                                     │
├─────────────────────────────────────┤
│ [Home] [Screen] [Stock] [Pay] [Ref]│
└─────────────────────────────────────┘
```

## Buttons

### 1. Impact Button (Green)
- Shows Impact Dashboard with stats
- Data from database

### 2. Export Button (Gray)
- Opens period selection dialog
- 6 export options

### 3. New Button (Gray)
- Opens Create Referral form
- Full form with all fields

### 4. Mark Complete Button (Green, on each card)
- Updates referral status
- Moves to Completed tab

### 5. Bottom Navigation (5 tabs)
- All functional and working

## Insert Dummy Data

### Option 1: Run Script
```bash
cd backend
./insert-dummy-data.sh
```

### Option 2: Manual SQL (PostgreSQL)
```bash
cd backend
psql $DATABASE_URL < insert-dummy-referrals.sql
```

### Option 3: Manual SQL (SQLite)
```bash
cd backend
sqlite3 sante.db < insert-dummy-referrals.sql
```

## Dummy Data Included

### Active Referrals (3)
1. **Nansubuga Sarah** (58, Urgent)
   - Suspected cataract, vision loss
   - Luweero Hospital Eye Clinic
   - Jan 12, 2026

2. **Okello David** (62, Normal)
   - High blood pressure, diabetes
   - Bombo Health Center IV
   - Jan 10, 2026

3. **Nabirye Joyce** (55, Urgent)
   - Eye pain and redness
   - Luweero Hospital Eye Clinic
   - Jan 8, 2026

### Completed Referrals (2)
1. **Mukasa John** (48)
   - Blurred vision, needs glasses
   - Completed: Jan 5, 2026

2. **Nakato Grace** (65)
   - Diabetes screening required
   - Completed: Dec 28, 2025

## Testing

1. **Insert dummy data**:
   ```bash
   cd backend
   ./insert-dummy-data.sh
   ```

2. **Start backend**:
   ```bash
   npm start
   ```

3. **Start frontend**:
   ```bash
   cd ../frontend
   npm start
   ```

4. **Login and navigate to Referrals tab**

5. **Test all buttons**:
   - Click Impact → See stats
   - Click Export → Select period
   - Click New → Open form
   - Click Mark Complete → Update status
   - Click bottom tabs → Navigate

## Files Modified

1. `frontend/src/screens/chw/ReferralManagementScreen.tsx`
   - Exact layout matching design
   - Clean, simple styles
   - All buttons visible and working

2. `backend/insert-dummy-referrals.sql`
   - 5 sample referrals
   - 3 active, 2 completed

3. `backend/insert-dummy-data.sh`
   - Easy script to insert data
   - Works for SQLite and PostgreSQL

## Design Changes

✅ Header with name and role  
✅ Stats in horizontal row  
✅ Three action buttons (Impact, Export, New)  
✅ Clean tabs  
✅ Simple card design  
✅ Mark Complete button on each card  
✅ Create button below cards  
✅ Partner facilities box  
✅ Bottom navigation (5 tabs)  

All buttons are now **clearly visible** and **fully functional**!
