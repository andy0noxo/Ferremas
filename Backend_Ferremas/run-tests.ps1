# Script de ejecución de pruebas con captura completa
# Ferremas - Sistema de Automatización de Pruebas

param(
    [string]$Feature = "",
    [switch]$AbrirInforme = $false,
    [switch]$ForzarTerminacion = $false
)

# Configuración
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$InformesDir = Join-Path $ProjectRoot "_informes"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Función para mostrar mensajes con colores
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Función para crear directorio si no existe
function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

# Función principal de ejecución
function Start-TestExecution {
    Write-ColorOutput "🚀 FERREMAS - EJECUTOR DE PRUEBAS AUTOMATIZADAS" "Cyan"
    Write-ColorOutput "================================================" "Gray"
    Write-ColorOutput "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Gray"
    Write-ColorOutput "Directorio: $ProjectRoot" "Gray"
    
    if ($Feature) {
        Write-ColorOutput "Feature específica: $Feature" "Yellow"
    } else {
        Write-ColorOutput "Ejecutando: TODAS las features" "Green"
    }
    
    Write-ColorOutput "================================================`n" "Gray"

    # Asegurar que existe el directorio de informes
    Ensure-Directory $InformesDir

    # Cambiar al directorio del proyecto
    Set-Location $ProjectRoot

    # Verificar que Node.js esté instalado
    try {
        $nodeVersion = node --version
        Write-ColorOutput "✅ Node.js detectado: $nodeVersion" "Green"
    } catch {
        Write-ColorOutput "❌ Error: Node.js no está instalado o no está en PATH" "Red"
        exit 1
    }

    # Verificar que las dependencias estén instaladas
    if (-not (Test-Path "node_modules")) {
        Write-ColorOutput "⚠️  node_modules no encontrado, instalando dependencias..." "Yellow"
        npm install
    }

    # Preparar comando
    if ($ForzarTerminacion) {
        $Command = if ($Feature) {
            "node scripts\run-tests-forced.js $Feature"
        } else {
            "node scripts\run-tests-forced.js"
        }
    } else {
        $Command = if ($Feature) {
            "npx cucumber-js --require ./features/support --require ./features/step_definitions features/$Feature"
        } else {
            "npm run features"
        }
    }

    Write-ColorOutput "🔧 Comando a ejecutar: $Command" "Cyan"
    Write-ColorOutput "⏱️  Iniciando ejecución..`n" "Yellow"

    # Capturar salida completa
    $StartTime = Get-Date
    $OutputFile = Join-Path $InformesDir "terminal_output_$Timestamp.txt"
    $LogFile = Join-Path $InformesDir "execution_log_$Timestamp.log"

    # Crear encabezado del archivo de salida
    $Header = @"
FERREMAS - REGISTRO COMPLETO DE EJECUCIÓN DE PRUEBAS
====================================================
Fecha de inicio: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Comando ejecutado: $Command
Feature específica: $(if ($Feature) { $Feature } else { "TODAS" })
====================================================

"@

    $Header | Out-File -FilePath $OutputFile -Encoding UTF8
    $Header | Out-File -FilePath $LogFile -Encoding UTF8

    try {
        # Ejecutar pruebas y capturar toda la salida
        Write-ColorOutput "📹 Capturando salida de terminal..." "Cyan"
        
        # Usar Start-Process para mejor control de la salida
        $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
        $ProcessInfo.FileName = "cmd"
        $ProcessInfo.Arguments = "/c $Command"
        $ProcessInfo.RedirectStandardOutput = $true
        $ProcessInfo.RedirectStandardError = $true
        $ProcessInfo.UseShellExecute = $false
        $ProcessInfo.CreateNoWindow = $false
        $ProcessInfo.WorkingDirectory = $ProjectRoot

        $Process = New-Object System.Diagnostics.Process
        $Process.StartInfo = $ProcessInfo

        # Eventos para capturar salida en tiempo real
        $OutputBuilder = New-Object System.Text.StringBuilder
        $ErrorBuilder = New-Object System.Text.StringBuilder
        
        $OutputAction = {
            if ($EventArgs.Data -ne $null) {
                $line = $EventArgs.Data
                Write-Host $line
                [void]$OutputBuilder.AppendLine($line)
                $line | Out-File -FilePath $OutputFile -Append -Encoding UTF8
            }
        }

        $ErrorAction = {
            if ($EventArgs.Data -ne $null) {
                $line = $EventArgs.Data
                Write-Host $line -ForegroundColor Red
                [void]$ErrorBuilder.AppendLine($line)
                "ERROR: $line" | Out-File -FilePath $OutputFile -Append -Encoding UTF8
            }
        }

        Register-ObjectEvent -InputObject $Process -EventName OutputDataReceived -Action $OutputAction | Out-Null
        Register-ObjectEvent -InputObject $Process -EventName ErrorDataReceived -Action $ErrorAction | Out-Null

        $Process.Start() | Out-Null
        $Process.BeginOutputReadLine()
        $Process.BeginErrorReadLine()
        $Process.WaitForExit()

        $ExitCode = $Process.ExitCode
        $EndTime = Get-Date
        $Duration = $EndTime - $StartTime

        # Limpiar eventos
        Get-EventSubscriber | Where-Object { $_.SourceObject -eq $Process } | Unregister-Event

        # Información final
        $Footer = @"

====================================================
RESUMEN DE EJECUCIÓN
====================================================
Hora de fin: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Duración total: $($Duration.TotalSeconds) segundos
Código de salida: $ExitCode
Estado: $(if ($ExitCode -eq 0) { "EXITOSO ✅" } else { "FALLIDO ❌" })
====================================================
"@

        $Footer | Out-File -FilePath $OutputFile -Append -Encoding UTF8
        $Footer | Out-File -FilePath $LogFile -Append -Encoding UTF8

        Write-ColorOutput "`n================================================" "Gray"
        Write-ColorOutput "📊 RESUMEN DE EJECUCIÓN" "Cyan"
        Write-ColorOutput "================================================" "Gray"
        Write-ColorOutput "⏰ Duración: $([math]::Round($Duration.TotalSeconds, 2)) segundos" "White"
        Write-ColorOutput "🔢 Código de salida: $ExitCode" "White"
        
        if ($ExitCode -eq 0) {
            Write-ColorOutput "✅ Estado: EXITOSO" "Green"
        } else {
            Write-ColorOutput "❌ Estado: FALLIDO" "Red"
        }

        Write-ColorOutput "`n📁 ARCHIVOS GENERADOS:" "Cyan"
        Write-ColorOutput "   📄 Salida de terminal: $OutputFile" "White"
        Write-ColorOutput "   📋 Log de ejecución: $LogFile" "White"

        # Generar informe completo con Excel usando el script de Node.js
        Write-ColorOutput "`n🔄 Generando informes completos (HTML, Excel, Markdown)..." "Yellow"
        
        try {
            if ($Feature) {
                & node "scripts/generar-informe.js" $Feature
                Write-ColorOutput "   ✅ Informe para feature $Feature generado" "Green"
            } else {
                & node "scripts/generar-informe.js"
                Write-ColorOutput "   ✅ Informe completo generado" "Green"
            }
        } catch {
            Write-ColorOutput "⚠️  No se pudo generar el informe completo: $_" "Yellow"
        }

        # Listar archivos de evidencias
        $EvidenciasDir = Join-Path $ProjectRoot "_evidencias"
        if (Test-Path $EvidenciasDir) {
            $EvidenciasCount = (Get-ChildItem $EvidenciasDir -File).Count
            Write-ColorOutput "   📸 Evidencias capturadas: $EvidenciasCount archivos en _evidencias/" "White"
        }

        # Buscar informes generados
        $InformesHTML = Get-ChildItem $InformesDir -Filter "informe_pruebas_*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        $InformesExcel = Get-ChildItem $InformesDir -Filter "informe_pruebas_*.xlsx" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        
        if ($InformesHTML) {
            Write-ColorOutput "   🌐 Informe HTML: $($InformesHTML.FullName)" "White"
        }
        
        if ($InformesExcel) {
            Write-ColorOutput "   📊 Informe Excel: $($InformesExcel.FullName)" "White"
        }
        
        if ($AbrirInforme) {
            if ($InformesHTML) {
                Write-ColorOutput "`n🌐 Abriendo informe HTML en navegador..." "Cyan"
                Start-Process $InformesHTML.FullName
            }
            if ($InformesExcel) {
                Write-ColorOutput "📊 Abriendo informe Excel..." "Cyan"
                Start-Process $InformesExcel.FullName
            }
        }

        Write-ColorOutput "`n================================================" "Gray"
        
        if ($ExitCode -eq 0) {
            Write-ColorOutput "🎉 ¡EJECUCIÓN COMPLETADA EXITOSAMENTE!" "Green"
        } else {
            Write-ColorOutput "⚠️  EJECUCIÓN COMPLETADA CON ERRORES" "Red"
            Write-ColorOutput "   Revisa los archivos de log para más detalles" "Yellow"
        }

        return $ExitCode

    } catch {
        Write-ColorOutput "`n❌ ERROR DURANTE LA EJECUCIÓN:" "Red"
        Write-ColorOutput $_.Exception.Message "Red"
        
        "ERROR FATAL: $($_.Exception.Message)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        return 1
    }
}

