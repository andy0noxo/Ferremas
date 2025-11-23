# 📊 Sistema de Informes y Captura de Terminal

## 🎯 Descripción

Este sistema captura automáticamente toda la salida de terminal durante la ejecución de las pruebas automatizadas y genera informes completos en múltiples formatos.

## 🚀 Métodos de Ejecución

### 1. Script de PowerShell (Recomendado)
```powershell
# Ejecutar todas las pruebas con informe
.\run-tests.ps1

# Ejecutar una feature específica
.\run-tests.ps1 -Feature "01_RegistrarUsuario.feature"

# Ejecutar y abrir informe automáticamente
.\run-tests.ps1 -AbrirInforme

# Ejecutar feature específica y abrir informe
.\run-tests.ps1 -Feature "02_Login.feature" -AbrirInforme
```

### 2. Script Batch (Alternativa)
```batch
# Ejecutar todas las pruebas
run-tests.bat
```

### 3. Comando directo de Node.js
```bash
# Solo generar informe de última ejecución
npm run features:report

# Ejecutar prueba específica
npm run features:single -- features/01_RegistrarUsuario.feature
```

### 4. Comando tradicional (sin informe automático)
```bash
npm run features
```

## 📁 Estructura de Archivos Generados

```
_informes/
├── terminal_output_2025-11-22_14-30-15.txt    # Salida completa de terminal
├── execution_log_2025-11-22_14-30-15.log      # Log de ejecución
├── informe_pruebas_2025-11-22_14-30-15.html   # Informe visual HTML
└── informe_pruebas_2025-11-22_14-30-15.md     # Informe Markdown

_evidencias/
├── F01_Registrar_Usuario_Step01_*.png          # Screenshots por paso
├── F01_Registrar_Usuario_Step01_*.html         # HTML por paso
└── ...

_debug/
├── F01_Registrar_Usuario_CP22_*.png            # Screenshots finales
└── ...
```

## 📊 Tipos de Informes Generados

### 1. 📄 Salida de Terminal (`.txt`)
- Captura completa de toda la salida de consola
- Incluye colores y formato original
- Timestamps de inicio y fin
- Información de duración y código de salida

### 2. 🌐 Informe HTML (`.html`)
- Dashboard visual interactivo
- Métricas de escenarios y pasos
- Gráficos de estado (exitoso/fallido)
- Salida de terminal embebida
- Diseño responsive y profesional

### 3. 📝 Informe Markdown (`.md`)
- Formato legible para documentación
- Compatible con GitHub/GitLab
- Tablas de métricas
- Recomendaciones automáticas

### 4. 📋 Log de Ejecución (`.log`)
- Información detallada del proceso
- Errores y warnings específicos
- Metadata de la ejecución

### **5. 📊 Informe Excel Profesional** (¡NUEVO!)
- **Múltiples hojas organizadas:**
  - **Resumen Ejecutivo:** KPIs y métricas generales
  - **Detalle Casos:** Información completa de cada caso de prueba
  - **Estadísticas Features:** Análisis por funcionalidad
  - **Log de Errores:** Clasificación y severidad de errores
- **Columnas detalladas por caso:**
  - **ID Casos:** Identificador único (TC001, TC002, etc.)
  - **Funcionalidad:** Módulo o área funcional
  - **Nombre del caso de prueba:** Descripción completa
  - **Tiempo Ejecución (s):** Duración real del caso
  - **Tiempo de construcción (s):** Tiempo de preparación
  - **Estado:** PASSED/FAILED/UNDEFINED
  - **Avance %:** Porcentaje de completitud
  - **Observaciones:** Detalles y recomendaciones
  - **Feature:** Código de identificación
  - **Pasos Ejecutados:** Número total de pasos
  - **Pasos Fallidos:** Cantidad de errores
  - **Categoría:** Tipo de caso (Positivo/Negativo/Validación)
  - **Prioridad:** Alta/Media/Baja
  - **Complejidad:** Nivel de dificultad
  - **Tipo de Prueba:** Funcional/Validación/Integridad
  - **Módulo:** Área específica del sistema
  - **Evidencias:** Screenshots y HTML capturados

