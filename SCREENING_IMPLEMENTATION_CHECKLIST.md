# 🔧 SCREENING FLOW IMPLEMENTATION CHECKLIST

## Current Status vs Uganda Job Aid Protocol

### ✅ What's Already Implemented:
1. **Step 1: Client Information** - VisionScreen1.tsx ✅
   - Full name, age, phone, sex, district
   - Age validation present

2. **Step 2: Pre-Screening Questions** - VisionScreen2.tsx ✅
   - 4 Yes/No questions present
   - All questions must be answered

3. **Steps 3-6: Various tests** - VisionScreen3-6.tsx ✅
   - Distance vision, near vision, glasses selection

### ⚠️ CRITICAL MISSING IMPLEMENTATIONS:

#### 1. **Safety & Education Screen** (Step 3)
**Status:** MISSING
**Required:** Dedicated screen showing:
- ❌ What VHTs must NEVER do (5 items)
- ✅ What VHTs should do (4 items)
**Action:** Create new screen or add to VisionScreen2

#### 2. **Torch Light Test** (Step 4)
**Status:** MISSING DETAILED IMPLEMENTATION
**Required:**
- Visual guide for torch usage
- 8 abnormal signs checklist:
  - Redness, Discharge, White pupil, Eye injury
  - Swelling, Cloudiness, Growth/lump, Squint
- Immediate referral if ANY abnormal sign
- 5-second maximum per eye warning
**Current:** VisionScreen3 may have basic test
**Action:** Enhance VisionScreen3 with full protocol

#### 3. **Age-Based Routing Logic**
**Status:** PARTIALLY IMPLEMENTED
**Required:**
- Age < 6: End after torch test (no other tests)
- Age ≥ 6: Continue to distance vision
- Age 40+: Presbyopia pathway for near vision failure
**Current:** May not have age-based routing
**Action:** Add conditional navigation based on age

#### 4. **2-Minute Wait Timer**
**Status:** MISSING
**Required:** Between torch test and distance vision test
**Action:** Add countdown timer screen or component

#### 5. **Proper Referral Logic**
**Status:** NEEDS VERIFICATION
**Required Referral Triggers:**
- ANY abnormal sign in torch test → STOP & REFER
- Distance vision FAIL → REFER (no near vision test)
- Near vision FAIL + Age 6-39 → REFER
- Near vision FAIL + Age 40+ → Presbyopia glasses (NOT referral)
**Action:** Verify and fix referral conditions in each screen

#### 6. **Step Numbering**
**Status:** INCORRECT
**Current:** Shows "Step 1 of 6"
**Required:** Should be "Step 1 of 7" (with glasses selection)
**Action:** Update progress indicators

---

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Fix Critical Logic (HIGH PRIORITY)

1. **Update VisionScreen1.tsx**
   - Change progress to "Step 1 of 7"
   - Ensure age is captured correctly
   - Add age validation (must be > 0)

2. **Update VisionScreen2.tsx**
   - Add Safety & Education section
   - Show "What NOT to do" warnings
   - Show "What TO do" guidelines
   - Change progress to "Step 2 of 7"

3. **Create/Update VisionScreen3.tsx (Torch Light Test)**
   - Add visual torch icon/guide
   - Add 8 abnormal signs checklist
   - Add "NO abnormal signs" option
   - Implement immediate referral if abnormal
   - Add age-based routing:
     - If age < 6 AND no abnormal signs → END (show completion)
     - If age ≥ 6 AND no abnormal signs → 2-minute wait → Continue
   - Change progress to "Step 3 of 7"

4. **Add 2-Minute Wait Screen**
   - Countdown timer: 2:00 → 0:00
   - Explanation: "Allowing eyes to adjust"
   - Auto-proceed to distance vision test
   - OR: Add to VisionScreen3 as modal/overlay

5. **Update VisionScreen4.tsx (Distance Vision)**
   - Verify 3-meter E-chart protocol
   - Right eye first, then left eye
   - Passing criteria: ≥2 letters on 6/60 AND ≥4 letters on 6/12
   - FAIL → Generate referral → END (no near vision)
   - PASS → Continue to near vision
   - Change progress to "Step 4 of 7"

6. **Update VisionScreen5.tsx (Near Vision)**
   - Test both eyes together (no covering)
   - N8 line reading
   - PASS → END (no glasses needed)
   - FAIL → Check age:
     - Age 6-39 → Generate referral → END
     - Age 40+ → Continue to glasses selection
   - Change progress to "Step 5 of 7"

7. **Update VisionScreen6.tsx (Glasses Selection)**
   - Only for Age 40+ with near vision failure
   - Powers: +1.00D to +3.50D
   - Test each power until N8 readable
   - Dispense and record
   - Change progress to "Step 6 of 7"

8. **Update VisionScreen6Wrapper.tsx**
   - Verify referral creation logic
   - Ensure age-based conditions are correct
   - Add presbyopia vs. referral distinction

### Phase 2: UI/UX Enhancements (MEDIUM PRIORITY)

1. **Add Icons & Emojis**
   - 🔦 Torch icon
   - 👁️ Eye icons
   - ⚠️ Warning icons
   - ✅ Success icons

2. **Color Coding**
   - Green for pass/normal
   - Red for fail/abnormal/refer
   - Yellow for warnings

3. **Low-Literacy Design**
   - Larger buttons
   - Visual guides
   - Simple language
   - Icons alongside text

### Phase 3: Data & Reporting (LOW PRIORITY)

1. **Ensure Data Capture**
   - All test results recorded
   - Referral reasons captured
   - Glasses dispensed tracked
   - VHT register format compliance

---

## 🚨 CRITICAL CONDITIONS TO IMPLEMENT

### Condition 1: Torch Test Abnormal Signs
```typescript
if (anyAbnormalSignDetected) {
  // STOP immediately
  // Generate referral with reason
  // Show referral screen
  // END screening (no other tests)
}
```

### Condition 2: Age < 6 After Torch Test
```typescript
if (clientAge < 6 && torchTestPassed) {
  // Show completion message
  // Record screening
  // END (no distance/near vision tests)
}
```

### Condition 3: Distance Vision Failure
```typescript
if (distanceVisionFailed) {
  // Generate referral
  // Reason: "Failed distance vision test"
  // END (no near vision test)
}
```

### Condition 4: Near Vision Failure - Age Based
```typescript
if (nearVisionFailed) {
  if (clientAge >= 6 && clientAge < 40) {
    // Generate referral
    // Reason: "Near vision problem in young person"
    // END
  } else if (clientAge >= 40) {
    // This is PRESBYOPIA (normal)
    // Continue to glasses selection
    // Show explanation: "Normal for your age"
  }
}
```

### Condition 5: 2-Minute Wait
```typescript
if (torchTestPassed && clientAge >= 6) {
  // Show 2-minute countdown
  // Explanation: "Allowing eyes to adjust"
  // Auto-proceed after 2:00
}
```

---

## 📝 NEXT STEPS

1. Review current VisionScreen3-6 implementations
2. Identify which screens need updates
3. Implement missing conditions
4. Add safety & education content
5. Add torch test abnormal signs checklist
6. Add 2-minute wait timer
7. Fix age-based routing
8. Update progress indicators (1 of 7, 2 of 7, etc.)
9. Test complete flow with different ages
10. Verify referral generation at each step

---

**Priority:** HIGH - Core screening logic must match protocol exactly
**Timeline:** Implement immediately
**Testing:** Test with ages: 3, 8, 25, 45 to verify all pathways
