@echo off
echo ============================================
echo ACIK Management System - Installation Verification
echo ============================================
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js v18+
    pause
    exit /b 1
)
echo [OK] Node.js installed
echo.

echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
echo [OK] npm installed
echo.

echo Checking MongoDB...
mongod --version
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB not found in PATH
    echo If using Docker, this is OK
) else (
    echo [OK] MongoDB installed
)
echo.

echo Checking Docker...
docker --version
if %errorlevel% neq 0 (
    echo [WARNING] Docker not found
    echo Docker is optional but recommended
) else (
    echo [OK] Docker installed
)
echo.

echo Checking project structure...
if exist "backend\package.json" (
    echo [OK] Backend directory found
) else (
    echo [ERROR] Backend directory not found!
)

if exist "frontend\package.json" (
    echo [OK] Frontend directory found
) else (
    echo [ERROR] Frontend directory not found!
)
echo.

echo Checking configuration files...
if exist "backend\.env" (
    echo [OK] Backend .env found
) else (
    echo [WARNING] Backend .env not found - will use defaults
)

if exist "frontend\.env" (
    echo [OK] Frontend .env found
) else (
    echo [WARNING] Frontend .env not found - will use defaults
)
echo.

echo ============================================
echo Verification Complete!
echo ============================================
echo.
echo Next steps:
echo 1. With Docker: docker-compose up -d
echo 2. Without Docker:
echo    - Start MongoDB
echo    - cd backend && npm install && npm run seed && npm run dev
echo    - cd frontend && npm install && npm start
echo.
echo See START_HERE.md for detailed instructions
echo.
pause
