@echo off
setlocal

echo ================================================
echo   Job-O-Hire :: Starting Dev Servers
echo ================================================
echo.

cd /d "%~dp0"

if not exist "backend\node_modules" (
    echo [ERROR] Backend dependencies not installed.
    echo Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not installed.
    echo Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "backend\.env" (
    echo [ERROR] backend\.env is missing.
    echo Please run setup.bat and fill in credentials.
    pause
    exit /b 1
)

echo Starting BACKEND  on http://localhost:8000  (in new window)
start "Job-O-Hire Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting FRONTEND on http://localhost:5173 (in new window)
start "Job-O-Hire Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ================================================
echo Both servers launching in separate windows.
echo Close those windows to stop the servers.
echo ================================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000/healthz
echo.
pause
