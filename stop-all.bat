@echo off
echo ========================================
echo    STOPPING QUIZ SYSTEM SERVERS
echo ========================================
echo.
echo Stopping all Node.js processes...
echo.

taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul

echo.
echo All servers stopped!
echo.
pause