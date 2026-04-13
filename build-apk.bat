@echo off
echo Building Quiz App APK...
echo.

cd android

echo Cleaning previous builds...
call gradlew clean

echo Building debug APK...
call gradlew assembleDebug

echo.
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK built successfully!
    echo Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo You can install this APK on your Android device.
) else (
    echo ❌ APK build failed. Check the output above for errors.
)

pause