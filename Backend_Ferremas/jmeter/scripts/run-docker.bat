@echo off
REM JMeter Docker Test Runner (Windows)
REM Executes JMeter tests inside Docker containers
REM
REM Usage: run-docker.bat [scenario]
REM Examples:
REM   run-docker.bat scenario_smoke
REM   run-docker.bat scenario_carga
REM   run-docker.bat scenario_estres

setlocal enabledelayedexpansion

REM Get paths
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."
set "PROJECT_ROOT=%PROJECT_DIR%\.."

REM Default scenario
if "%1"=="" (
  set "SCENARIO=scenario_smoke"
) else (
  set "SCENARIO=%1"
)

echo.
echo ============================================================
echo  JMeter Docker Test Runner ^(Windows^)
echo ============================================================
echo Scenario: %SCENARIO%
echo Project: %PROJECT_ROOT%
echo ============================================================
echo.

REM 1. Check Docker
echo [1/6] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Docker not found. Please install Docker.
  exit /b 1
)
echo OK - Docker found

docker ps >nul 2>&1
if errorlevel 1 (
  echo ERROR: Docker daemon not running. Please start Docker.
  exit /b 1
)
echo OK - Docker daemon running
echo.

REM 2. Validate test plan
echo [2/6] Validating test plan...
set "TESTPLAN=%PROJECT_DIR%\testplans\%SCENARIO%.jmx"
if not exist "%TESTPLAN%" (
  echo ERROR: Test plan not found: %TESTPLAN%
  exit /b 1
)
echo OK - Test plan found: %SCENARIO%.jmx
echo.

REM 3. Check test data
echo [3/6] Checking test data...
if not exist "%PROJECT_DIR%\data\usuarios.csv" (
  echo WARNING: usuarios.csv not found
  echo Run: node %PROJECT_DIR%\scripts\setup-fixtures.js
  set /p answer="Generate test data now? (y/n): "
  if /i "!answer!"=="y" (
    pushd "%PROJECT_ROOT%\Backend_Ferremas"
    call node jmeter\scripts\setup-fixtures.js
    popd
  ) else (
    echo Test data required. Exiting.
    exit /b 1
  )
)
echo OK - Test data available
echo.

REM 4. Check/Start services
echo [4/6] Checking main services...
docker-compose -f "%PROJECT_ROOT%\docker-compose.yml" ps | find "mysql" >nul
if errorlevel 1 (
  echo Tip: Main services not running. Start them with:
  echo   docker-compose -f docker-compose.yml up -d
  set /p answer="Start services now? (y/n): "
  if /i "!answer!"=="y" (
    docker-compose -f "%PROJECT_ROOT%\docker-compose.yml" up -d db backend
    echo Waiting 30 seconds for services...
    timeout /t 30
  )
)
echo OK - Services ready
echo.

REM 5. Build JMeter image
echo [5/6] Preparing JMeter Docker image...
docker image inspect jmeter-ferremas >nul 2>&1
if errorlevel 1 (
  echo Building JMeter image...
  docker build -t jmeter-ferremas -f "%PROJECT_DIR%\Dockerfile" "%PROJECT_DIR%"
  if errorlevel 1 (
    echo ERROR: Failed to build JMeter image
    exit /b 1
  )
)
echo OK - JMeter image ready
echo.

REM 6. Run JMeter
echo [6/6] Running JMeter test...
echo ============================================================

REM Generate timestamp for reports
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a-%%b)
set "TIMESTAMP=%mydate%_%mytime%"

set "RESULT_FILE=results_%SCENARIO%_%TIMESTAMP%.jtl"
set "REPORT_DIR=html-report-%SCENARIO%-%TIMESTAMP%"

docker run --rm ^
  --network=ferremas-network ^
  -v "%PROJECT_DIR%\testplans":/home/jmeter/testplans:ro ^
  -v "%PROJECT_DIR%\data":/home/jmeter/data:ro ^
  -v "%PROJECT_DIR%\config":/home/jmeter/config:ro ^
  -v "%PROJECT_DIR%\reports":/home/jmeter/reports ^
  -e SCENARIO="%SCENARIO%" ^
  -e RESULT_FILE="%RESULT_FILE%" ^
  -e REPORT_DIR="%REPORT_DIR%" ^
  -e BACKEND_HOST="backend" ^
  -e BACKEND_PORT="3000" ^
  jmeter-ferremas

if errorlevel 1 (
  echo.
  echo ERROR: Test failed
  exit /b 1
)

echo.
echo ============================================================
echo SUCCESS: Test completed!
echo.
echo View Results:
set "REPORT_PATH=%PROJECT_DIR%\reports\%REPORT_DIR%"
echo   Browser: %REPORT_PATH%\index.html
echo.
echo Open report: start "%REPORT_PATH%\index.html"
echo ============================================================
