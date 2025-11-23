@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Configuración
set PROJECT_ROOT=%~dp0
set INFORMES_DIR=%PROJECT_ROOT%_informes
set TIMESTAMP=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo.
echo 🚀 FERREMAS - EJECUTOR DE PRUEBAS AUTOMATIZADAS
echo ================================================
echo Timestamp: %date% %time%
echo Directorio: %PROJECT_ROOT%

:: Crear directorio de informes si no existe
if not exist "%INFORMES_DIR%" mkdir "%INFORMES_DIR%"

:: Cambiar al directorio del proyecto
cd /d "%PROJECT_ROOT%"

:: Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no está instalado o no está en PATH
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detectado: %NODE_VERSION%

:: Verificar dependencias
if not exist "node_modules" (
    echo ⚠️  node_modules no encontrado, instalando dependencias...
    npm install
)

:: Preparar archivos de salida
set OUTPUT_FILE=%INFORMES_DIR%\terminal_output_%TIMESTAMP%.txt
set LOG_FILE=%INFORMES_DIR%\execution_log_%TIMESTAMP%.log

:: Crear encabezado
echo FERREMAS - REGISTRO COMPLETO DE EJECUCIÓN DE PRUEBAS > "%OUTPUT_FILE%"
echo ==================================================== >> "%OUTPUT_FILE%"
echo Fecha de inicio: %date% %time% >> "%OUTPUT_FILE%"
echo Comando ejecutado: npm run features >> "%OUTPUT_FILE%"
echo ==================================================== >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

:: Mostrar información de inicio
echo.
echo 🔧 Comando a ejecutar: npm run features
echo ⏱️  Iniciando ejecución...
echo 📹 Capturando salida de terminal...
echo.

:: Ejecutar pruebas y capturar salida
set START_TIME=%time%
npm run features 2>&1 | tee "%OUTPUT_FILE%"
set EXIT_CODE=%errorlevel%
set END_TIME=%time%

:: Añadir información final al archivo
echo. >> "%OUTPUT_FILE%"
echo ==================================================== >> "%OUTPUT_FILE%"
echo RESUMEN DE EJECUCIÓN >> "%OUTPUT_FILE%"
echo ==================================================== >> "%OUTPUT_FILE%"
echo Hora de fin: %date% %time% >> "%OUTPUT_FILE%"
echo Código de salida: %EXIT_CODE% >> "%OUTPUT_FILE%"
if %EXIT_CODE% equ 0 (
    echo Estado: EXITOSO ✅ >> "%OUTPUT_FILE%"
) else (
    echo Estado: FALLIDO ❌ >> "%OUTPUT_FILE%"
)
echo ==================================================== >> "%OUTPUT_FILE%"

:: Mostrar resumen
echo.
echo ================================================
echo 📊 RESUMEN DE EJECUCIÓN
echo ================================================
echo 🔢 Código de salida: %EXIT_CODE%

if %EXIT_CODE% equ 0 (
    echo ✅ Estado: EXITOSO
    echo 🎉 ¡EJECUCIÓN COMPLETADA EXITOSAMENTE!
) else (
    echo ❌ Estado: FALLIDO
    echo ⚠️  EJECUCIÓN COMPLETADA CON ERRORES
    echo    Revisa los archivos de log para más detalles
)

echo.
echo 📁 ARCHIVOS GENERADOS:
echo    📄 Salida de terminal: %OUTPUT_FILE%
echo    📋 Log de ejecución: %LOG_FILE%

:: Intentar generar informe adicional
echo.
echo 🔄 Generando informes adicionales...
node "scripts/generar-informe.js" 2>nul
if errorlevel 1 (
    echo ⚠️  No se pudo generar el informe adicional
) else (
    echo ✅ Informes adicionales generados
)

:: Mostrar información de evidencias
if exist "_evidencias" (
    for /f %%i in ('dir "_evidencias" /b /a-d 2^>nul ^| find /c /v ""') do set EVIDENCIAS_COUNT=%%i
    echo    📸 Evidencias capturadas: !EVIDENCIAS_COUNT! archivos en _evidencias/
)

:: Buscar y mostrar informe HTML más reciente
for /f "delims=" %%i in ('dir "%INFORMES_DIR%\informe_pruebas_*.html" /b /o-d 2^>nul ^| head -1') do (
    set LATEST_HTML=%INFORMES_DIR%\%%i
    echo    🌐 Informe HTML: !LATEST_HTML!
)

echo.
echo ================================================

:: Preguntar si abrir informe
if defined LATEST_HTML (
    choice /c SN /m "¿Deseas abrir el informe HTML en el navegador? (S/N)"
    if !errorlevel! equ 1 (
        echo 🌐 Abriendo informe en navegador...
        start "" "!LATEST_HTML!"
    )
)

echo.
echo Presiona cualquier tecla para continuar...
pause >nul

exit /b %EXIT_CODE%
