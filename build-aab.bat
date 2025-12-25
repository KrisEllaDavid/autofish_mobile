@echo off
setlocal enabledelayedexpansion

REM AutoFish Mobile AAB (Android App Bundle) Build Script for Windows
REM This script handles the complete build process from start to finish

echo 🚀 Starting AutoFish Mobile AAB build process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the autofish_mobile directory.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if Android SDK is available
if "%ANDROID_HOME%"=="" if "%ANDROID_SDK_ROOT%"=="" (
    echo [WARNING] Android SDK environment variables not set. Make sure Android SDK is installed and configured.
)

echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

echo [INFO] Generating Android icons from blue logo...
call npm run generate-icons
if errorlevel 1 (
    echo [ERROR] Failed to generate icons.
    pause
    exit /b 1
)

echo [INFO] Building the web application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build web application.
    pause
    exit /b 1
)

echo [INFO] Syncing with Capacitor...
call npx cap sync
if errorlevel 1 (
    echo [ERROR] Failed to sync with Capacitor.
    pause
    exit /b 1
)

echo [INFO] Building Android App Bundle (AAB) for release...
cd android
call gradlew.bat bundleRelease
cd ..
if errorlevel 1 (
    echo [ERROR] Failed to build Android App Bundle.
    pause
    exit /b 1
)

echo.
echo ✅ [SUCCESS] AAB build completed successfully!
echo.
echo 📦 [INFO] The AAB file is located at:
echo    android\app\build\outputs\bundle\release\app-release.aab
echo.
echo 📝 [NOTE] This AAB is signed with debug keys.
echo    For Google Play Store, you need to sign it with your release keystore.
echo.
echo 🚀 [NEXT STEPS]
echo    1. Sign the AAB with your release keystore (jarsigner or Android Studio)
echo    2. Upload to Google Play Console
echo    3. Or use this for testing on devices
echo.

REM Optional: Open the output folder
set /p open_folder="Do you want to open the output folder? (y/n): "
if /i "!open_folder!"=="y" (
    echo [INFO] Opening output folder...
    explorer android\app\build\outputs\bundle\release
)

echo [SUCCESS] Build process completed! 🎉
pause
