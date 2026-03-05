#!/bin/bash

# Santé Initiative - AAB Build Script for Play Store
# This script builds the Android App Bundle (AAB) for Play Store deployment

echo "🚀 Building Santé Initiative AAB for Play Store..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check for EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g @expo/eas-cli
fi

# Check if user is logged in to EAS
echo "🔐 Checking EAS login status..."
if ! eas whoami &> /dev/null; then
    echo "📱 Please login to your Expo account:"
    eas login
fi

# Validate environment variables
echo "🔍 Validating environment variables..."

# Check if API URL is set to production
if grep -q "192.168" .env; then
    echo "⚠️  Warning: Local API URL detected in .env file"
    echo "📝 Make sure you're using the production Vercel URL for Play Store build"
    echo "   Current API URL: $(grep EXPO_PUBLIC_API_URL .env)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Build cancelled. Please update .env file first."
        exit 1
    fi
fi

# Check if app.json is configured for production
if [ ! -f "app.json" ]; then
    echo "❌ Error: app.json not found. Please create app.json configuration."
    exit 1
fi

# Run pre-build checks
echo "🔍 Running pre-build checks..."

# Check for TypeScript errors
echo "📝 Checking TypeScript..."
npx tsc --noEmit --skipLibCheck
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before building."
    exit 1
fi

# Check for linting errors (optional)
echo "🔍 Running ESLint..."
npx eslint src/ --max-warnings 10
if [ $? -ne 0 ]; then
    echo "⚠️  ESLint warnings found. Consider fixing them before production build."
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist-build/

# Build the AAB
echo "📦 Building Android App Bundle (AAB)..."
eas build --platform android --profile production

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! AAB build completed successfully!"
    echo ""
    echo "📱 Next steps for Play Store deployment:"
    echo "1. Download the AAB file from the link provided above"
    echo "2. Go to Google Play Console: https://play.google.com/console"
    echo "3. Upload the AAB file to your app"
    echo "4. Complete the store listing and release notes"
    echo "5. Submit for review"
    echo ""
    echo "🔗 Remote Configuration Features:"
    echo "- API URL: Can be updated remotely without new app release"
    echo "- Features: Can enable/disable features remotely"
    echo "- Maintenance Mode: Can put app in maintenance mode"
    echo "- Force Update: Can force users to update to latest version"
    echo ""
    echo "📊 Remote Config Endpoint: https://sante-initiative.vercel.app/api/remote-config"
    echo ""
else
    echo ""
    echo "❌ Build failed! Please check the error messages above."
    echo "🔧 Common issues:"
    echo "- Missing environment variables"
    echo "- Incorrect app.json configuration"
    echo "- Network connectivity issues"
    echo "- Expo account problems"
    echo ""
fi

echo "✨ Build script completed."
