@echo off
title KIIP & TOPIK Desktop App for Windows PC
color 0b
echo ==============================================================
echo       KIIP & TOPIK Official Integration Portal for PC
echo ==============================================================
echo.
echo [1/3] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this PC!
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b
)

echo [2/3] Installing dependencies (first time only)...
if not exist node_modules (
    call npm install
)

echo [3/3] Launching KIIP & TOPIK PC App...
echo App will open in your browser or desktop window!
start http://localhost:3000
call npm run dev
pause
