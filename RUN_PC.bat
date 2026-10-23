@echo off
title KIIP & TOPIK PC App Launcher
color 0b

cd /d "%~dp0"
if not exist "package.json" (
    if exist "kiip-topik-pc-app\package.json" (
        cd kiip-topik-pc-app
    )
)

echo ==============================================================
echo       KIIP & TOPIK Official Integration Portal for PC
echo ==============================================================
echo.
echo Checking dependencies...
if not exist node_modules (
    call npm install
)

echo Launching PC App at http://localhost:3000 ...
start http://localhost:3000
call npm run dev
pause
