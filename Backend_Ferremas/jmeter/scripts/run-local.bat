@echo off
REM JMeter Local Test Runner (Windows)
REM Executes JMeter tests locally (without Docker)
REM
REM Usage: run-local.bat [scenario]
REM Examples:
REM   run-local.bat scenario_smoke
REM   run-local.bat scenario_carga
REM   run-local.bat scenario_estres

setlocal enabledelayedexpansion

REM Get script directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."
set "TESTPLANS_DIR=%PROJECT_DIR%\testplans"
set "REPORTS_DIR=%PROJECT_DIR%\reports"
set "CONFIG_DIR=%PROJECT_DIR%\config"

REM Default scenario
if "%1"=="" (
  set "SCENARIO=scenario_smoke"
) else (
  set "SCENARIO=%1"
)

echo.
echo ============================================================
echo  JMeter Local Test Runner ^(Windows^)
echo ============================================================
echo Scenario: %SCENARIO%
echo Reports: %REPORTS_DIR%
echo ============================================================
echo.

REM 1. Validate JMeter installation
echo [1/7] Checking JMeter installation...
where jmeter >nul 2>&1
if errorlevel 1 (
  echo ERROR: JMeter not found in PATH
  echo Please install JMeter or add it to your PATH
  exit /b 1
)
echo OK - JMeter found
jmeter -v 2>&1 | find "version" >nul
echo.

REM 2. Validate test plan
echo [2/7] Validating test plan...
set "TEST_PLAN=%TESTPLANS_DIR%\%SCENARIO%.jmx"
if not exist "%TEST_PLAN%" (
  echo ERROR: Test plan not found: %TEST_PLAN%
  echo Available scenarios:
  for %%F in ("%TESTPLANS_DIR%\*.jmx") do (
    echo   - %%~nF
  )
  exit /b 1
)
echo OK - Test plan found
echo.

REM 3. Validate backend connectivity
echo [3/7] Checking backend connectivity...
set "BACKEND_HOST=localhost"
set "BACKEND_PORT=3000"
powershell -Command "try { Test-NetConnection -ComputerName %BACKEND_HOST% -Port %BACKEND_PORT% -WarningAction SilentlyContinue | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo WARNING: Cannot connect to backend at http://%BACKEND_HOST%:%BACKEND_PORT%
  echo Make sure Backend_Ferremas is running:
  echo   npm run dev
  set /p continue="Continue anyway? (y/n): "
  if /i not "!continue!"=="y" exit /b 1
) else (
  echo OK - Backend accessible
)
echo.

REM 4. Check test data
echo [4/7] Checking test data...
if not exist "%PROJECT_DIR%\data\usuarios.csv" (
  echo WARNING: usuarios.csv not found
)
if not exist "%PROJECT_DIR%\data\productos.csv" (
  echo WARNING: productos.csv not found
)
if exist "%PROJECT_DIR%\data\usuarios.csv" (
  echo OK - Test data available
)
echo.

REM 5. Create reports directory
echo [5/7] Creating reports directory...
if not exist "%REPORTS_DIR%" mkdir "%REPORTS_DIR%"
echo OK - Reports directory ready
echo.

REM 6. Generate timestamped report
echo [6/7] Generating report filename...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a-%%b)
set "TIMESTAMP=%mydate%_%mytime%"
set "RESULT_FILE=%REPORTS_DIR%\results_%SCENARIO%_%TIMESTAMP%.jtl"
set "REPORT_DIR=%REPORTS_DIR%\html-report-%SCENARIO%-%TIMESTAMP%"
echo Report: %REPORT_DIR%
echo.

REM 7. Run JMeter
echo [7/7] Starting JMeter test...
echo ============================================================
setlocal
set "HEAP=-Xmx2g -Xms1g"
set "BACKEND_HOST=localhost"
set "BACKEND_PORT=3000"

jmeter ^
  -n ^
  -t "%TEST_PLAN%" ^
  -l "%RESULT_FILE%" ^
  -j "%REPORTS_DIR%\jmeter-%SCENARIO%-%TIMESTAMP%.log" ^
  -e ^
  -o "%REPORT_DIR%" ^
  -Djmeter.save.saveservice.output_format=csv ^
  -Djmeter.save.saveservice.connect_timeout=10000 ^
  -Djmeter.save.saveservice.response_timeout=30000 ^
  -DBACKEND_HOST=%BACKEND_HOST% ^
  -DBACKEND_PORT=%BACKEND_PORT%

if errorlevel 1 (
  echo.
  echo ERROR: Test failed
  exit /b 1
)
endlocal

echo.
echo ============================================================
echo SUCCESS: Test completed!
echo.
echo View Results:
echo   Browser: %REPORT_DIR%\index.html
echo.
echo Try opening: start "%REPORT_DIR%\index.html"
echo ============================================================
