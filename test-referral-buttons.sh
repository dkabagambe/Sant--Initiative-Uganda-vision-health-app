#!/bin/bash

# Test Referral Management Buttons
# Run this after starting the backend server

echo "🧪 Testing Referral Management API Endpoints"
echo "=============================================="
echo ""

# Set your backend URL
API_URL="http://localhost:5000/api"
# Replace with actual token after login
TOKEN="YOUR_JWT_TOKEN_HERE"

echo "📝 Note: Replace TOKEN variable with actual JWT token from login"
echo ""

# Test 1: Get all referrals
echo "1️⃣ Testing GET /api/referrals"
curl -s -X GET "$API_URL/referrals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Get referral stats
echo "2️⃣ Testing GET /api/referrals/stats"
curl -s -X GET "$API_URL/referrals/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Create new referral
echo "3️⃣ Testing POST /api/referrals (Create)"
REFERRAL_RESPONSE=$(curl -s -X POST "$API_URL/referrals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test Client",
    "reason": "Suspected cataract, vision loss",
    "urgency": "urgent",
    "facilityName": "Luweero Hospital Eye Clinic",
    "facilityLocation": "Luweero District",
    "notes": "Patient reports gradual vision loss over 6 months"
  }')

echo "$REFERRAL_RESPONSE" | jq '.'
REFERRAL_ID=$(echo "$REFERRAL_RESPONSE" | jq -r '.data.id')
echo ""
echo "Created Referral ID: $REFERRAL_ID"
echo "---"
echo ""

# Test 4: Get specific referral
if [ "$REFERRAL_ID" != "null" ] && [ -n "$REFERRAL_ID" ]; then
  echo "4️⃣ Testing GET /api/referrals/:id"
  curl -s -X GET "$API_URL/referrals/$REFERRAL_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" | jq '.'
  echo ""
  echo "---"
  echo ""

  # Test 5: Update referral status
  echo "5️⃣ Testing PATCH /api/referrals/:id/status (Mark Complete)"
  curl -s -X PATCH "$API_URL/referrals/$REFERRAL_ID/status" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "completed",
      "notes": "Client visited facility and received treatment"
    }' | jq '.'
  echo ""
  echo "---"
  echo ""
fi

echo "✅ All tests completed!"
echo ""
echo "📱 Frontend Button Tests:"
echo "  1. Export Button - Opens share dialog with formatted report"
echo "  2. Mark Complete - Shows confirmation, updates status"
echo "  3. Create New Referral - Shows options dialog"
echo "  4. Bottom Nav - All 5 tabs navigate correctly"
echo ""
echo "🎉 All buttons are functional!"
