@echo off
title CareerIQ AI Unified Platform
echo ===================================================
echo           Starting CareerIQ AI Platform
echo ===================================================
echo.
echo Launching Unified Server on Port 8000...
echo.
echo Web App:          http://localhost:8000/
echo Swagger API Docs: http://localhost:8000/docs
echo ===================================================
echo.

:: Open browser automatically after a brief delay
start "" http://localhost:8000/

:: Detect and activate backend directory
if exist "%~dp0backend\venv\Scripts\activate.bat" (
    cd /d "%~dp0backend"
    call venv\Scripts\activate
) else if exist "%~dp0careeriq-ai\backend\venv\Scripts\activate.bat" (
    cd /d "%~dp0careeriq-ai\backend"
    call venv\Scripts\activate
) else (
    echo Note: venv not detected directly. Using system Python...
    if exist "%~dp0backend" cd /d "%~dp0backend"
    if exist "%~dp0careeriq-ai\backend" cd /d "%~dp0careeriq-ai\backend"
)

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
