@echo off
echo ========================================================
echo   Starting GIFT STUDIO Platform
echo ========================================================

:: Ensure G: drive is mapped correctly so G:\GIFT_STUDIO resolves
if not exist G:\GIFT_STUDIO\ (
    if exist G:\ (
        subst G: /d >nul 2>&1
    )
    for %%i in ("%~dp0..") do set "PARENT_DIR=%%~fi"
    echo Mapping G: drive to %PARENT_DIR%...
    subst G: "%PARENT_DIR%"
)


:: 1. Start Database
echo [1/3] Starting Embedded PostgreSQL on port 5433...
start "GIFT STUDIO - Database" cmd /k "cd /d %~dp0backend\apps\backend && node scripts\start-db.mjs"

:: Wait 4 seconds for Postgres to initialize
timeout /t 4 /nobreak >nul

:: 2. Start Medusa Backend
echo [2/3] Starting Medusa v2 Backend on port 9000...
start "GIFT STUDIO - Medusa Backend" cmd /k "cd /d %~dp0backend\apps\backend && npx medusa develop --port 9000 --no-lint"

:: Wait 12 seconds for Medusa to boot
timeout /t 12 /nobreak >nul

:: 3. Start Next.js Frontend with Turbopack for ultra-fast compilation
echo [3/3] Starting Shop.co Frontend on port 3000 (with Turbopack)...
start "GIFT STUDIO - Storefront" cmd /k "cd /d %~dp0frontend-shopco && npx next dev --turbo -p 3000"

echo ========================================================
echo   All Services Launched!
echo   - Customer Storefront: http://localhost:3000
echo   - Medusa Admin App:    http://localhost:9000/app
echo   - Database:            localhost:5433
echo ========================================================
pause
