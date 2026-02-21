#!/bin/bash

echo "🚀 Building Santé Initiative for Google Play Store"
echo "=================================================="
echo ""

cd "$(dirname "$0")"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if logged in
echo "📝 Checking EAS login status..."
if ! eas whoami &> /dev/null; then
    echo "🔐 Please login to EAS:"
    eas login
fi

echo ""
echo "✅ Prerequisites checked"
echo ""
echo "🏗️  Starting production build for Android..."
echo "   This will take 10-20 minutes"
echo ""

# Build for production
eas build --platform android --profile production

echo ""
echo "✅ Build complete!"
echo ""
echo "📥 Next steps:"
echo "1. Download the .aab file from the link above"
echo "2. Go to https://play.google.com/console"
echo "3. Upload the .aab file to Production track"
echo "4. Complete store listing and submit for review"
echo ""
