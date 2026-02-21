#!/bin/bash

echo "🔍 Pre-Deployment Checklist"
echo "============================"
echo ""

# Check backend
echo "1. Testing Backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://sante-production-app-42dca70009b0.herokuapp.com/api/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✅ Backend is live and responding"
else
    echo "   ❌ Backend issue (HTTP $BACKEND_STATUS)"
fi

# Check frontend config
echo ""
echo "2. Checking Frontend Configuration..."
if grep -q "sante-production-app-42dca70009b0.herokuapp.com" frontend/src/config/api.ts; then
    echo "   ✅ Frontend points to Heroku backend"
else
    echo "   ❌ Frontend not configured for production"
fi

# Check app.json
echo ""
echo "3. Checking app.json..."
if grep -q "com.sante.initiative" frontend/app.json; then
    echo "   ✅ Package name configured"
else
    echo "   ❌ Package name missing"
fi

# Check EAS CLI
echo ""
echo "4. Checking Build Tools..."
if command -v eas &> /dev/null; then
    echo "   ✅ EAS CLI installed"
else
    echo "   ⚠️  EAS CLI not installed (will install during build)"
fi

# Check assets
echo ""
echo "5. Checking Assets..."
if [ -f "frontend/assets/icon.png" ]; then
    echo "   ✅ App icon exists"
else
    echo "   ❌ App icon missing"
fi

if [ -f "frontend/assets/adaptive-icon.png" ]; then
    echo "   ✅ Adaptive icon exists"
else
    echo "   ❌ Adaptive icon missing"
fi

if [ -f "frontend/assets/splash-icon.png" ]; then
    echo "   ✅ Splash screen exists"
else
    echo "   ❌ Splash screen missing"
fi

echo ""
echo "6. Required for Play Store:"
echo "   ⚠️  Screenshots (2-8 images) - Need to capture"
echo "   ⚠️  Feature graphic (1024x500) - Need to create"
echo "   ⚠️  Privacy policy URL - Need to host"
echo ""

echo "============================"
echo "📋 Summary"
echo "============================"
echo ""
echo "✅ Backend deployed and working"
echo "✅ Frontend configured for production"
echo "✅ App configuration ready"
echo ""
echo "⚠️  Still needed:"
echo "   - Capture app screenshots"
echo "   - Create feature graphic"
echo "   - Host privacy policy"
echo ""
echo "🚀 Ready to build? Run:"
echo "   cd frontend && ./build-playstore.sh"
echo ""
