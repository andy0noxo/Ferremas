@echo off
REM JMeter GUI Launcher - Windows
REM Opens JMeter GUI with a test plan
REM
REM Usage: open-jmeter.bat [scenario]
REM Examples:
REM   open-jmeter.bat                  (opens smoke test by default)
REM   open-jmeter.bat scenario_carga
REM   open-jmeter.bat scenario_estres

setlocal enabledelayedexpansion

REM Default scenario
set "SCENARIO=%1"
if "!SCENARIO!"=="" (
    set "SCENARIO=scenario_smoke"
)

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "TESTPLAN=!SCRIPT_DIR!testplans\!SCENARIO!.jmx"

echo.
echo ========================================
echo   JMeter GUI Launcher
echo ========================================
echo.
echo Opening test plan: !SCENARIO!.jmx
echo.

REM Check if test plan exists
if not exist "!TESTPLAN!" (
    echo ❌ ERROR: Test plan not found: !TESTPLAN!
    echo.
    echo Available scenarios:
    echo   - scenario_smoke
    echo   - scenario_carga
    echo   - scenario_estres
    echo   - scenario_resistencia
    echo.
    pause
    exit /b 1
)

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

echo ✅ Starting JMeter with test plan...
echo.

REM Open JMeter with the test plan
start "" jmeter -t "!TESTPLAN!"

echo.
echo ✅ JMeter is starting...
echo.
echo Tips:
echo   - Wait for JMeter to fully load
echo   - Right-click on Thread Group to add Listeners
echo   - Click Run (Ctrl+R) to start the test
echo   - Backend must be running: docker-compose up -d db backend
echo.

timeout /t 3 /nobreak
exit /b 0
