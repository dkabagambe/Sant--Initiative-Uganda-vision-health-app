#!/bin/bash

echo "🧪 Testing OTP Flow..."
echo ""

# Test 1: Login and get OTP
echo "1️⃣ Requesting OTP for 0700123456..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0700123456"}')

echo "$RESPONSE"
OTP=$(echo "$RESPONSE" | grep -o '"otp":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "📱 OTP received: $OTP"
echo ""

# Test 2: Verify with correct OTP
echo "2️⃣ Verifying with CORRECT OTP ($OTP)..."
curl -s -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"0700123456\", \"otp\": \"$OTP\"}"
echo ""
echo ""

# Test 3: Verify with wrong OTP
echo "3️⃣ Verifying with WRONG OTP (999999)..."
curl -s -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0700123456", "otp": "999999"}'
echo ""
echo ""

echo "✅ Test complete!"
