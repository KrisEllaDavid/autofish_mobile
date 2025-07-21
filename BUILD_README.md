# AutoFish Mobile APK Build Guide

This guide explains how to build the AutoFish Mobile app APK using the new build system.

## Prerequisites

Before building the APK, make sure you have the following installed:

1. **Node.js** (v16 or higher)
2. **npm** (comes with Node.js)
3. **Android Studio** with Android SDK
4. **Java Development Kit (JDK)** 11 or higher

## Environment Setup

### Android SDK Setup
Make sure your Android SDK environment variables are set:

**Windows:**
```bash
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

**macOS/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
```

## Build Scripts

### Quick Build (Recommended)
For a quick build that generates icons and builds the APK:

```bash
npm run build-apk
```

### Full Build with Dependencies
For a complete build that installs dependencies and provides detailed feedback:

**Windows:**
```bash
npm run build-apk-full
# or directly:
build-apk.bat
```

**macOS/Linux:**
```bash
npm run build-apk-full
# or directly:
./build-apk.sh
```

## What Each Script Does

### `npm run build-apk`
1. Generates Android icons from the blue logo
2. Builds the web application
3. Syncs with Capacitor
4. Builds the Android APK

### `npm run build-apk-full`
1. Checks prerequisites (Node.js, npm, Android SDK)
2. Installs npm dependencies
3. Generates Android icons from the blue logo
4. Builds the web application
5. Syncs with Capacitor
6. Builds the Android APK
7. Provides detailed feedback and error handling

## Icon Generation

The build system automatically generates Android icons from the blue AutoFish logo (`public/icons/autofish_blue_logo.svg`). Icons are created for all Android densities:

- `mipmap-mdpi`: 48x48px
- `mipmap-hdpi`: 72x72px
- `mipmap-xhdpi`: 96x96px
- `mipmap-xxhdpi`: 144x144px
- `mipmap-xxxhdpi`: 192x192px

Both regular (`ic_launcher.png`) and round (`ic_launcher_round.png`) icons are generated.

## Output Location

After a successful build, the APK file will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

### Common Issues

1. **"Android SDK not found"**
   - Make sure Android Studio is installed
   - Set the ANDROID_HOME environment variable
   - Install Android SDK through Android Studio

2. **"Node.js not found"**
   - Install Node.js from https://nodejs.org/
   - Make sure it's added to your PATH

3. **"Build failed"**
   - Check that all dependencies are installed: `npm install`
   - Make sure you're in the correct directory (autofish_mobile)
   - Check the console output for specific error messages

4. **"Icon generation failed"**
   - Make sure the `sharp` package is installed: `npm install sharp`
   - Verify that `public/icons/autofish_blue_logo.svg` exists

### Manual Steps

If the automated build fails, you can run the steps manually:

```bash
# 1. Install dependencies
npm install

# 2. Generate icons
npm run generate-icons

# 3. Build web app
npm run build

# 4. Sync with Capacitor
npx cap sync

# 5. Build Android APK
npx cap build android
```

## Development

For development, use:
```bash
npm run dev
```

This starts the development server with hot reload.

## Opening in Android Studio

To open the project in Android Studio for debugging:
```bash
npm run android
```

## Notes

- The build process uses the blue AutoFish logo (`autofish_blue_logo.svg`) for the APK icon
- Icons are automatically generated with the correct Android specifications
- The build system includes error handling and progress feedback
- Both Windows and Unix-like systems are supported 