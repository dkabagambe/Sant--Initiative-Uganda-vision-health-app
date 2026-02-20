# SMS Setup Complete! ✅

## What's Been Done

### 1. ✅ Installed Africa's Talking
```bash
npm install africastalking
```

### 2. ✅ Created SMS Service
**File:** `backend/src/services/smsService.js`

**Features:**
- Sends OTP via SMS
- Formats phone numbers automatically
- Falls back to dev mode if not configured
- Handles errors gracefully

### 3. ✅ Updated Auth Controller
**File:** `backend/src/controllers/authController.js`

Now calls SMS service when user logs in.

### 4. ✅ Added Configuration
**File:** `backend/.env`

Added SMS credentials section.

## Current Status: Dev Mode

Right now, SMS is in **DEV MODE**:
- ✅ Works without credentials
- ✅ Logs OTP to console
- ✅ Shows OTP in app Alert
- ❌ Doesn't send real SMS yet

## To Enable Real SMS (5 Steps)

### Step 1: Sign Up for Africa's Talking

1. Go to: https://africastalking.com/
2. Click "Sign Up"
3. Choose "Uganda" as country
4. Verify your email

### Step 2: Get API Credentials

1. Login to dashboard
2. Go to "Settings" → "API Key"
3. Copy your:
   - Username (usually "sandbox" for testing)
   - API Key (long string)

### Step 3: Update .env File

Open `backend/.env` and update:

```env
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=paste_your_api_key_here
AFRICASTALKING_SENDER_ID=SANTE
```

### Step 4: Add Test Credits

**For Sandbox (Free Testing):**
1. Go to "Sandbox" in dashboard
2. Add test phone numbers
3. Get free test credits

**For Production:**
1. Go to "Billing"
2. Add credits (minimum UGX 10,000)
3. SMS costs UGX 35 each

### Step 5: Restart Backend

```bash
cd backend
node src/index.js
```

## Testing

### Test 1: Check Configuration

```bash
cd backend
node -e "
const smsService = require('./src/services/smsService');
smsService.sendOTP('0700123456', '123456').then(console.log);
"
```

**Expected (Dev Mode):**
```
📱 [DEV MODE] OTP for 0700123456: 123456
{ success: true, devMode: true }
```

**Expected (With Credentials):**
```
✅ SMS sent successfully
{ success: true, result: {...} }
```

### Test 2: Full Login Flow

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0700123456"}'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "phoneNumber": "0700123456",
  "otp": "123456"  // Only in dev mode
}
```

### Test 3: Check Phone

- Real SMS should arrive in 5-30 seconds
- Message: "Your Santé Initiative OTP is: 123456. Valid for 10 minutes."

## Troubleshooting

### Issue: "Credentials not configured"

**Solution:** Add API key to `.env` and restart

### Issue: "Insufficient balance"

**Solution:** Add credits in Africa's Talking dashboard

### Issue: "Invalid phone number"

**Solution:** Use format `0700123456` or `+256700123456`

### Issue: SMS not received

**Check:**
1. Phone number is correct
2. Phone has network signal
3. Check Africa's Talking dashboard logs
4. Verify credits available

## Phone Number Formats

The service accepts all these formats:

```
0700123456      → Converts to +256700123456
+256700123456   → Uses as-is
256700123456    → Converts to +256700123456
```

## Cost Breakdown

### Sandbox (Testing)
- **Free** test credits
- Limited to registered test numbers
- Perfect for development

### Production
- **UGX 35 per SMS** (~$0.01)
- Minimum top-up: UGX 10,000
- 285 SMS per UGX 10,000

### Monthly Estimates
- 100 users/day = UGX 3,500/day = UGX 105,000/month
- 500 users/day = UGX 17,500/day = UGX 525,000/month
- 1000 users/day = UGX 35,000/day = UGX 1,050,000/month

## Production Checklist

Before going live:

- [ ] Sign up for Africa's Talking
- [ ] Get production API key (not sandbox)
- [ ] Add credits to account
- [ ] Update `.env` with production credentials
- [ ] Test with real phone numbers
- [ ] Set up auto-recharge (optional)
- [ ] Monitor SMS delivery in dashboard

## Alternative: Keep Dev Mode

If you want to test without SMS costs:

**Current setup works perfectly:**
- OTP shows in app Alert
- User copies and enters it
- Everything else works
- **Free** for testing

Just don't add credentials to `.env`

## Next Steps

### Option A: Enable SMS Now
1. Sign up at africastalking.com
2. Get API key
3. Update `.env`
4. Restart backend
5. Test with your phone

### Option B: Test First, SMS Later
1. Keep current dev mode
2. Test all features
3. Add SMS when ready for production

## Summary

✅ **SMS service installed and ready**
✅ **Works in dev mode (no credentials needed)**
✅ **Automatically sends SMS when configured**
✅ **Falls back gracefully if not configured**

**To enable real SMS:** Just add your Africa's Talking API key to `.env` and restart!

---

**Need help?** 
- Africa's Talking Docs: https://developers.africastalking.com/
- Support: support@africastalking.com
