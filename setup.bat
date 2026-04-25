@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   Job-O-Hire :: First-time Setup
echo ================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18 or later from https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not available.
    pause
    exit /b 1
)

echo [1/4] Node.js found:
node --version
echo.

echo [2/4] Installing backend dependencies...
echo --------------------------------------------
cd backend
call npm install
if errorlevel 1 (
    echo [ERROR] Backend npm install failed.
    cd ..
    pause
    exit /b 1
)

if not exist ".env" (
    if exist ".env.example" (
        echo.
        echo Creating backend\.env from .env.example...
        copy ".env.example" ".env" >nul
        echo [ACTION REQUIRED] Edit backend\.env and fill in:
        echo   - MONGO_URI         (from MongoDB Atlas)
        echo   - SECRET_KEY        (generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
        echo   - CLOUDINARY_*      (from Cloudinary dashboard)
    ) else (
        echo [WARNING] No backend\.env or .env.example found.
    )
) else (
    echo backend\.env already exists, skipping.
)
cd ..
echo.

echo [3/4] Installing frontend dependencies...
echo --------------------------------------------
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Frontend npm install failed.
    cd ..
    pause
    exit /b 1
)

if not exist ".env" (
    if exist ".env.example" (
        echo.
        echo Creating frontend\.env from .env.example...
        copy ".env.example" ".env" >nul
    ) else (
        echo VITE_API_BASE_URL="http://localhost:8000" > .env
        echo Created default frontend\.env pointing to localhost:8000
    )
) else (
    echo frontend\.env already exists, skipping.
)
cd ..
echo.

echo [4/4] Setup complete!
echo ================================================
echo.
echo Next steps:
echo   1. Open backend\.env and fill in real credentials (if not done).
echo   2. Run:  run.bat       to start both backend and frontend.
echo.
pause
