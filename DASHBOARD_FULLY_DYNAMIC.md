# Dashboard - All Data Now Dynamic ✅

## Changes Made

### Frontend (CHWDashboard.tsx)

**Added new state fields:**
```typescript
const [stats, setStats] = useState({
  weekScreenings: 0,
  glassesGiven: 0,
  clients: 0,
  clientsDueRepayment: 0,        // NEW
  inventory: 0,
  referrals: 0,
  referralsOutstanding: 0,       // NEW
  paymentsDue: 0,
  expectedAmount: 0,             // NEW
});
```

**Made all subtitles dynamic:**
```typescript
// My Clients
subValue: stats.clientsDueRepayment 
  ? `${stats.clientsDueRepayment} due for repayment` 
  : "No repayments due"

// Inventory
subValue: stats.inventory === 0 
  ? "Out of stock" 
  : stats.inventory < 100 
    ? "Low stock" 
    : "Good stock level"

// Referrals
subValue: stats.referralsOutstanding 
  ? `${stats.referralsOutstanding} outstanding` 
  : "All up to date"

// Payments Due
subValue: stats.expectedAmount 
  ? `UGX ${stats.expectedAmount.toLocaleString()} expected` 
  : "No payments due"
```

### Backend (dashboardController.js)

**Added new queries:**

1. **Clients due for repayment:**
```sql
SELECT COUNT(DISTINCT c.id) as clients_due_repayment
FROM clients c
JOIN screenings s ON c.id = s.client_id
JOIN payments p ON s.id = p.screening_id
WHERE c.health_worker_id = ?
AND p.status = 'pending'
```

2. **Outstanding referrals (pending > 7 days):**
```sql
COUNT(CASE WHEN status = 'pending' 
  AND date(referred_date) < date('now', '-7 days') 
  THEN 1 END) as outstanding_referrals
```

3. **Payments due today:**
```sql
COUNT(CASE WHEN status = 'pending' 
  AND date(due_date) <= date('now') 
  THEN 1 END) as due_today
```

4. **Expected amount today:**
```sql
SUM(CASE WHEN status = 'pending' 
  AND date(due_date) <= date('now') 
  THEN amount ELSE 0 END) as expected_today
```

**Updated response:**
```javascript
data: {
  weekScreenings: ...,
  glassesGiven: ...,
  clients: ...,
  clientsDueRepayment: clientsDue[0].clients_due_repayment || 0,  // NEW
  inventory: ...,
  referrals: ...,
  referralsOutstanding: referralStats[0].outstanding_referrals || 0,  // NEW
  paymentsDue: paymentStats[0].due_today || 0,  // CHANGED
  expectedAmount: paymentStats[0].expected_today || 0,  // NEW
}
```

## Current Dashboard Values (Jane Nambi)

| Card | Main Value | Subtitle | Source |
|------|------------|----------|--------|
| **This Week** | 28 Screened | - | screenings last 7 days |
| **This Week** | 20 Glasses Given | - | screenings.needs_glasses = 1 |
| **My Clients** | 3 | Active clients | clients table |
| **My Clients** | 1 | due for repayment | clients with pending payments |
| **Inventory** | 508 | Glasses in stock | products.stock_quantity |
| **Inventory** | Good stock level | (508 >= 100) | Dynamic based on count |
| **Referrals** | 1 | Pending referrals | referrals.status = 'pending' |
| **Referrals** | All up to date | (0 outstanding) | pending > 7 days |
| **Payments Due** | 1 | Clients due today | payments due today |
| **Payments Due** | UGX 8,000 expected | - | SUM of amounts due today |

## Sample Data Added

**Payments:**
- pay1: Musoke Peter - UGX 5,000 - completed - due 2026-02-26
- pay2: Nakato Grace - UGX 8,000 - pending - due 2026-02-21 (TODAY)
- pay3: Musoke Peter - UGX 7,000 - pending - due 2026-02-24

## Before vs After

### Before (Static)
```
My Clients: 3
"8 due for repayment"  ❌ Hardcoded

Inventory: 508
"Good stock level"  ❌ Hardcoded

Referrals: 1
"1 outstanding"  ❌ Hardcoded

Payments Due: 0
"UGX 15,000 expected"  ❌ Hardcoded
```

### After (Dynamic)
```
My Clients: 3
"1 due for repayment"  ✅ From database

Inventory: 508
"Good stock level"  ✅ Calculated (508 >= 100)

Referrals: 1
"All up to date"  ✅ From database (0 > 7 days)

Payments Due: 1
"UGX 8,000 expected"  ✅ From database
```

## Welcome Message

Already dynamic:
```typescript
<Text style={styles.welcomeTitle}>
  Welcome, {userData?.full_name || userData?.first_name || "User"}
</Text>
<Text style={styles.userRole}>
  VHT - {userData?.district ? `${userData.district} District` : "District"}
</Text>
```

Shows: **"Welcome, Jane Nambi"** and **"VHT - Luweero District"**

## ✅ Everything is Now Dynamic!

All numbers, subtitles, and text come from the database. No more hardcoded values!
