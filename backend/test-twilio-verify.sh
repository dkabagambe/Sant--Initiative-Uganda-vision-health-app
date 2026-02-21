#!/bin/bash

echo "📱 Testing Twilio Verify API..."
echo ""

# Your phone number
PHONE="0705686573"

echo "1️⃣ Sending OTP to $PHONE..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\"}"

echo ""
echo ""
echo "📱 Check your phone for the OTP SMS!"
echo ""
read -p "Enter the OTP code you received: " OTP

echo ""
echo "2️⃣ Verifying OTP: $OTP"
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"otp\": \"$OTP\"}"

echo ""
echo ""
echo "✅ Test complete!"
