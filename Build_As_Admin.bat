@echo off
echo JTK Labs Photo Dir Manager - Build Script
echo ========================================
echo.
echo This script will build the application with administrator privileges.
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrator privileges.
) else (
    echo This script requires administrator privileges.
    echo Please run this script as an administrator.
    echo.
    echo Right-click on this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

echo.
echo Building application...
echo.

:: Navigate to the script directory
cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo Error: Node.js is not installed or not in the PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo Error: npm is not installed or not in the PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorLevel% neq 0 (
        echo Error: Failed to install dependencies.
        echo.
        pause
        exit /b 1
    )
)

:: Run the build command
echo Running build command...
call npm run build
if %errorLevel% neq 0 (
    echo.
    echo Error: Build failed.
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo The executable can be found in:
echo - dist\win-unpacked\JTK Labs Photo Dir Manager.exe
echo - dist\JTK Labs Photo Dir Manager.exe (portable)
echo.
echo You can also run the application using JTK_Labs_Photo_Dir_Manager.bat
echo.
pause