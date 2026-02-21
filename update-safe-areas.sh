#!/bin/bash

# Script to update all screens to use proper SafeAreaView

echo "🔧 Updating screens for proper safe area handling..."

# Find all screen files
SCREEN_FILES=$(find frontend/src/screens -name "*.tsx" -type f)

for file in $SCREEN_FILES; do
  # Check if file uses SafeAreaView from react-native
  if grep -q "SafeAreaView.*from.*react-native" "$file"; then
    echo "📝 Updating: $file"
    
    # Replace SafeAreaView import
    sed -i 's/SafeAreaView,/StatusBar,/g' "$file"
    sed -i '/from "react-native"/a import { SafeAreaView } from "react-native-safe-area-context";' "$file"
    
    # Add edges prop to SafeAreaView
    sed -i "s/<SafeAreaView style/<SafeAreaView style/g" "$file"
    
  fi
done

echo "✅ Done! All screens updated."