## 🎨 Características del Informe HTML

### Información Incluida:
- ✅ **Estado general** (Exitoso/Fallido)
- 📊 **Métricas de escenarios** (Total, Exitosos, Fallidos, Sin definir)
- 👣 **Métricas de pasos** (Total, Exitosos, Fallidos, Omitidos)
- 📋 **Lista de features ejecutadas**
- ❌ **Errores detectados** (si los hay)
- 💻 **Salida completa de terminal**
- ⏱️ **Tiempos de ejecución**
- 📅 **Timestamps detallados**

### Diseño Visual:
- 🎨 Diseño moderno y profesional
- 📱 Responsive (adaptable a móviles)
- 🌈 Código de colores para estados
- 📊 Cards organizadas por categorías
- 🔍 Salida de terminal con scroll

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# Personalizar directorio de informes
set INFORMES_DIR=custom_reports

# Configurar formato de timestamps
set TIMESTAMP_FORMAT=yyyy-MM-dd_HH-mm-ss
```

### Personalizar Análisis
El archivo `scripts/generar-informe.js` puede ser modificado para:
- Agregar nuevas métricas
- Cambiar formato de salida
- Personalizar análisis de errores
- Modificar diseño HTML

## 📈 Interpretación de Resultados

### Estados de Escenarios
- ✅ **Passed** - Escenario ejecutado exitosamente
- ❌ **Failed** - Escenario falló en algún paso
- ⚠️ **Undefined** - Escenario tiene pasos sin implementar
- ⏭️ **Skipped** - Escenario omitido por dependencias

### Estados de Pasos
- ✅ **Passed** - Paso ejecutado correctamente
- ❌ **Failed** - Paso falló durante ejecución
- ⚠️ **Undefined** - Paso no tiene implementación
- ⏭️ **Skipped** - Paso omitido por fallo anterior

### Códigos de Salida
- **0** - Ejecución exitosa
- **1** - Fallos en pruebas o errores de sistema
- **2** - Errores de configuración

## 🛠️ Solución de Problemas

### Problema: No se generan informes
```bash
# Verificar permisos de escritura
# Windows
icacls _informes /grant Users:F

# Verificar espacio en disco
dir /-c
```

### Problema: Script PowerShell no ejecuta
```powershell
# Cambiar política de ejecución (como administrador)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verificar política actual
Get-ExecutionPolicy
```

### Problema: Informe HTML no abre
```bash
# Verificar asociación de archivos .html
assoc .html

# Abrir manualmente
start chrome "path\to\informe.html"
```

### Problema: Captura de terminal incompleta
- El script usa `tee` para capturar salida en tiempo real
- En caso de problemas, revisar la instalación de herramientas de terminal
- Verificar que no hay redirecciones conflictivas

## 📊 Análisis de Métricas

### Métricas de Calidad
- **Tasa de éxito**: % de escenarios exitosos
- **Tiempo promedio**: Duración por escenario
- **Cobertura**: Features ejecutadas vs disponibles
- **Estabilidad**: Consistencia entre ejecuciones

### Recomendaciones Automáticas
El sistema genera recomendaciones basadas en:
- Código de salida de la ejecución
- Cantidad de fallos detectados
- Tipos de errores encontrados
- Cobertura de features

## 🔄 Integración Continua

### Para Jenkins/GitHub Actions
```yaml
# Ejemplo de integración
- name: Run Tests with Reports
  run: |
    powershell -File run-tests.ps1
    
- name: Upload Reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: _informes/
```

### Para Pipelines Locales
```bash
# Script de CI local
#!/bin/bash
./run-tests.ps1
if [ $? -eq 0 ]; then
    echo "✅ Tests passed, uploading reports..."
    # Subir informes a servidor
else
    echo "❌ Tests failed, check reports"
    exit 1
fi
```

## 📞 Soporte

Para problemas con el sistema de informes:
1. Verificar permisos de archivos en `_informes/`
2. Revisar logs en `execution_log_*.log`
3. Comprobar versión de Node.js
4. Verificar dependencias con `npm list`

---

*Sistema de Informes - Ferremas Testing Suite*  
*Generación automática de evidencias y reportes* 📊
