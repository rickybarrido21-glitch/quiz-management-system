@echo off
echo ========================================
echo    QUIZ SYSTEM - FIRST TIME SETUP
echo ========================================
echo.
echo This will install dependencies and start the system
echo.
echo Make sure you have:
echo - Node.js installed
echo - MongoDB running
echo.
echo Press any key to continue...
pause > nul

echo.
echo Installing root dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Creating test teacher account...
node test-teacher-registration.js

echo.
echo ========================================
echo Setup complete! Starting servers...
echo ========================================
echo.

call start-all.bat