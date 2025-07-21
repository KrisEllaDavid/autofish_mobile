#!/bin/bash

# AutoFish Mobile APK Build Script
# This script handles the complete build process from start to finish

set -e  # Exit on any error

echo "🚀 Starting AutoFish Mobile APK build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the autofish_mobile directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    print_warning "Android SDK environment variables not set. Make sure Android SDK is installed and configured."
fi

print_status "Installing dependencies..."
npm install

print_status "Generating Android icons from blue logo..."
npm run generate-icons

print_status "Building the web application..."
npm run build

print_status "Syncing with Capacitor..."
npx cap sync

print_status "Building Android APK..."
cd android
./gradlew assembleDebug
cd ..

print_success "APK build completed successfully!"
print_status "The APK file should be located in: android/app/build/outputs/apk/debug/"
print_status "You can find the APK file named: app-debug.apk"

# Optional: Open Android Studio
read -p "Do you want to open Android Studio to view the project? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Opening Android Studio..."
    npx cap open android
fi

print_success "Build process completed! 🎉" 