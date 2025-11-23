@echo off
echo 🛑 TERMINADOR DE PROCESOS DE PRUEBAS - FERREMAS
echo ================================================

echo 🔍 Buscando procesos de Chrome...
tasklist /FI "IMAGENAME eq chrome.exe" /FO TABLE

echo.
echo 🔍 Buscando procesos de Node...
tasklist /FI "IMAGENAME eq node.exe" /FO TABLE

echo.
echo ⚠️  ¿Deseas terminar TODOS los procesos de Chrome y Node? (S/N)
choice /c SN /m "Confirmar terminación"

if errorlevel 2 goto :cancelar
if errorlevel 1 goto :terminar

:terminar
echo.
echo 🛑 Terminando procesos de Chrome...
taskkill /F /IM chrome.exe /T 2>nul
if errorlevel 1 (
    echo ℹ️  No se encontraron procesos de Chrome activos
) else (
    echo ✅ Procesos de Chrome terminados
)

echo.
echo 🛑 Terminando procesos de Node...
taskkill /F /IM node.exe /T 2>nul
if errorlevel 1 (
    echo ℹ️  No se encontraron procesos de Node activos
) else (
    echo ✅ Procesos de Node terminados
)

echo.
echo 🛑 Terminando procesos de ChromeDriver...
taskkill /F /IM chromedriver.exe /T 2>nul
if errorlevel 1 (
    echo ℹ️  No se encontraron procesos de ChromeDriver activos
) else (
    echo ✅ Procesos de ChromeDriver terminados
)

echo.
echo ✅ Limpieza de procesos completada
echo 💡 Ahora puedes ejecutar las pruebas nuevamente
goto :fin

:cancelar
echo.
echo ❌ Operación cancelada
echo 💡 Los procesos permanecen activos

:fin
echo.
pause
