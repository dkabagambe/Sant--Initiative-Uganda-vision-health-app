#!/bin/bash

# Quick test script for OTP functionality on Heroku

APP_NAME="sante-production-app"
API_URL="https://$APP_NAME.herokuapp.com/api"

echo "🧪 Testing OTP Flow on Heroku"
echo "================================"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing API Health..."
HEALTH=$(curl -s "$API_URL/health")
echo "$HEALTH" | jq '.'

if echo "$HEALTH" | grep -q '"status":"OK"'; then
  echo "✅ API is healthy"
else
  echo "❌ API health check failed"
  exit 1
fi

echo ""

# Test 2: Request OTP
echo "2️⃣ Requesting OTP for test number..."
PHONE="0700123456"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\"}")

echo "$LOGIN_RESPONSE" | jq '.'

OTP=$(echo "$LOGIN_RESPONSE" | jq -r '.otp')

if [ "$OTP" != "null" ] && [ -n "$OTP" ]; then
  echo "✅ OTP received: $OTP"
else
  echo "❌ Failed to get OTP"
  exit 1
fi

echo ""

# Test 3: Verify OTP
echo "3️⃣ Verifying OTP..."
VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE\", \"otp\": \"$OTP\"}")

echo "$VERIFY_RESPONSE" | jq '.'

TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ OTP verified successfully!"
  echo "🎉 Token received: ${TOKEN:0:20}..."
else
  echo "❌ OTP verification failed"
  exit 1
fi

echo ""
echo "================================"
echo "✅ All tests passed!"
echo "🎉 OTP system is working correctly on Heroku"
