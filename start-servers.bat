@echo off
echo Starting NSS Portal Servers...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && npm start"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0\client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5002
echo Frontend: http://localhost:3000
echo WiFi Access: http://10.193.17.97:3000
echo.
echo Press any key to exit...
pause > nul
