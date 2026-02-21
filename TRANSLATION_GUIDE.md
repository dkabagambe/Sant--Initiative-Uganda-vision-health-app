# Translation Implementation Guide

## ✅ Translations Added

### Complete translation keys added for:
- Dashboard (welcome, stats, cards)
- Inventory (stock, sales, revenue)
- Payments (status, amounts)
- Referrals (urgency, facilities)
- Settings
- Common terms

## How to Apply Translations to Any Screen

### Step 1: Import the hook
```typescript
import { useLanguage } from "../../context/LanguageContext";
```

### Step 2: Use the hook in component
```typescript
export default function YourScreen() {
  const { t } = useLanguage();
  // ... rest of code
}
```

### Step 3: Replace text with translation keys
```typescript
// Before
<Text>Welcome</Text>

// After
<Text>{t('welcome')}</Text>
```

## Translation Keys Available

### Dashboard
- `welcome` - "Welcome" / "Tukusanyukidde"
- `readyToScreen` - "Ready to screen today?" / "Oli mwetegefu okukebera leero?"
- `thisWeek` - "This Week" / "Wiiki Eno"
- `screened` - "Screened" / "Abakeberebwa"
- `glassesGiven` - "Glasses Given" / "Endabirwamu Ezaweebwa"
- `myClients` - "My Clients" / "Bakasitoma Bange"
- `activeClients` - "Active clients" / "Bakasitoma abaliko"
- `dueForRepayment` - "due for repayment" / "balina okusasula"
- `inventory` - "Inventory" / "Ebintu"
- `glassesInStock` - "Glasses in stock" / "Endabirwamu mu sitoko"
- `goodStockLevel` - "Good stock level" / "Sitoko nnungi"
- `lowStock` - "Low stock" / "Sitoko ntono"
- `outOfStock` - "Out of stock" / "Sitoko ewedde"
- `referrals` - "Referrals" / "Okusindika"
- `pendingReferrals` - "Pending referrals" / "Abasindikiddwa"
- `outstanding` - "outstanding" / "abasigadde"
- `allUpToDate` - "All up to date" / "Byonna birungi"
- `paymentsDue` - "Payments Due" / "Okusasula"
- `clientsDueToday` - "Clients due today" / "Abasasula leero"
- `expected` - "expected" / "esuubirwa"
- `noPaymentsDue` - "No payments due" / "Tewali kusasula"
- `recentActivity` - "Recent Activity" / "Ebyo Byakolebwa Kaakano"
- `viewAll` - "View All" / "Laba Byonna"
- `vhtEyeScreening` - "VHT Eye Screening" / "Okukebera Amaaso"
- `ugandaJobAid` - "Uganda Job Aid Protocol" / "Enkola ya Uganda"
- `viewReports` - "View Reports" / "Laba Alipoota"

### Inventory
- `inventoryAndSales` - "Inventory & Sales" / "Ebintu n'Okutunda"
- `totalStock` - "Total stock" / "Sitoko yonna"
- `pairs` - "pairs" / "ppea"
- `lowStockAlert` - "Low stock alert" / "Sitoko ntono"
- `inStock` - "In Stock" / "Mu Sitoko"
- `soldWeek` - "Sold (Week)" / "Ezatundibwa (Wiiki)"
- `currentStockByPower` - "Current Stock by Power" / "Sitoko Okusinziira ku Maanyi"
- `addStock` - "Add Stock" / "Yongera Sitoko"
- `standard` - "Standard" / "Bulijjo"
- `metal` - "Metal" / "Ebyuma"
- `fashion` - "Fashion" / "Eza Fasoni"
- `critical` - "Critical" / "Enkulu"
- `recentSales` - "Recent Sales" / "Okutunda Okwakaakano"
- `revenueSummary` - "Revenue Summary" / "Ensimbi Ezaafunibwa"
- `totalSalesMonth` - "Total Sales (This Month)" / "Okutunda Kwonna (Omwezi Guno)"
- `fullPayments` - "Full Payments" / "Okusasula Okujjuvu"
- `hirePurchase` - "Hire-Purchase" / "Okupangisa"
- `requestReplenishment` - "Request Stock Replenishment" / "Saba Sitoko Empya"

