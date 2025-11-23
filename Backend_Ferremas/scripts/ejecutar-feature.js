#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { getIdMapping } = require('./generar-ids-secuenciales');

// Variables globales para capturar resultados
let testResults = [];
let executionLog = '';

// Función para generar informe Excel con casos de prueba individuales
function generateExcelReport(feature, exitCode, capturedOutput = '') {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
        const outputDir = path.join(__dirname, '..', '_informes');
        
        // Crear directorio si no existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Extraer casos de prueba individuales del archivo feature
        const testCases = extractTestCasesFromFeature(feature);
        const funcionality = getFeatureFunctionality(feature);
        
        // Procesar resultados reales si están disponibles
        const realResults = parseTestResults(capturedOutput, testCases);
        
        // Crear datos para cada caso de prueba
        const reportData = testCases.map((testCase, index) => {
            const result = realResults.find(r => r.id === testCase.id) || {};
            
            return {
                'ID Casos': testCase.id,
                'Funcionalidad': funcionality,
                'Nombre del caso de prueba': testCase.name,
                'Tiempo Ejecución (s)': result.executionTime || 'N/D',
                'Estado': result.status || 'NO_EJECUTADO',
                'Avance %': calculateProgress(result.status, result.errors),
                'Observaciones': generateObservations(result),
                'Timestamp': result.timestamp || new Date().toLocaleString('es-ES')
            };
        });
        
        // Si no se pudieron extraer casos individuales, crear uno genérico
        if (reportData.length === 0) {
            reportData.push({
                'ID Casos': 'CP01',
                'Funcionalidad': funcionality,
                'Nombre del caso de prueba': `${funcionality} - Casos generales`,
                'Tiempo Ejecución (s)': 'N/D',
                'Estado': exitCode === 0 ? 'PASSED' : 'FAILED',
                'Avance %': exitCode === 0 ? '100%' : '0%',
                'Observaciones': exitCode === 0 ? 'Ejecución exitosa' : 'Revisar errores en log',
                'Timestamp': new Date().toLocaleString('es-ES')
            });
        }
        
        // Crear libro Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Casos de Prueba');
        
        // Guardar archivo
        const excelFile = path.join(outputDir, `informe_${feature}_${timestamp}.xlsx`);
        XLSX.writeFile(workbook, excelFile);
        
        console.log(`📊 Informe Excel generado: ${excelFile}`);
        console.log(`   📋 ${reportData.length} casos de prueba documentados`);
        
    } catch (error) {
        console.error('❌ Error generando informe Excel:', error.message);
    }
}

// Función para extraer casos de prueba del archivo feature
function extractTestCasesFromFeature(feature) {
    try {
        // Extraer directamente del archivo feature tal como está escrito
        const featurePath = path.join(__dirname, '..', 'features', feature);
        const featureContent = fs.readFileSync(featurePath, 'utf8');
        
        const testCases = [];
        const lines = featureContent.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('Scenario:')) {
                const scenarioText = line.replace('Scenario:', '').trim();
                
                // Extraer el ID y nombre tal como está en el archivo
                const match = scenarioText.match(/^(CP\d+[a-z]*)\s+(.+)$/);
                if (match) {
                    const id = match[1];
                    const name = match[2];
                    
                    testCases.push({
                        id: id,
                        name: `${id} ${name}`,
                        status: 'PENDING',
                        progress: '0%',
                        observations: 'Caso de prueba extraído del archivo feature'
                    });
                } else {
                    // Fallback si no tiene el formato esperado
                    testCases.push({
                        id: `CP${String(testCases.length + 1).padStart(2, '0')}`,
                        name: scenarioText,
                        status: 'PENDING',
                        progress: '0%',
                        observations: 'Caso de prueba extraído del archivo feature'
                    });
                }
            }
        }
        
        return testCases;
    } catch (error) {
        console.error('Error extrayendo casos de prueba:', error.message);
        return [];
    }
}

