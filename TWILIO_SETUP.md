# Twilio SMS Setup Guide

## Quick Setup (5 minutes)

### 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free trial account
3. Verify your email and phone number

### 2. Get Your Credentials
After signing up, you'll be on the Twilio Console:

1. **Account SID**: Copy from the dashboard
2. **Auth Token**: Click "Show" and copy
3. **Phone Number**: Click "Get a Trial Number" (free)

### 3. Configure Backend
Update `backend/.env` with your credentials:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Add Test Phone Numbers (Trial Account)
Trial accounts can only send to verified numbers:

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new number"
3. Enter your Ugandan phone number: +256700123456
4. Verify it with the code Twilio sends

### 5. Test It
Restart your backend:
```bash
cd backend
npm run dev
```

Try logging in with your verified phone number!

## Trial Account Limits
- **Free credits**: $15 USD
- **SMS cost**: ~$0.0075 per message (about 2000 free messages)
- **Restriction**: Can only send to verified numbers
- **Messages**: Include "Sent from your Twilio trial account"

## Upgrade to Production (Optional)
When ready for production:
1. Add payment method: https://console.twilio.com/billing
2. Upgrade account (no monthly fee, pay per SMS)
3. Remove trial restrictions
4. Messages won't include trial notice

## Troubleshooting

### "Unverified number" error
- Add the phone number to verified numbers in Twilio console

### "Invalid credentials" error
- Double-check Account SID and Auth Token in .env
- Make sure there are no extra spaces

### SMS not sending
- Check backend logs for error messages
- Verify phone number format: +256700123456
- Ensure you have trial credits remaining

## Cost Estimate (Production)
- Uganda SMS: ~$0.05 per message
- 1000 OTPs/month = $50/month
- No monthly fees, only pay for what you use

## Support
- Twilio Docs: https://www.twilio.com/docs/sms
- Console: https://console.twilio.com/
