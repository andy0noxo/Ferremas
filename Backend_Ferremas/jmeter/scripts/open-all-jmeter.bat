@echo off
REM Open All JMeter Test Plans in GUI - Windows
REM Opens all 4 test plans in separate JMeter windows
REM
REM Usage: open-all-jmeter.bat

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=!SCRIPT_DIR!.."
set "TESTPLANS_DIR=!PROJECT_DIR!\testplans"

echo.
echo ════════════════════════════════════════════════
echo   JMeter GUI - Open All Test Plans
echo ════════════════════════════════════════════════
echo.

REM Check if JMeter is in PATH
where jmeter >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ ERROR: JMeter not found in PATH
    echo.
    echo Run: npm run jmeter:install
    echo.
    pause
    exit /b 1
)

REM Define test plans
set "SMOKE=!TESTPLANS_DIR!\scenario_smoke.jmx"
set "CARGA=!TESTPLANS_DIR!\scenario_carga.jmx"
set "ESTRES=!TESTPLANS_DIR!\scenario_estres.jmx"
set "RESISTENCIA=!TESTPLANS_DIR!\scenario_resistencia.jmx"

REM Check if test plans exist
for %%F in (!SMOKE! !CARGA! !ESTRES! !RESISTENCIA!) do (
    if not exist "%%F" (
        echo ❌ ERROR: Test plan not found: %%F
        echo.
        pause
        exit /b 1
    )
)

echo ✅ Starting all JMeter test plans...
echo.
echo Opening:
echo   1️⃣  Smoke Test (Quick validation)
echo   2️⃣  Load Test (100 concurrent users)
echo   3️⃣  Stress Test (500 concurrent users)
echo   4️⃣  Resistance Test (30 minutes)
echo.
echo 💡 Tip: Backend must be running before executing tests
echo    Command: docker-compose up -d db backend
echo.

REM Open all test plans in separate windows
start "JMeter - Smoke Test" jmeter -t "!SMOKE!"
timeout /t 2 /nobreak
start "JMeter - Load Test" jmeter -t "!CARGA!"
timeout /t 2 /nobreak
start "JMeter - Stress Test" jmeter -t "!ESTRES!"
timeout /t 2 /nobreak
start "JMeter - Resistance Test" jmeter -t "!RESISTENCIA!"

echo.
echo ✅ All JMeter windows are starting...
echo.
echo 📋 Workflow:
echo   1. Wait for all JMeter windows to load
echo   2. Right-click on Thread Group in each window
echo   3. Add → Listener → View Results Tree (recommended)
echo   4. Click Run (Ctrl+R) when ready
echo.

timeout /t 5 /nobreak
exit /b 0
