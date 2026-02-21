# 📱 Twilio SMS Setup Guide - Complete Walkthrough

## Step 1: Create Twilio Account

1. Go to **https://www.twilio.com/try-twilio**
2. Click **Sign up**
3. Fill in your details:
   - Email
   - Password
   - First & Last Name
4. Verify your email
5. Verify your phone number (they'll send you a code)

## Step 2: Get Your Credentials

After login, you'll see the **Twilio Console Dashboard**:

### A. Account SID & Auth Token
1. Look for the **Account Info** section (top right)
2. Copy **Account SID** (starts with `AC...`)
3. Copy **Auth Token** (click the eye icon to reveal)

### B. Get a Phone Number

#### Option 1: Trial Number (FREE - Limited)
- Click **Get a Trial Number**
- Accept the number they give you
- **Limitation:** Can ONLY send to verified numbers
- **Cost:** Free

#### Option 2: Buy a Number (RECOMMENDED for Production)
1. Go to **Phone Numbers** → **Buy a Number**
2. Select **Country: Uganda** (or your country)
3. Check **SMS** capability
4. Click **Search**
5. Choose a number and click **Buy**
6. **Cost:** ~$1-2/month + $0.0075 per SMS

## Step 3: Upgrade Account (Required for All Numbers)

**IMPORTANT:** Trial accounts can ONLY send to verified numbers!

### To Send to ANY Number:
1. Click **Billing** in left sidebar
2. Click **Upgrade your account**
3. Add payment method (credit card)
4. Add initial balance (recommended: $20)
5. Accept terms

### Pricing (Uganda):
- **SMS Cost:** $0.0075 per message
- **Phone Number:** $1-2/month
- **Example:** 1000 SMS = $7.50

## Step 4: Configure Your Backend

### A. Update `.env` file:

```bash
cd backend
nano .env
```

Add these lines (replace with YOUR values):

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here_32_characters
TWILIO_PHONE_NUMBER=+12345678900
```

**Where to find these:**
- `TWILIO_ACCOUNT_SID`: Console Dashboard → Account Info
- `TWILIO_AUTH_TOKEN`: Console Dashboard → Account Info (click eye icon)
- `TWILIO_PHONE_NUMBER`: Phone Numbers → Active Numbers (format: +12345678900)

### B. Install Twilio Package (if not installed):

```bash
cd backend
npm install twilio
```

## Step 5: Test SMS Sending

### A. Start your backend:
```bash
cd backend
npm start
```

### B. Test OTP:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0700123456"}'
```

**Check:**
- ✅ Console shows: "✅ OTP sent via Twilio"
- ✅ Phone receives SMS with OTP code
- ❌ If error: Check credentials in `.env`

## Step 6: Verify Phone Numbers (Trial Only)

If using **trial account**, you must verify each number first:

1. Go to **Phone Numbers** → **Verified Caller IDs**
2. Click **Add a new number**
3. Enter phone number (format: +256700123456)
4. Twilio sends verification code
5. Enter code to verify
6. Repeat for each test number

## Step 7: Deploy to Heroku

```bash
cd backend

# Set Twilio credentials on Heroku
heroku config:set TWILIO_ACCOUNT_SID=your_account_sid -a sante-production-app
heroku config:set TWILIO_AUTH_TOKEN=your_auth_token -a sante-production-app
heroku config:set TWILIO_PHONE_NUMBER=your_phone_number -a sante-production-app

# Deploy
git add .
git commit -m "Add Twilio SMS integration"
git push heroku master
```

## Troubleshooting

### Error: "The number is unverified"
**Solution:** Upgrade to paid account OR verify the number in Twilio Console

### Error: "Unable to create record: Invalid 'To' Phone Number"
**Solution:** Check phone number format. Must be: +256700123456 (not 0700123456)

### Error: "Authenticate"
**Solution:** Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in `.env`

### SMS not received
**Checklist:**
- ✅ Phone number format correct (+256...)
- ✅ Account has credit (check Billing)
- ✅ Number is verified (if trial account)
- ✅ Check Twilio logs: Console → Monitor → Logs → Messaging

## Testing Checklist

- [ ] Twilio account created
- [ ] Phone number purchased/obtained
- [ ] Account upgraded (if sending to all numbers)
- [ ] Credentials added to `.env`
- [ ] Backend restarted
- [ ] Test SMS sent successfully
- [ ] SMS received on phone
- [ ] OTP verification works
- [ ] Deployed to Heroku (optional)

## Cost Estimation

**For 1000 users/month:**
- Phone number: $2/month
- SMS (2 per user): 2000 × $0.0075 = $15/month
- **Total: ~$17/month**

## Alternative: Africa's Talking (Cheaper for Uganda)

If Twilio is expensive, consider **Africa's Talking**:
- **Cost:** $0.003 per SMS (half the price!)
- **Better coverage** in Uganda
- Setup guide: https://africastalking.com/

---

## Quick Reference

**Twilio Console:** https://console.twilio.com/
**Pricing:** https://www.twilio.com/sms/pricing
**Docs:** https://www.twilio.com/docs/sms

**Your credentials location:**
- Console → Account Info → Account SID
- Console → Account Info → Auth Token
- Console → Phone Numbers → Active Numbers

---

**Ready to go!** 🚀 Your SMS system is now configured.