# Función para mostrar ayuda
function Show-Help {
    Write-ColorOutput "🧪 FERREMAS - EJECUTOR DE PRUEBAS AUTOMATIZADAS" "Cyan"
    Write-ColorOutput "===============================================" "Gray"
    Write-ColorOutput ""
    Write-ColorOutput "USO:" "Yellow"
    Write-ColorOutput "  .\run-tests.ps1                    # Ejecutar todas las pruebas" "White"
    Write-ColorOutput "  .\run-tests.ps1 -Feature 01_RegistrarUsuario.feature" "White"
    Write-ColorOutput "  .\run-tests.ps1 -AbrirInforme      # Abrir informe automáticamente" "White"
    Write-ColorOutput ""
    Write-ColorOutput "PARÁMETROS:" "Yellow"
    Write-ColorOutput "  -Feature <nombre>    Ejecutar solo una feature específica" "White"
    Write-ColorOutput "  -AbrirInforme        Abrir el informe HTML al finalizar" "White"
    Write-ColorOutput ""
    Write-ColorOutput "EJEMPLOS:" "Yellow"
    Write-ColorOutput "  .\run-tests.ps1 -Feature 01_RegistrarUsuario.feature -AbrirInforme" "White"
    Write-ColorOutput "  .\run-tests.ps1 -AbrirInforme" "White"
    Write-ColorOutput ""
    Write-ColorOutput "ARCHIVOS GENERADOS:" "Yellow"
    Write-ColorOutput "  📁 _informes/         - Informes y logs de ejecución" "White"
    Write-ColorOutput "  📁 _evidencias/       - Screenshots y HTML de cada paso" "White"
    Write-ColorOutput "  📁 _debug/            - Screenshots finales de escenarios" "White"
}

# Verificar parámetros de ayuda
if ($args -contains "-h" -or $args -contains "--help" -or $args -contains "/?") {
    Show-Help
    exit 0
}

# Ejecutar pruebas
$ExitCode = Start-TestExecution

# Pausar para ver resultados (opcional en modo interactivo)
if ($Host.Name -eq "ConsoleHost") {
    Write-ColorOutput "`nPresiona cualquier tecla para continuar..." "Gray"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

exit $ExitCode
