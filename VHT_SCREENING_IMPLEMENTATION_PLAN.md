# VHT Screening Implementation Plan

## Current Status Analysis

### ✅ What's Already Correct:
1. **VisionScreen1** - Client Information (Step 1) ✓
2. **VisionScreen2** - Pre-Screening Questions (Step 2) ✓
3. **VisionScreen3** - Safety & Education (Step 3) ✓
4. **VisionScreen4** - Torch Light Test (Step 4) ✓
5. **ScreeningContext** - Data management ✓
6. **Navigation** - Proper stack setup ✓

### ❌ What Needs Fixing:

#### 1. **VisionScreen4 (Torch Test)** - Decision Logic
**Current Issues:**
- May not properly handle age-based routing
- Need to verify: Under 6 → END after torch test
- Need to verify: 6+ → Wait 2 minutes → Distance test
- Need to verify: Abnormal signs → STOP → Referral

**Required Logic:**
```
Torch Test Result:
├─ ABNORMAL SIGNS? → Generate Referral → END
└─ NO ABNORMAL SIGNS
    ├─ Age < 6? → Record & END (Complete)
    └─ Age ≥ 6? → Wait 2 minutes → VisionScreen5
```

#### 2. **VisionScreen5 (Distance Vision)** - Test Protocol
**Must Include:**
- 3-meter E-chart test
- Test RIGHT eye first, then LEFT
- Line 6/60: ≥2 letters required
- Line 6/12: ≥4 out of 5 letters required
- PASS → VisionScreen6 (Near Vision)
- FAIL → Generate Referral → END

#### 3. **VisionScreen6 (Near Vision)** - Age-Based Routing
**Must Include:**
- Test BOTH eyes together (no covering)
- N8 line reading at 40cm
- PASS → Complete & END
- FAIL + Age 6-39 → Generate Referral → END
- FAIL + Age 40+ → Reading Glasses Selection (Step 7)

#### 4. **Step 7: Reading Glasses Selection** - NEW SCREEN NEEDED
**Must Create:**
- VisionScreen7.tsx (or ReadingGlassesSelection.tsx)
- Powers: +1.00D, +1.50D, +2.00D, +2.50D, +3.00D, +3.50D
- Start with +1.00D, increase until N8 readable
- Dispense glasses
- Update inventory
- Complete screening

#### 5. **Referral Generation** - Automatic at Multiple Points
**Referral Triggers:**
- Torch test: Abnormal signs detected
- Distance test: Failed (≤1 on 6/60 OR <4 on 6/12)
- Near test: Failed + Age 6-39

**Referral Data Required:**
- Client info
- Test that failed
- Abnormal signs (if torch test)
- Urgency level
- Facility recommendation

#### 6. **Completion Screens** - Multiple Endpoints
**Need Different Completion Paths:**
- Path A: Age <6, Torch Passed → "Screening Complete - No Issues"
- Path B: Age 6+, All Tests Passed → "Screening Complete - No Issues"
- Path C: Referral Generated → "Referral Created - Client Referred"
- Path D: Glasses Dispensed → "Screening Complete - Glasses Provided"

## Implementation Steps

### Phase 1: Fix Existing Screens (Priority)
1. ✅ VisionScreen1 - Verify client info capture (especially AGE)
2. ✅ VisionScreen2 - Verify pre-screening questions
3. ✅ VisionScreen3 - Verify safety education
4. 🔧 VisionScreen4 - Fix torch test decision logic
5. 🔧 VisionScreen5 - Fix distance vision test & routing
6. 🔧 VisionScreen6 - Fix near vision test & age-based routing

### Phase 2: Create New Screens
7. 🆕 VisionScreen7 - Reading glasses selection (Age 40+ presbyopia)
8. 🆕 ReferralGenerationScreen - Automatic referral creation
9. 🆕 ScreeningCompleteScreen - Multiple completion paths

### Phase 3: Update Context & Navigation
10. 🔧 ScreeningContext - Add missing fields:
    - preScreeningAnswers (4 questions)
    - torchTestResult (pass/fail)
    - torchAbnormalSigns (array)
    - distanceVisionResult (pass/fail)
    - nearVisionResult (pass/fail)
    - glassesDispensed (boolean)
    - glassesPower (string)
    - referralGenerated (boolean)
    - referralReason (string)
    - completionPath (A/B/C/D)

