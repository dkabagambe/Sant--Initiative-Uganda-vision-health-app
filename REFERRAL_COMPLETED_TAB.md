# Referral Management - Completed Tab Default ✅

## Screen Opens to "Completed" Tab

The screen now shows the **Completed** tab by default with the exact layout you specified.

## Layout

```
Santé Initiative Uganda
Jane Nambi
─────────────────────
CHW - Luweero

Referral Management
Advanced eye care & NCD screening

┌──────┐ ┌──────┐ ┌──────┐
│Active│ │ High │ │Compl.│
│  12  │ │  5   │ │  28  │
└──────┘ └──────┘ └──────┘

[Impact] [Export] [New]

Active Referrals | Completed ✓
─────────────────────────────

┌─────────────────────────┐
│ Kawooya John            │
│ 0700444555              │
│                         │
│ Reason                  │
│ Distance vision loss    │
│                         │
│ Facility                │
│ Luweero Hospital Eye... │
│                         │
│ Referred                │
│ Jan 5, 2026             │
│                         │
│ Completed               │
│ Jan 7, 2026             │
│                         │
│ Outcome                 │
│ Prescribed corrective...│
└─────────────────────────┘

┌─────────────────────────┐
│ Nassali Agnes           │
│ 0700555666              │
│                         │
│ Reason                  │
│ Diabetes screening      │
│                         │
│ Facility                │
│ Bombo Health Center IV  │
│                         │
│ Referred                │
│ Jan 3, 2026             │
│                         │
│ Completed               │
│ Jan 6, 2026             │
│                         │
│ Outcome                 │
│ Started on medication   │
└─────────────────────────┘

Showing recent completed referrals

[View All History]

Partner Facilities
• Luweero Hospital Eye Clinic
• Bombo Health Center IV
• Kiwoko Hospital

[Home] [Screen] [Stock] [Pay] [Ref]
```

## Dummy Data

### Completed Referrals (Shows by default)
1. **Kawooya John** - 0700444555
   - Reason: Distance vision loss
   - Facility: Luweero Hospital Eye Clinic
   - Referred: Jan 5, 2026
   - Completed: Jan 7, 2026
   - Outcome: Prescribed corrective lenses

2. **Nassali Agnes** - 0700555666
   - Reason: Diabetes screening
   - Facility: Bombo Health Center IV
   - Referred: Jan 3, 2026
   - Completed: Jan 6, 2026
   - Outcome: Started on medication

### Active Referrals (Switch tab to see)
1. **Nansubuga Sarah** - 0700111222 (Urgent)
2. **Okello David** - 0700222333
3. **Nabirye Joyce** - 0700333444 (Urgent)

## Insert Data

```bash
cd backend
./insert-dummy-data.sh
```

## Key Changes

1. ✅ Default tab is now "Completed"
2. ✅ Completed cards show:
   - Name
   - Phone
   - Reason
   - Facility
   - Referred date
   - Completed date
   - Outcome
3. ✅ Active cards show:
   - Name
   - Age
   - Phone
   - Reason for referral
   - Referred to
   - Referred on
   - [Mark Complete] button
4. ✅ "View All History" button after completed list
5. ✅ All data is dynamic from database

## Stats (Dynamic)
- Active: 12 (from database count)
- High Priority: 5 (urgent referrals)
- Completed: 28 (completed count)

All numbers update automatically based on database!
