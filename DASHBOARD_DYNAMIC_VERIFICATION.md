# CHW Dashboard - Dynamic Data Verification ✅

## All Data is Dynamic from Database

### Header Section
```
Santé Initiative Uganda
Jane Nambi
CHW - Luweero
```
**Source**: `apiService.getCurrentUser()` → `users` table
- `full_name`: Jane Nambi
- `district`: Luweero
- `role`: health_worker

### Welcome Section
```
Welcome, Jane Nambi
VHT - Luweero District
Ready to screen today?
```
**Source**: Same as header, dynamic from `users` table

### This Week Stats
```
28 Screened
20 Glasses Given  (not 15 - that was mockup)
```
**Source**: `apiService.getDashboardStats()` → `screenings` table
- `weekScreenings`: COUNT where `date >= now - 7 days`
- `glassesGiven`: COUNT where `needs_glasses = 1`

### Quick Action Cards

#### My Clients
```
3 Active clients
8 due for repayment
```
**Source**: 
- `clients`: COUNT from `clients` table
- "8 due for repayment": Static subtitle (TODO: make dynamic)

#### Inventory
```
508 Glasses in stock
Good stock level
```
**Source**: 
- `inventory`: SUM(stock_quantity) from `products` table
- "Good stock level": Static subtitle (TODO: make dynamic based on threshold)

#### Referrals
```
1 Pending referrals
1 outstanding
```
**Source**: 
- `referrals`: COUNT where `status = 'pending'` from `referrals` table
- "1 outstanding": Static subtitle (TODO: make dynamic)

#### Payments Due
```
0 Clients due today  (database shows 0 pending)
UGX 15,000 expected
```
**Source**: 
- `paymentsDue`: COUNT from `payments` where `status = 'pending'`
- "UGX 15,000 expected": Static subtitle (TODO: calculate from pending payments)

### Recent Activity
```
Nakato Grace
Screening completed • +2.50D
2h ago

Musoke Peter
Payment received • UGX 5,000
5h ago

Nansubuga Sarah
Referred to Luweero Hospital
1d ago
```
**Source**: `loadRecentActivity()` fetches:
- Latest screening from `screenings` table
- Latest payment from `payments` table
- Latest referral from `referrals` table
- Time calculated dynamically using `getTimeAgo()`

## Database Queries

### Dashboard Stats Query
```sql
SELECT 
  COUNT(CASE WHEN date(screening_date) >= date('now', '-7 days') THEN 1 END) as screenings_this_week,
  COUNT(CASE WHEN needs_glasses = 1 THEN 1 END) as clients_needing_glasses,
  ...
FROM screenings
WHERE health_worker_id = 'B7B5C0E1921DF64ED91C21AB6B592E5A'
```

### Recent Activity Queries
```sql
-- Screenings
SELECT client_name, recommended_power, created_at
FROM screenings
WHERE health_worker_id = ?
ORDER BY created_at DESC
LIMIT 1

-- Payments
SELECT client_name, amount, created_at
FROM payments
ORDER BY created_at DESC
LIMIT 1

-- Referrals
SELECT client_name, facility_name, created_at
FROM referrals
WHERE health_worker_id = ?
ORDER BY created_at DESC
LIMIT 1
```

## Current Database Values (Jane Nambi)

| Metric | Value | Source |
|--------|-------|--------|
| Screenings this week | 28 | screenings table |
| Glasses given | 20 | screenings.needs_glasses = 1 |
| Active clients | 3 | clients table |
| Inventory | 508 | products.stock_quantity |
| Pending referrals | 1 | referrals.status = 'pending' |
| Payments due | 0 | payments.status = 'pending' |

## What's Dynamic ✅

1. ✅ User name and district (header)
2. ✅ Week screenings count
3. ✅ Glasses given count
4. ✅ Active clients count
5. ✅ Inventory count
6. ✅ Pending referrals count
7. ✅ Payments due count
8. ✅ Recent activity (3 items with real data)
9. ✅ Time ago calculations

## What's Static (Subtitles) ⚠️

These are hardcoded subtitles that should be made dynamic:
1. "8 due for repayment" → Should calculate from payments table
2. "Good stock level" → Should be based on inventory threshold
3. "1 outstanding" → Should calculate from referrals
4. "UGX 15,000 expected" → Should SUM pending payment amounts

## API Endpoints Used

1. `GET /api/auth/me` → User data
2. `GET /api/dashboard/stats` → All dashboard statistics
3. `GET /api/screenings` → Recent screenings
4. `GET /api/payments` → Recent payments
5. `GET /api/referrals` → Recent referrals

## Conclusion

✅ **ALL MAIN DATA IS DYNAMIC** from the database!

The only static parts are the subtitle texts like "Good stock level" and "8 due for repayment", which are placeholder text. The actual numbers (28, 20, 3, 508, 1, 0) all come from real database queries.

The "15 Glasses Given" in your example was from the design mockup. The actual app shows **20** based on the database.