11. 🔧 AppNavigator - Add new screens:
    - VisionScreen7 (Glasses Selection)
    - ReferralGeneration
    - ScreeningComplete (with path parameter)

### Phase 4: Backend Integration
12. 🔧 Screening API - Ensure proper data capture
13. 🔧 Referral API - Auto-generate from screening
14. 🔧 Inventory API - Deduct glasses when dispensed

## Critical Rules to Implement

### Age-Based Routing:
```typescript
if (clientAge < 6) {
  // Only torch test
  if (torchPassed) {
    // END - Complete
  } else {
    // Generate Referral - END
  }
} else {
  // Full protocol (torch → distance → near)
  // Continue to distance test after 2-minute wait
}
```

### Torch Test Logic:
```typescript
if (abnormalSigns.length > 0) {
  // STOP immediately
  // Generate referral
  // Do NOT proceed to other tests
  // END
} else {
  if (clientAge < 6) {
    // Complete screening - END
  } else {
    // Wait 2 minutes
    // Proceed to distance test
  }
}
```

### Distance Test Logic:
```typescript
const passed = (
  rightEye.line6_60 >= 2 &&
  rightEye.line6_12 >= 4 &&
  leftEye.line6_60 >= 2 &&
  leftEye.line6_12 >= 4
);

if (!passed) {
  // Generate referral
  // END - Do NOT test near vision
} else {
  // Proceed to near vision test
}
```

### Near Test Logic:
```typescript
if (canReadN8) {
  // PASS - Complete screening
  // END
} else {
  // FAIL
  if (clientAge >= 40) {
    // Presbyopia (normal aging)
    // Proceed to glasses selection
  } else {
    // Age 6-39 with near vision problem
    // Generate referral
    // END
  }
}
```

## Testing Checklist

### Test Case 1: Child Under 6
- [ ] Enter age < 6
- [ ] Complete torch test (pass)
- [ ] Should END immediately (no other tests)
- [ ] Should show "Complete" screen

### Test Case 2: Child Under 6 with Abnormal Signs
- [ ] Enter age < 6
- [ ] Torch test (fail - abnormal signs)
- [ ] Should generate referral
- [ ] Should END immediately

### Test Case 3: Adult with Perfect Vision
- [ ] Enter age 25
- [ ] Pass torch test
- [ ] Wait 2 minutes
- [ ] Pass distance test
- [ ] Pass near test
- [ ] Should show "Complete - No Issues"

### Test Case 4: Adult with Distance Vision Problem
- [ ] Enter age 30
- [ ] Pass torch test
- [ ] Fail distance test
- [ ] Should generate referral
- [ ] Should NOT test near vision
- [ ] Should END

### Test Case 5: Adult 40+ with Presbyopia
- [ ] Enter age 45
- [ ] Pass torch test
- [ ] Pass distance test
- [ ] Fail near test
- [ ] Should proceed to glasses selection
- [ ] Should dispense glasses
- [ ] Should update inventory
- [ ] Should show "Complete - Glasses Provided"

### Test Case 6: Young Adult with Near Vision Problem
- [ ] Enter age 25
- [ ] Pass torch test
- [ ] Pass distance test
- [ ] Fail near test
- [ ] Should generate referral (abnormal for age)
- [ ] Should END

## Files to Modify

1. `/frontend/src/screens/screening/VisionScreen4.tsx` - Fix torch logic
2. `/frontend/src/screens/screening/VisionScreen5.tsx` - Fix distance logic
3. `/frontend/src/screens/screening/VisionScreen6.tsx` - Fix near logic + age routing
4. `/frontend/src/screens/screening/VisionScreen7.tsx` - CREATE (glasses selection)
5. `/frontend/src/screens/screening/ReferralGenerationScreen.tsx` - CREATE
6. `/frontend/src/screens/screening/ScreeningCompleteScreen.tsx` - UPDATE (multiple paths)
7. `/frontend/src/context/ScreeningContext.tsx` - Add missing fields
8. `/frontend/src/navigation/AppNavigator.tsx` - Add new screens
9. `/backend/src/controllers/screeningController.js` - Verify data capture

## Next Actions

1. Review VisionScreen4-6 current implementation
2. Identify exact gaps in decision logic
3. Fix screens one by one
4. Create new screens (VisionScreen7, etc.)
5. Test all 6 test cases
6. Commit changes

---

**Status**: Ready to implement
**Priority**: HIGH - Core functionality
**Estimated Time**: 2-3 hours for complete implementation
