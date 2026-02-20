# SMS Integration Setup Guide

## Current Status: ❌ SMS NOT Sending

Your OTP system currently:
- ✅ Generates OTP
- ✅ Saves to database
- ✅ Shows in app Alert (dev mode)
- ❌ **Does NOT send SMS to phone**

## To Enable Real SMS:

### Option 1: Africa's Talking (Best for Uganda) 🇺🇬

**Cost:** ~$0.01 per SMS

#### 1. Sign Up
```
https://africastalking.com/
```

#### 2. Install Package
```bash
cd backend
npm install africastalking
```

#### 3. Add to .env
```env
AFRICASTALKING_API_KEY=your_api_key_here
AFRICASTALKING_USERNAME=your_username_here
AFRICASTALKING_SENDER_ID=SANTE
```

#### 4. SMS Service Already Created ✅
File: `backend/src/services/smsService.js`

#### 5. Auth Controller Already Updated ✅
File: `backend/src/controllers/authController.js`

#### 6. Restart Backend
```bash
cd backend
node src/index.js
```

### Option 2: Twilio (International)

**Cost:** ~$0.0075 per SMS

#### 1. Sign Up
```
https://www.twilio.com/
```

#### 2. Install
```bash
npm install twilio
```

#### 3. Update smsService.js
```javascript
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your Santé Initiative OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

### Option 3: Keep Development Mode (Free)

If you want to test without SMS:

**Current behavior:**
- OTP shows in Alert popup
- User manually enters it
- Works for testing

**No changes needed** - Already working this way!

## Testing SMS Integration

### 1. With Africa's Talking Sandbox (Free Testing)

```bash
# Test endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0700123456"}'
```

Check:
- ✅ Backend logs show "SMS sent"
- ✅ Phone receives SMS
- ✅ OTP in SMS matches database

### 2. Without SMS (Current)

```bash
# Same test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"0700123456"}'
```

Response includes OTP:
```json
{
  "success": true,
  "otp": "123456"  // Only in development
}
```

## Recommended Approach

### For Development/Testing:
✅ **Keep current setup** - OTP shows in Alert
- Free
- Fast
- No SMS costs
- Perfect for testing

### For Production:
✅ **Use Africa's Talking**
- Ugandan company
- Local phone numbers
- Reliable delivery
- Affordable pricing
- Good for East Africa

## Quick Setup (5 minutes)

If you want SMS now:

```bash
# 1. Install
cd backend
npm install africastalking

# 2. Get credentials from africastalking.com

# 3. Add to .env
echo "AFRICASTALKING_API_KEY=your_key" >> .env
echo "AFRICASTALKING_USERNAME=sandbox" >> .env

# 4. Restart
node src/index.js
```

Done! SMS will now send to real phones.

## Cost Estimate

**Africa's Talking Pricing:**
- SMS: UGX 35 per message (~$0.01)
- 1000 OTPs = UGX 35,000 (~$10)
- 10,000 OTPs = UGX 350,000 (~$100)

**For your app:**
- 100 users/day = UGX 3,500/day
- 3,000 users/month = UGX 105,000/month

## Summary

### Current Setup:
- ❌ No SMS sending
- ✅ OTP shows in app (dev mode)
- ✅ Works for testing
- ✅ Free

### To Enable SMS:
1. Sign up for Africa's Talking
2. Add credentials to .env
3. Restart backend
4. SMS will send automatically

**Files already created and ready:**
- ✅ `smsService.js` - Ready to use
- ✅ `authController.js` - Already integrated
- ✅ Just need API credentials

**Do you want to enable SMS now or keep testing with Alert popups?**