// Función para obtener el nombre de la funcionalidad (feature)
function getFeatureFunctionality(feature) {
    // Devolver el nombre de la feature sin extensión
    return feature.replace('.feature', '');
}

// Variables globales para tracking de tiempo
let scenarioTimings = new Map();

// Función para procesar los resultados reales de la ejecución
function parseTestResults(output, testCases) {
    const results = [];
    
    if (!output) {
        return testCases.map(testCase => ({
            id: testCase.id,
            executionTime: 'N/D',
            status: 'NO_EJECUTADO',
            errors: []
        }));
    }
    
    try {
        console.log('🔍 Procesando resultados de ejecución...');
        
        const lines = output.split('\n');
        const scenarios = [];
        let currentScenario = null;
        let scenarioErrors = [];
        let inFailureSection = false;
        
        // Mapear nombres de escenario a IDs secuenciales - DECLARAR AL INICIO
        const scenarioNameMap = new Map();
        testCases.forEach(testCase => {
            // Extraer nombre del escenario sin el ID (ejemplo: "Login correcto" de "CP01a Login correcto")
            const parts = testCase.name.split(' ');
            const scenarioName = parts.slice(1).join(' '); // Quitar "CP01a" o "CP01"
            scenarioNameMap.set(scenarioName, testCase.id);
        });
        
        // Primera pasada: extraer tiempos de los mensajes de timing personalizados
        const timingMap = new Map();
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Buscar nuestros marcadores de tiempo personalizados
            if (line.includes('🚀 Iniciando escenario:')) {
                const match = line.match(/🚀 Iniciando escenario:\s*(CP\d+[a-z]*)\s+(.+)/);
                if (match) {
                    timingMap.set(match[1], { 
                        startTime: Date.now(), 
                        id: match[1],
                        name: match[2]
                    });
                }
            }
            
            // Buscar duración directa en los logs
            if (line.includes('⏱️  Duración:')) {
                const durationMatch = line.match(/⏱️  Duración:\s*(\d+\.?\d*)s/);
                if (durationMatch && currentScenario) {
                    const lastScenario = Array.from(timingMap.values()).pop();
                    if (lastScenario) {
                        lastScenario.duration = durationMatch[1];
                    }
                }
            }
            
            if (line.includes('✅ Escenario completado:') || line.includes('❌ Escenario completado:')) {
                const match = line.match(/(CP\d+[a-z]*)\s+.*\((PASSED|FAILED)\)/);
                if (match) {
                    const scenarioId = match[1];
                    const timing = timingMap.get(scenarioId);
                    if (timing) {
                        timing.status = match[2];
                        // Si ya no tenemos duración, calcular desde timestamps
                        if (!timing.duration) {
                            // Buscar la línea de duración en las siguientes líneas
                            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                                const durLine = lines[j];
                                const durMatch = durLine.match(/⏱️  Duración:\s*(\d+\.?\d*)s/);
                                if (durMatch) {
                                    timing.duration = durMatch[1];
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Segunda pasada: buscar tiempos de Cucumber (formato: XXXms)
        const cucumberTimes = new Map();
        let currentScenarioId = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Detectar inicio de escenario para context
            if (line.includes('Scenario:') && (line.includes('CP') || line.includes('#'))) {
                const match = line.match(/Scenario:\s*(CP\d+[a-z]*)/);
                if (match) {
                    currentScenarioId = match[1];
                }
            }
            
            // Buscar tiempos en milisegundos (formato Cucumber)
            const timeMatch = line.match(/(\d+\.?\d*)\s*ms/);
            if (timeMatch && currentScenarioId) {
                const timeInSeconds = (parseFloat(timeMatch[1]) / 1000).toFixed(2);
                if (!cucumberTimes.has(currentScenarioId) || parseFloat(timeInSeconds) > parseFloat(cucumberTimes.get(currentScenarioId))) {
                    cucumberTimes.set(currentScenarioId, timeInSeconds);
                }
            }
        }
        
        // Tercera pasada: buscar tiempo total en el resumen final
        let totalExecutionTime = null;
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            const totalTimeMatch = line.match(/(\d+m\d+\.\d+s)\s*\(executing steps/);
            if (totalTimeMatch) {
                totalExecutionTime = totalTimeMatch[1];
                console.log(`⏱️  Tiempo total de ejecución: ${totalExecutionTime}`);
                break;
            }
        }
        
        // Procesar errores y estados con más detalle
        inFailureSection = false;
        const errorMap = new Map();
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('Failures:')) {
                inFailureSection = true;
                continue;
            }
            
            if (inFailureSection) {
                const failMatch = line.match(/Scenario:\s*(CP\d+[a-z]*)\s+(.+)/);
                if (failMatch) {
                    const originalId = failMatch[1]; // CP02, CP03, etc. (original del feature)
                    const scenarioName = failMatch[2]; // "Login vacío", etc.
                    const errors = [];
                    
                    // Mapear el ID original al ID secuencial
                    let sequentialId = originalId;
                    const mappedId = scenarioNameMap.get(scenarioName);
                    if (mappedId) {
                        sequentialId = mappedId;
                    } else {
                        // Buscar por nombre parcial
                        for (const [name, id] of scenarioNameMap) {
                            if (name.includes(scenarioName) || scenarioName.includes(name)) {
                                sequentialId = id;
                                break;
                            }
                        }
                    }
                    
                    // Buscar errores específicos con más contexto
                    for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
                        const errorLine = lines[j];
                        
                        // Capturar diferentes tipos de errores
                        if (errorLine.includes('Error:') || errorLine.includes('AssertionError') || 
                            errorLine.includes('timeout') || errorLine.includes('WebDriverError') ||
                            errorLine.includes('NoSuchElementError') || errorLine.includes('ECONNREFUSED') ||
                            errorLine.includes('Connection refused') || errorLine.includes('404') ||
                            errorLine.includes('500') || errorLine.includes('Internal Server Error') ||
                            errorLine.includes('function timed out')) {
                            
                            errors.push(errorLine.trim());
                            
                            // Capturar líneas adicionales de contexto para errores específicos
                            if (errorLine.includes('NoSuchElementError') && j + 1 < lines.length) {
                                const nextLine = lines[j + 1];
                                if (nextLine.includes('Session info') || nextLine.includes('selector')) {
                                    errors.push(nextLine.trim());
                                }
                            }
                            break;
                        }
                        
                        // También buscar líneas que indiquen el paso que falló
                        if (errorLine.includes('×') && (errorLine.includes('Then ') || errorLine.includes('When ') || errorLine.includes('Given '))) {
                            errors.push(`Paso fallido: ${errorLine.trim()}`);
                        }
                    }
                    
                    // Si no se encontraron errores específicos, buscar en el contexto general
                    if (errors.length === 0) {
                        if (output.includes(`❌ Escenario completado: ${originalId} ${scenarioName} (FAILED)`)) {
                            errors.push('Escenario marcado como fallido - revisar log detallado');
                        }
                    }
                    
                    console.log(`🔗 Mapeando error: ${originalId} (${scenarioName}) → ${sequentialId}`);
                    errorMap.set(sequentialId, errors);
                }
                
                // Terminar sección de failures
                if (line.match(/\d+\s+scenarios?\s*\(/)) {
                    inFailureSection = false;
                }
            }
        }
        
        // También capturar errores que aparecen fuera de la sección Failures
        const generalErrorPatterns = [
            /Error:/,
            /AssertionError:/,
            /WebDriverError:/,
            /NoSuchElementError:/,
            /TimeoutError:/,
            /ECONNREFUSED/,
            /Connection refused/
        ];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const pattern of generalErrorPatterns) {
                if (pattern.test(line)) {
                    // Buscar si este error corresponde a algún escenario específico
                    for (let j = Math.max(0, i - 10); j < i; j++) {
                        const contextLine = lines[j];
                        if (contextLine.includes('🚀 Iniciando escenario:')) {
                            const match = contextLine.match(/🚀 Iniciando escenario:\s*(CP\d+[a-z]*)/);
                            if (match) {
                                const scenarioId = match[1];
                                const sequentialId = scenarioNameMap.get(scenarioId) || scenarioId;
                                if (!errorMap.has(sequentialId)) {
                                    errorMap.set(sequentialId, [line.trim()]);
                                }
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }
        
        // Crear mapas para procesamiento
        const durationMap = new Map();
        const timestampMap = new Map();
        let currentScenarioName = null;
        let scenarioIndex = 0;
        
        // También capturar timestamps individuales
        let currentScenarioForTimestamp = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('🚀 Iniciando escenario:')) {
                const match = line.match(/🚀 Iniciando escenario:\s*CP\d+[a-z]*\s+(.+)/);
                if (match) {
                    currentScenarioName = match[1].trim();
                    currentScenarioForTimestamp = currentScenarioName;
                }
            }
            
            // Capturar timestamp de inicio
            if (line.includes('⏰ Timestamp inicio:') && currentScenarioForTimestamp) {
                const timestampMatch = line.match(/⏰ Timestamp inicio:\s*(.+)/);
                if (timestampMatch) {
                    const sequentialId = scenarioNameMap.get(currentScenarioForTimestamp);
                    if (sequentialId) {
                        const startTime = new Date(timestampMatch[1]);
                        timestampMap.set(sequentialId, {
                            startTime: startTime,
                            startTimestamp: startTime.toLocaleString('es-ES')
                        });
                    }
                }
            }
            
            // Capturar timestamp de fin y calcular timestamp final
            if (line.includes('⏰ Timestamp fin:') && currentScenarioForTimestamp) {
                const timestampMatch = line.match(/⏰ Timestamp fin:\s*(.+)/);
                if (timestampMatch) {
                    const sequentialId = scenarioNameMap.get(currentScenarioForTimestamp);
                    if (sequentialId) {
                        const endTime = new Date(timestampMatch[1]);
                        const existing = timestampMap.get(sequentialId) || {};
                        timestampMap.set(sequentialId, {
                            ...existing,
                            endTime: endTime,
                            endTimestamp: endTime.toLocaleString('es-ES')
                        });
                    }
                }
            }
            
            if (line.includes('⏱️  Duración:') && currentScenarioName) {
                const durationMatch = line.match(/⏱️  Duración:\s*(\d+\.?\d*)s/);
                if (durationMatch) {
                    // Buscar el ID secuencial que corresponde a este nombre de escenario
                    const sequentialId = scenarioNameMap.get(currentScenarioName);
                    if (sequentialId) {
                        durationMap.set(sequentialId, durationMatch[1]);
                    } else {
                        // Fallback: usar por orden de aparición
                        if (scenarioIndex < testCases.length) {
                            durationMap.set(testCases[scenarioIndex].id, durationMatch[1]);
                            scenarioIndex++;
                        }
                    }
                    currentScenarioName = null;
                    currentScenarioForTimestamp = null;
                }
            }
        }
        
        // Construir resultados finales
        testCases.forEach((testCase, index) => {
            const scenarioId = testCase.id;
            const timing = timingMap.get(scenarioId);
            const duration = durationMap.get(scenarioId);
            const cucumberTime = cucumberTimes.get(scenarioId);
            const errors = errorMap.get(scenarioId) || [];
            
            // Determinar el mejor tiempo disponible (priorizar duración capturada directamente)
            let executionTime = 'N/D';
            if (duration && parseFloat(duration) > 0) {
                executionTime = duration;
            } else if (timing && timing.duration && parseFloat(timing.duration) > 0) {
                executionTime = timing.duration;
            } else if (cucumberTime && parseFloat(cucumberTime) > 0) {
                executionTime = cucumberTime;
            } else if (totalExecutionTime && testCases.length > 0) {
                // Estimar tiempo por escenario basado en el total
                const totalSeconds = parseTimeString(totalExecutionTime);
                if (totalSeconds > 0) {
                    executionTime = (totalSeconds / testCases.length).toFixed(2);
                }
            }
            
            // Determinar estado basado en el nombre del escenario (más preciso)
            let status = 'UNKNOWN';
            const scenarioName = testCase.name.split(' ').slice(1).join(' '); // Nombre sin CP##
            
            // Buscar en el output por nombre de escenario
            const passedPattern = new RegExp(`✅\\s*Escenario completado:\\s*CP\\d+[a-z]*\\s+${scenarioName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(PASSED\\)`);
            const failedPattern = new RegExp(`❌\\s*Escenario completado:\\s*CP\\d+[a-z]*\\s+${scenarioName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(FAILED\\)`);
            
            if (passedPattern.test(output)) {
                status = 'PASSED';
            } else if (failedPattern.test(output)) {
                status = 'FAILED';
            } else if (timing && timing.status) {
                status = timing.status;
            } else if (errors.length > 0) {
                status = 'FAILED';
            } else {
                // Verificar si el escenario fue mencionado de alguna forma
                if (output.includes(scenarioName)) {
                    status = 'PASSED'; // Si se menciona pero no hay errores específicos
                } else {
                    status = 'NO_EJECUTADO';
                }
            }
            
            // Obtener timestamp específico para este caso
            const timestampInfo = timestampMap.get(scenarioId);
            let timestamp = new Date().toLocaleString('es-ES'); // Fallback al timestamp actual
            
            if (timestampInfo) {
                // Priorizar timestamp de fin (cuando se completó), luego inicio
                timestamp = timestampInfo.endTimestamp || timestampInfo.startTimestamp || timestamp;
            }
            
            results.push({
                id: testCase.id,
                executionTime: executionTime,
                status: status,
                errors: errors,
                timestamp: timestamp
            });
        });
        
        console.log(`📊 Procesados ${results.length} casos de prueba`);
        results.forEach(r => {
            console.log(`   ${r.id}: ${r.executionTime}s (${r.status})`);
        });
        
    } catch (error) {
        console.error('Error procesando resultados:', error.message);
        return testCases.map(testCase => ({
            id: testCase.id,
            executionTime: 'N/D',
            status: 'ERROR_PROCESAMIENTO',
            errors: [error.message]
        }));
    }
    
    return results;
}

// Función auxiliar para convertir tiempo string a segundos
function parseTimeString(timeStr) {
    try {
        const match = timeStr.match(/(\d+)m(\d+\.?\d*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseFloat(match[2]);
            return minutes * 60 + seconds;
        }
        return 0;
    } catch (error) {
        return 0;
    }
}

// Función para calcular el porcentaje de progreso
function calculateProgress(status, errors = []) {
    switch (status) {
        case 'PASSED':
            return '100%';
        case 'FAILED':
            // Calcular progreso basado en tipo de error
            if (errors.length > 0) {
                const errorText = errors.join(' ').toLowerCase();
                if (errorText.includes('timeout') || errorText.includes('element not found')) {
                    return '75%'; // Llegó lejos pero falló en interacción
                } else if (errorText.includes('assertion') || errorText.includes('expected')) {
                    return '90%'; // Completó pasos pero falló en verificación
                } else if (errorText.includes('login') || errorText.includes('auth')) {
                    return '25%'; // Falló temprano en login
                } else {
                    return '50%'; // Error medio
                }
            }
            return '10%'; // Falló sin detalles
        case 'SKIPPED':
            return '0%';
        case 'EJECUTADO':
            return '85%'; // Se ejecutó pero sin detalles específicos
        case 'ERROR_PROCESAMIENTO':
            return '5%';
        case 'NO_EJECUTADO':
        default:
            return '0%';
    }
}

// Función para generar observaciones basadas en resultados
function generateObservations(result = {}) {
    const { status, errors = [], executionTime } = result;
    
    switch (status) {
        case 'PASSED':
            const timeNote = executionTime && executionTime !== 'N/D' ? ` en ${executionTime}s` : '';
            
            // Verificar si el tiempo indica algún problema de performance
            const timeValue = parseFloat(executionTime || '0');
            if (timeValue > 30) {
                return `✅ Caso ejecutado exitosamente${timeNote}. ⚠️ Tiempo de ejecución elevado - revisar performance.`;
            } else if (timeValue > 20) {
                return `✅ Caso ejecutado exitosamente${timeNote}. Tiempo de ejecución aceptable.`;
            } else {
                return `✅ Caso ejecutado exitosamente${timeNote}. Todas las validaciones pasaron correctamente.`;
            }
            
        case 'FAILED':
            if (errors.length > 0) {
                const firstError = errors[0];
                let errorType = '';
                let specificMessage = '';
                let suggestion = '';
                
                // Análisis detallado de tipos de error
                if (firstError.includes('function timed out') || firstError.includes('timeout')) {
                    errorType = 'TIMEOUT';
                    if (firstError.includes('30000 milliseconds')) {
                        specificMessage = 'El paso excedió el límite de 30 segundos de espera';
                        suggestion = 'Verificar que el elemento esperado aparezca en la página o aumentar timeout';
                    } else {
                        specificMessage = 'Operación demoró más tiempo del esperado';
                        suggestion = 'Revisar performance del sistema o conectividad';
                    }
                } else if (firstError.includes('NoSuchElementError') || firstError.includes('element not found')) {
                    errorType = 'ELEMENTO NO ENCONTRADO';
                    if (firstError.includes('css selector')) {
                        const selectorMatch = firstError.match(/css selector","selector":"([^"]+)"/);
                        const selector = selectorMatch ? selectorMatch[1] : 'selector no identificado';
                        specificMessage = `No se pudo localizar el elemento con selector: ${selector}`;
                        suggestion = 'Verificar que el selector CSS sea correcto y el elemento esté presente en la página';
                    } else {
                        specificMessage = 'Elemento de la interfaz no localizado';
                        suggestion = 'Verificar selectores y timing de carga de la página';
                    }
                } else if (firstError.includes('AssertionError')) {
                    errorType = 'VALIDACIÓN FALLIDA';
                    specificMessage = 'El resultado obtenido no coincide con el esperado';
                    suggestion = 'Revisar datos de prueba y comportamiento esperado del sistema';
                } else if (firstError.includes('WebDriverError')) {
                    errorType = 'ERROR DE WEBDRIVER';
                    specificMessage = 'Problema en la comunicación con el navegador';
                    suggestion = 'Verificar configuración del navegador y drivers actualizados';
                } else if (firstError.includes('Connection refused') || firstError.includes('ECONNREFUSED')) {
                    errorType = 'ERROR DE CONEXIÓN';
                    specificMessage = 'No se pudo conectar al servidor de aplicación';
                    suggestion = 'Verificar que el servidor esté ejecutándose en http://127.0.0.1:8000';
                } else if (firstError.includes('404') || firstError.includes('Not Found')) {
                    errorType = 'PÁGINA NO ENCONTRADA';
                    specificMessage = 'La URL solicitada no está disponible';
                    suggestion = 'Verificar que la ruta de la aplicación sea correcta';
                } else if (firstError.includes('500') || firstError.includes('Internal Server Error')) {
                    errorType = 'ERROR DEL SERVIDOR';
                    specificMessage = 'Error interno en el servidor de aplicación';
                    suggestion = 'Revisar logs del servidor y estado de la base de datos';
                } else {
                    errorType = 'ERROR NO CATEGORIZADO';
                    specificMessage = firstError.length > 100 ? 
                        firstError.substring(0, 100) + '...' : firstError;
                    suggestion = 'Revisar log completo para diagnóstico detallado';
                }
                
                return `❌ ${errorType}: ${specificMessage}. 💡 ${suggestion}`;
            }
            return '❌ Caso falló durante la ejecución sin detalles específicos. Revisar logs completos.';
            
        case 'SKIPPED':
            return '⏭️ Caso omitido durante la ejecución. Posible dependencia de caso anterior fallido.';
            
        case 'EJECUTADO':
            return '⚠️ Caso ejecutado pero sin detalles específicos del resultado. Estado indeterminado.';
            
        case 'ERROR_PROCESAMIENTO':
            return '🔧 Error al procesar resultados de la ejecución. Verificar formato de salida de Cucumber.';
            
        case 'NO_EJECUTADO':
        default:
            return '⭕ Caso no ejecutado en esta sesión. Verificar configuración de ejecución.';
    }
}

if (process.argv.length < 3) {
    console.log('❌ Uso: node ejecutar-feature.js <nombre_feature>');
    console.log('📝 Ejemplo: node ejecutar-feature.js 02_Login.feature');
    process.exit(1);
}

const feature = process.argv[2];
console.log(`🎯 Ejecutando feature específica: ${feature}`);

// Verificar que el archivo existe
const featurePath = path.join(__dirname, '..', 'features', feature);

if (!fs.existsSync(featurePath)) {
    console.error(`❌ Error: El archivo ${feature} no existe en la carpeta features/`);
    console.log('📂 Features disponibles:');
    const featuresDir = path.join(__dirname, '..', 'features');
    const files = fs.readdirSync(featuresDir).filter(f => f.endsWith('.feature'));
    files.forEach(file => console.log(`   - ${file}`));
    process.exit(1);
}

// Ejecutar cucumber directamente
const args = [
    'cucumber-js',
    '--require', './features/support',
    '--require', './features/step_definitions',
    `features/${feature}`
];

console.log(`🔧 Ejecutando: npx ${args.join(' ')}`);

// Capturar la salida del proceso
let capturedOutput = '';

const proceso = spawn('npx', args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    cwd: path.join(__dirname, '..')
});

let completed = false;

// Capturar stdout
proceso.stdout.on('data', (data) => {
    const output = data.toString();
    capturedOutput += output;
    process.stdout.write(output); // Mostrar en consola también
});

// Capturar stderr
proceso.stderr.on('data', (data) => {
    const output = data.toString();
    capturedOutput += output;
    process.stderr.write(output); // Mostrar en consola también
});

proceso.on('close', (code) => {
    if (!completed) {
        completed = true;
        console.log(`\n📊 Feature ${feature} completada con código: ${code}`);
        
        // Generar informe Excel después de la ejecución
        console.log('\n📋 Generando informe Excel...');
        generateExcelReport(feature, code, capturedOutput);
        
        // Esperar un momento y terminar
        setTimeout(() => {
            console.log('✅ Ejecución finalizada');
            process.exit(code);
        }, 3000);
    }
});

proceso.on('error', (error) => {
    if (!completed) {
        completed = true;
        console.error('❌ Error en ejecución:', error);
        process.exit(1);
    }
});

// Timeout de seguridad
setTimeout(() => {
    if (!completed) {
        completed = true;
        console.log('\n⏰ Timeout alcanzado - terminando proceso...');
        proceso.kill('SIGTERM');
        
        setTimeout(() => {
            if (proceso && !proceso.killed) {
                proceso.kill('SIGKILL');
            }
            process.exit(124);
        }, 3000);
    }
}, 5 * 60 * 1000); // 5 minutos timeout