### Payments
- `paymentsAndRevenue` - "Payments & Revenue" / "Okusasula n'Ensimbi"
- `totalRevenue` - "Total Revenue" / "Ensimbi Zonna"
- `pendingPayments` - "Pending Payments" / "Okusasula Okukyali"
- `completedPayments` - "Completed Payments" / "Okusasula Okuwedde"
- `allPayments` - "All Payments" / "Okusasula Kwonna"
- `pending` - "Pending" / "Kukyali"
- `completed` - "Completed" / "Kuwedde"
- `failed` - "Failed" / "Kiremye"
- `amount` - "Amount" / "Omuwendo"
- `status` - "Status" / "Embeera"
- `date` - "Date" / "Olunaku"

### Referrals
- `referralsAndFollowUp` - "Referrals & Follow-up" / "Okusindika n'Okugoberera"
- `totalReferrals` - "Total Referrals" / "Abasindikiddwa Bonna"
- `needsFollowUp` - "Needs Follow-up" / "Beetaaga Okugoberera"
- `allReferrals` - "All Referrals" / "Abasindikiddwa Bonna"
- `reason` - "Reason" / "Ensonga"
- `facility` - "Facility" / "Eddwaliro"
- `urgency` - "Urgency" / "Obwangu"
- `high` - "High" / "Waggulu"
- `normal` - "Normal" / "Bulijjo"
- `low` - "Low" / "Wansi"

### Common
- `save` - "Save" / "Tereka"
- `cancel` - "Cancel" / "Sazaamu"
- `next` - "Next" / "Ddamu"
- `previous` - "Previous" / "Emabega"
- `submit` - "Submit" / "Waayo"
- `loading` - "Loading..." / "Tegeka..."
- `success` - "Success" / "Kituuse"
- `error` - "Error" / "Kiremye"
- `district` - "District" / "Disitulikiti"
- `today` - "Today" / "Leero"
- `yesterday` - "Yesterday" / "Jjo"
- `daysAgo` - "days ago" / "ennaku eziyise"
- `hoursAgo` - "hours ago" / "essaawa eziyise"
- `justNow` - "Just now" / "Kaakano"

## Example: Translating a Screen

### Before
```typescript
export default function InventoryScreen() {
  return (
    <View>
      <Text>Inventory & Sales</Text>
      <Text>Total stock: {total} pairs</Text>
      <Text>In Stock</Text>
      <Text>Sold (Week)</Text>
      <Text>Low Stock</Text>
    </View>
  );
}
```

### After
```typescript
import { useLanguage } from "../../context/LanguageContext";

export default function InventoryScreen() {
  const { t } = useLanguage();
  
  return (
    <View>
      <Text>{t('inventoryAndSales')}</Text>
      <Text>{t('totalStock')}: {total} {t('pairs')}</Text>
      <Text>{t('inStock')}</Text>
      <Text>{t('soldWeek')}</Text>
      <Text>{t('lowStock')}</Text>
    </View>
  );
}
```

## Screens to Update

Apply the same pattern to:
1. ✅ CHWDashboard.tsx (partially done)
2. InventoryScreen.tsx
3. PaymentsScreen.tsx
4. ReferralsScreen.tsx
5. MyClientsScreen.tsx
6. ReportsScreen.tsx
7. SettingsScreen.tsx

## Testing

1. Open app
2. Go to Settings
3. Change language to Luganda
4. Navigate through all screens
5. All text should be in Luganda

## Language Switching

The language is already stored in AsyncStorage and persists across app restarts. The LanguageProvider is already wrapped around the entire app in App.tsx.
