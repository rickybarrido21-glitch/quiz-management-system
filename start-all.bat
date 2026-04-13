@echo off
echo ========================================
echo      QUIZ MANAGEMENT SYSTEM
echo ========================================
echo.
echo Starting both Backend and Frontend servers...
echo.
echo Backend will run on: http://localhost:3000
echo Frontend will run on: http://localhost:5173
echo.
echo Make sure MongoDB is running!
echo.
echo Press any key to start both servers...
pause > nul

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo.
echo Backend: http://localhost:3000/health
echo Frontend: http://localhost:5173
echo.
echo Login with: teacher@test.com / teacher123
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul