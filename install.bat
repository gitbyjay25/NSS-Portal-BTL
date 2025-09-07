@echo off
echo ================================================================================
echo                    NSS PORTAL - INSTALLATION SCRIPT
echo ================================================================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo Choose LTS version (recommended)
    pause
    exit /b 1
)
echo Node.js is installed ✓

echo.
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)
echo npm is installed ✓

echo.
echo Installing backend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)
echo Backend dependencies installed ✓

echo.
echo Installing frontend dependencies...
cd client
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed ✓

echo.
echo Creating environment file...
if not exist .env (
    echo MONGODB_URI=mongodb://localhost:27017/nss-portal > .env
    echo JWT_SECRET=your-secret-key-here >> .env
    echo JWT_EXPIRE=7d >> .env
    echo PORT=5002 >> .env
    echo Environment file created ✓
) else (
    echo Environment file already exists ✓
)

echo.
echo ================================================================================
echo                    INSTALLATION COMPLETED SUCCESSFULLY!
echo ================================================================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Update .env file with your settings
echo 3. Run: npm run start:all
echo.
echo Access points:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5002/api
echo.
pause
