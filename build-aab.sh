#!/bin/bash

# AutoFish Mobile AAB (Android App Bundle) Build Script for Linux/Mac
# This script handles the complete build process from start to finish

echo "🚀 Starting AutoFish Mobile AAB build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "[ERROR] package.json not found. Please run this script from the autofish_mobile directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed. Please install npm first."
    exit 1
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "[WARNING] Android SDK environment variables not set. Make sure Android SDK is installed and configured."
fi

echo "[INFO] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies."
    exit 1
fi

echo "[INFO] Generating Android icons from blue logo..."
npm run generate-icons
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to generate icons."
    exit 1
fi

echo "[INFO] Building the web application..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to build web application."
    exit 1
fi

echo "[INFO] Syncing with Capacitor..."
npx cap sync
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to sync with Capacitor."
    exit 1
fi

echo "[INFO] Building Android App Bundle (AAB) for release..."
cd android
./gradlew bundleRelease
BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -ne 0 ]; then
    echo "[ERROR] Failed to build Android App Bundle."
    exit 1
fi

echo ""
echo "✅ [SUCCESS] AAB build completed successfully!"
echo ""
echo "📦 [INFO] The AAB file is located at:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📝 [NOTE] This AAB is signed with debug keys."
echo "   For Google Play Store, you need to sign it with your release keystore."
echo ""
echo "🚀 [NEXT STEPS]"
echo "   1. Sign the AAB with your release keystore (jarsigner or Android Studio)"
echo "   2. Upload to Google Play Console"
echo "   3. Or use this for testing on devices"
echo ""

# Optional: Open the output folder (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Do you want to open the output folder? (y/n): " open_folder
    if [[ "$open_folder" =~ ^[Yy]$ ]]; then
        echo "[INFO] Opening output folder..."
        open android/app/build/outputs/bundle/release
    fi
fi

echo "[SUCCESS] Build process completed! 🎉"
