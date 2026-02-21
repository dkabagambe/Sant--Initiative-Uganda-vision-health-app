# VHT Eye Screening - 6 Steps Flow

## ✅ All Steps Validated and Working

### Step 1: Client Information (VisionScreen1)
**Required Fields:**
- Full Name *
- Age *
- Sex *
- District *

**Validation:** ✅ Checks all required fields before proceeding
**Navigation:** → VisionScreen2

### Step 2: Pre-Screening Questions (VisionScreen2)
**Questions:**
1. Do you have difficulty seeing far away objects?
2. Do you have difficulty reading small print?
3. Have you noticed any changes in your vision recently?
4. Do you experience eye pain or discomfort?

**Validation:** ✅ All questions must be answered (Yes/No)
**Navigation:** → VisionScreen3

### Step 3: Safety Information (VisionScreen3)
**Content:**
- Safety warnings
- DO NOTs
- Reminders for VHT

**Validation:** ❌ None needed (informational)
**Navigation:** → VisionScreen4

### Step 4: Torch Light Test (VisionScreen4)
**Sub-steps:**
1. Wash hands
2. Explain to client
3. Check for abnormal signs
4. Record findings

**Abnormal Signs:**
- Redness, Discharge/Pus, White Pupil, Eye Injury
- Swelling, Cloudiness, Growth/Lump, Squint

**Validation:** ✅ If abnormal signs found → Auto-referral, STOP screening
**Navigation:** → VisionScreen5 (if passed)

### Step 5: Distance Vision Test (VisionScreen5)
**Tests:**
- Right Eye: Line 1 (3 letters), Line 2 (5 letters)
- Left Eye: Line 1 (3 letters), Line 2 (5 letters)

**Pass Criteria:**
- Line 1: Must get 2/3 correct
- Line 2: Must get 4/5 correct

**Validation:** ✅ Both lines must be scored before proceeding
**Validation:** ✅ If failed → Auto-referral
**Navigation:** → VisionScreen6 (if both eyes passed)

### Step 6: Near Vision Test (VisionScreen6)
**Test:**
- Can client read small print?
- Age-based assessment (40+ = presbyopia check)

**Outcomes:**
- Passed → Complete screening
- Failed (40+) → Recommend reading glasses
- Failed (<40) → Referral

**Validation:** ✅ Test must be completed
**Navigation:** → Complete/Glasses Selection/Referral

## Navigation Flow
```
VisionScreen1 → VisionScreen2 → VisionScreen3 → VisionScreen4 → VisionScreen5 → VisionScreen6
     ↓              ↓              ↓              ↓              ↓              ↓
  Client Info   Questions      Safety      Torch Test    Distance Test   Near Test
  (Required)    (All Ans)    (Info Only)   (Auto-Ref)    (Score Both)   (Complete)
```

## Validation Summary
✅ Step 1: Required fields validation
✅ Step 2: All questions must be answered
❌ Step 3: No validation (informational)
✅ Step 4: Auto-referral on abnormal signs
✅ Step 5: Score validation + auto-referral on failure
✅ Step 6: Test completion validation

## All Steps Working ✅
- Proper validation at each step
- Cannot proceed without completing requirements
- Auto-referral triggers when needed
- Data saved to ScreeningContext
- Navigation flow is sequential and logical
