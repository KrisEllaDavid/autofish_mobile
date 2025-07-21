@echo off
setlocal enabledelayedexpansion

REM AutoFish Mobile APK Build Script for Windows
REM This script handles the complete build process from start to finish

echo 🚀 Starting AutoFish Mobile APK build process...

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

echo [INFO] Building Android APK...
cd android
call gradlew.bat assembleDebug
cd ..
if errorlevel 1 (
    echo [ERROR] Failed to build Android APK.
    pause
    exit /b 1
)

echo [SUCCESS] APK build completed successfully!
echo [INFO] The APK file should be located in: android\app\build\outputs\apk\debug\
echo [INFO] You can find the APK file named: app-debug.apk

REM Optional: Open Android Studio
set /p open_android="Do you want to open Android Studio to view the project? (y/n): "
if /i "!open_android!"=="y" (
    echo [INFO] Opening Android Studio...
    call npx cap open android
)

echo [SUCCESS] Build process completed! 🎉
pause 