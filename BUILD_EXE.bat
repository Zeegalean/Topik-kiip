@echo off
setlocal enabledelayedexpansion
title KIIP & TOPIK - Auto Package .EXE for Windows PC
color 0a

echo ====================================================================
echo        KIIP ^& TOPIK Desktop App - Auto Package .EXE for Windows
echo ====================================================================
echo.

:: Ensure current working directory is the folder of this batch file
cd /d "%~dp0"

:: Check if package.json is in this folder or in kiip-topik-pc-app subfolder
if not exist "package.json" (
    if exist "kiip-topik-pc-app\package.json" (
        cd kiip-topik-pc-app
        echo Entered kiip-topik-pc-app folder...
    ) else (
        echo [ERROR] package.json not found in this folder!
        echo Please make sure this file is inside the extracted project folder.
        pause
        exit /b
    )
)

echo [1/4] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this PC!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b
)
node -v

echo.
echo [2/4] Installing project dependencies (npm install)...
call npm install

echo.
echo [3/4] Installing Electron packaging tools...
call npm install --save-dev electron electron-packager

echo.
echo [4/4] Building Web App and packaging into .EXE...
call npm run build
call npx electron-packager . "KIIP-TOPIK-App" --platform=win32 --arch=x64 --out=dist-pc --overwrite --icon=public/favicon.ico

echo.
echo ====================================================================
echo  SUCCESS! Your Windows PC Application has been created!
echo  Location: dist-pc\KIIP-TOPIK-App-win32-x64\KIIP-TOPIK-App.exe
echo ====================================================================
echo.

if exist "dist-pc\KIIP-TOPIK-App-win32-x64" (
    explorer "dist-pc\KIIP-TOPIK-App-win32-x64"
    start "" "dist-pc\KIIP-TOPIK-App-win32-x64\KIIP-TOPIK-App.exe"
)

pause
