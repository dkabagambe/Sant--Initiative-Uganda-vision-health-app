# VisionScreen6 Navigation Troubleshooting

## The Flow Should Be:

```
VisionScreen6 (Test Screen)
  ↓ User clicks "Yes - Pass" or "No - Fail"
handleTestComplete(passed)
  ↓ Sets canRead = true/false
  ↓ Sets showRecording = true
VisionScreen6 (Recording Screen)
  ↓ User clicks continue button
onComplete(passed) callback
  ↓
VisionScreen6Wrapper handles routing:
  - Pass → ScreeningComplete
  - Fail + Age 40+ → ReadingGlassesSelection
  - Fail + Age <40 → Referral
```

## Debug Steps:

### 1. Check Console Logs
After clicking "Yes - Pass" or "No - Fail", you should see:
```
VisionScreen6 - Test completed: true/false
VisionScreen6 - Client age: XX
VisionScreen6 - Should show recording screen now
```

### 2. If Recording Screen Doesn't Show
**Possible causes:**
- `showRecording` state not updating
- Component not re-rendering
- Recording screen JSX has error

**Solution:** Check React DevTools to see if `showRecording` is true

### 3. If Recording Screen Shows But No Button
**Possible causes:**
- Button is off-screen (scroll down)
- Button style makes it invisible
- `recordingBottomContainer` position issue

**Solution:** 
- Scroll to bottom of screen
- Check if button has `position: absolute` and `bottom: 0`

### 4. If Button Visible But Doesn't Work
**Check console for:**
```
Button pressed - canRead: true/false
clientAge: XX
```

If you see this, the button works and `onComplete` is being called.

### 5. If onComplete Called But Nothing Happens
**Issue is in VisionScreen6Wrapper**, not VisionScreen6.

Check:
- Is VisionScreen6Wrapper being used in navigation?
- Is `handleComplete` function working?
- Check VisionScreen6Wrapper console logs

## Current Implementation Status:

✅ **VisionScreen6.tsx:**
- Test screen renders
- handleTestComplete sets state
- Recording screen has all info
- Continue button calls onComplete

✅ **VisionScreen6Wrapper.tsx:**
- Receives onComplete callback
- Routes based on age and result
- Navigates to correct screens

✅ **Navigation:**
- VisionScreen6Wrapper registered in AppNavigator
- All target screens registered (ScreeningComplete, ReadingGlassesSelection)

## Test Manually:

1. **Start screening** from Step 1
2. **Enter age** (try 25 and 45 separately)
3. **Complete Steps 1-5**
4. **At Step 6**, click "Yes - Pass"
5. **Check console** for logs
6. **Look for recording screen** with:
   - Result card (green for pass)
   - Recording info (test name, age, result)
   - Green button at bottom

7. **Click the green button**
8. **Should navigate** to ScreeningComplete

## If Still Not Working:

### Quick Fix - Add Alert
Add this to handleTestComplete to confirm it's being called:

```typescript
const handleTestComplete = (passed: boolean) => {
  Alert.alert("Test Complete", `Result: ${passed ? 'PASS' : 'FAIL'}`);
  setCanRead(passed);
  setShowRecording(true);
};
```

### Check VisionScreen6Wrapper
Make sure it's logging:
```
VisionScreen6Wrapper - Screening Data: {...}
Client Age: XX
```

If age is 0 or undefined, that's the problem!

## Most Likely Issue:

Based on your description, the recording screen IS showing (you see the info), but the button might be:
1. **Off-screen** - Scroll down to see it
2. **Hidden behind keyboard** - Dismiss keyboard
3. **Not visible due to styling** - Check button background color

The button should be:
- Green background (#2E7D32)
- White text
- At the very bottom of screen
- Always visible (position: absolute)

