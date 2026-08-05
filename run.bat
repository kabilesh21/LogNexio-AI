@echo off
TITLE Logixo AI Startup Control Panel
COLOR 0E
cls

echo =======================================================================
echo                 Logixo AI - Enterprise Startup Panel
echo =======================================================================
echo.
echo  This script will concurrently start:
echo   1. Backend Service (FastAPI on Uvicorn)
echo   2. Frontend Service (Vite Development Server)
echo.
echo =======================================================================
echo.

:: Launch backend in a separate terminal
echo [INFO] Launching Backend FastAPI Service...
start "Logixo AI Backend" cmd /k "cd /d \"%~dp0backend\" && .venv\Scripts\python.exe main.py"

:: Launch frontend in a separate terminal
echo [INFO] Launching Frontend React Service...
start "Logixo AI Frontend" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

echo.
echo [SUCCESS] Both services have been launched in separate console windows.
echo           To shut them down, close their respective windows.
echo.
echo =======================================================================
pause
