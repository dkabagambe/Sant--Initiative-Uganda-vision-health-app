#!/bin/bash

echo "🚀 Building Santé Initiative Uganda for Production"
echo "=================================================="
echo ""

# Check if logged into EAS
echo "📝 Checking EAS login status..."
npx eas whoami

if [ $? -ne 0 ]; then
    echo "❌ Not logged into EAS. Please run: npx eas login"
    exit 1
fi

echo ""
echo "✅ EAS login confirmed"
echo ""

# Show current version
echo "📱 Current app version:"
grep -A 1 '"version"' app.json | head -2
echo ""

# Confirm build
read -p "🔨 Build production AAB? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🏗️  Starting production build..."
    echo "⏱️  This will take 15-20 minutes"
    echo ""
    
    npx eas build --platform android --profile production
    
    echo ""
    echo "✅ Build submitted!"
    echo "📊 Check status: npx eas build:list"
    echo "⬇️  Download when ready: npx eas build:download"
else
    echo "❌ Build cancelled"
fi
