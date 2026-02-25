#!/bin/bash

echo "🔍 Testing Frontend Connection to Heroku Backend"
echo "================================================"
echo ""

# Test basic connectivity
echo "1. Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s https://sante-production-app-42dca70009b0.herokuapp.com/api/health)
if [[ $HEALTH_RESPONSE == *"OK"* ]]; then
    echo "✅ Health check: PASSED"
else
    echo "❌ Health check: FAILED"
    echo "Response: $HEALTH_RESPONSE"
fi

echo ""

# Test products endpoint
echo "2. Testing Products Endpoint..."
PRODUCTS_RESPONSE=$(curl -s https://sante-production-app-42dca70009b0.herokuapp.com/api/products)
if [[ $PRODUCTS_RESPONSE == *"success"* ]]; then
    echo "✅ Products API: PASSED"
    PRODUCT_COUNT=$(echo $PRODUCTS_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null || echo "0")
    echo "   📦 Products available: $PRODUCT_COUNT"
else
    echo "❌ Products API: FAILED"
fi

echo ""

# Test payments endpoint
echo "3. Testing Payments Endpoint..."
PAYMENTS_RESPONSE=$(curl -s https://sante-production-app-42dca70009b0.herokuapp.com/api/payments)
if [[ $PAYMENTS_RESPONSE == *"success"* ]]; then
    echo "✅ Payments API: PASSED"
    PAYMENT_COUNT=$(echo $PAYMENTS_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null || echo "0")
    echo "   💳 Payments available: $PAYMENT_COUNT"
else
    echo "❌ Payments API: FAILED"
fi

echo ""

# Test CORS headers
echo "4. Testing CORS Headers..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS https://sante-production-app-42dca70009b0.herokuapp.com/api/products)
if [[ $CORS_RESPONSE == *"Access-Control-Allow-Origin"* ]]; then
    echo "✅ CORS Headers: PASSED"
else
    echo "❌ CORS Headers: FAILED"
    echo "Response: $CORS_RESPONSE"
fi

echo ""
echo "================================================"
echo "📋 Frontend API Configuration:"
echo "   URL: https://sante-production-app-42dca70009b0.herokuapp.com/api"
echo "   Timeout: 30 seconds"
echo "   CORS: Enabled for all origins"
echo ""
echo "🚀 Next Steps:"
echo "   1. Restart your React Native app"
echo "   2. Test login/registration flow"
echo "   3. Test inventory and sales features"
echo "   4. Verify all API calls work from mobile app"
echo "================================================"
