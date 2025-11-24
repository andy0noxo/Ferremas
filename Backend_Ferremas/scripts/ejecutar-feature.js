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
        const evidenceDir = path.join(__dirname, '..', 'features', '_debug');
        
        // Crear directorios si no existen
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Extraer casos de prueba individuales del archivo feature
        const testCases = extractTestCasesFromFeature(feature);
        const funcionality = getFeatureFunctionality(feature);
        
        // Procesar resultados reales si están disponibles
        const realResults = parseTestResults(capturedOutput, testCases);
        
        // Obtener evidencias disponibles
        const availableEvidence = getAvailableEvidence(evidenceDir);
        
        // Crear datos para cada caso de prueba con timestamps y evidencias
        const reportData = testCases.map((testCase, index) => {
            const result = realResults.find(r => r.id === testCase.id) || {};
            const evidence = availableEvidence.filter(e => e.id === testCase.id || e.name.includes(testCase.id));
            
            return {
                'ID Casos': testCase.id,
                'Funcionalidad': funcionality,
                'Nombre del caso de prueba': testCase.name,
                'Timestamp Inicio': result.startTimestamp || 'N/D',
                'Timestamp Fin': result.endTimestamp || 'N/D',
                'Tiempo Ejecución (s)': result.executionTime || 'N/D',
                'Estado': result.status || 'NO_EJECUTADO',
                'Avance %': calculateProgress(result.status, result.errors),
                'Observaciones': generateObservations(result),
                'Screenshots Capturados': evidence.filter(e => e.type === 'screenshot').length,
                'HTML Capturados': evidence.filter(e => e.type === 'html').length,
                'Evidencias': evidence.map(e => e.name).join('; ') || 'N/D'
            };
        });
        
        // Si no se pudieron extraer casos individuales, crear uno genérico
        if (reportData.length === 0) {
            reportData.push({
                'ID Casos': 'CP01',
                'Funcionalidad': funcionality,
                'Nombre del caso de prueba': `${funcionality} - Casos generales`,
                'Timestamp Inicio': new Date().toLocaleString('es-ES'),
                'Timestamp Fin': new Date().toLocaleString('es-ES'),
                'Tiempo Ejecución (s)': 'N/D',
                'Estado': exitCode === 0 ? 'PASSED' : 'FAILED',
                'Avance %': exitCode === 0 ? '100%' : '0%',
                'Observaciones': exitCode === 0 ? 'Ejecución exitosa' : 'Revisar errores en log',
                'Screenshots Capturados': 0,
                'HTML Capturados': 0,
                'Evidencias': 'N/D'
            });
        }
        
        // Crear libro Excel mejorado
        const workbook = createEnhancedExcelReport(reportData, availableEvidence, funcionality, capturedOutput, exitCode);
        
        // Determinar nombre del archivo con formato mejorado
        const dateStr = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
        const timeStr = new Date().toLocaleTimeString('es-ES', { hour12: false }).replace(/:/g, '-');
        
        // Sistema de nombres inteligente
        const featureName = path.basename(feature, '.feature');
        const featureNumber = featureName.match(/^(\d+)_/);
        const shortName = featureNumber ? `F${featureNumber[1]}` : featureName;
        
        // Por defecto usar nombres cortos (F01, F02, etc.), cambiar con SHORT_NAMES=false
        const useShortNames = process.env.SHORT_NAMES !== 'false';
        const baseName = useShortNames ? shortName : featureName;
        
        const excelFile = path.join(outputDir, `informe_${baseName}_${dateStr}_${timeStr}.xlsx`);
        XLSX.writeFile(workbook, excelFile);
        
        console.log(`📊 Informe Excel generado: ${excelFile}`);
        console.log(`   📋 ${reportData.length} casos de prueba documentados`);
        
        return excelFile;
        
    } catch (error) {
        console.error('❌ Error generando informe Excel:', error.message);
    }
}

// Función para obtener evidencias disponibles
function getAvailableEvidence(evidenceDir) {
    const evidence = [];
    
    if (!fs.existsSync(evidenceDir)) {
        return evidence;
    }
    
    try {
        const files = fs.readdirSync(evidenceDir);
        
        files.forEach(file => {
            if (file.endsWith('.png') || file.endsWith('.html')) {
                // Extraer información del nombre del archivo
                const parts = file.split('_');
                let id = 'Unknown';
                let stepNumber = 'N/D';
                
                // Buscar patrones como CP01a, CP02, etc.
                const idMatch = file.match(/(CP\d+[a-z]*)/i);
                if (idMatch) {
                    id = idMatch[1];
                }
                
                // Buscar número de paso
                const stepMatch = file.match(/Step(\d+)/i);
                if (stepMatch) {
                    stepNumber = stepMatch[1];
                }
                
                evidence.push({
                    name: file,
                    id: id,
                    stepNumber: stepNumber,
                    type: file.endsWith('.png') ? 'screenshot' : 'html',
                    path: path.join(evidenceDir, file),
                    size: fs.statSync(path.join(evidenceDir, file)).size
                });
            }
        });
    } catch (error) {
        console.warn('⚠️ Error leyendo directorio de evidencias:', error.message);
    }
    
    return evidence;
}

// Función para crear libro Excel mejorado con estilos y múltiples hojas
function createEnhancedExcelReport(reportData, evidenceData, functionality, output, exitCode) {
    const workbook = XLSX.utils.book_new();
    
    // Configurar propiedades del libro
    workbook.Props = {
        Title: `Informe de Pruebas Automatizadas - ${functionality}`,
        Subject: 'Resultados de Pruebas BDD/Cucumber',
        Author: 'Sistema Automatizado de Pruebas - Ferremas',
        CreatedDate: new Date(),
        Company: 'DUOC UC - Automatización de Pruebas'
    };
    
    // Hoja 1: Resumen Ejecutivo
    const executiveSummary = createExecutiveSummary(reportData, functionality, exitCode);
    const wsExecutive = XLSX.utils.json_to_sheet(executiveSummary);
    applyExecutiveStyles(wsExecutive);
    XLSX.utils.book_append_sheet(workbook, wsExecutive, '📊 Resumen Ejecutivo');
    
    // Hoja 2: Casos con Timeline (estructura fusionada similar a múltiples features)
    const casesWithTimeline = createCasesWithTimelineData(reportData, functionality);
    const wsCasesTimeline = XLSX.utils.json_to_sheet(casesWithTimeline);
    applyFusedCasesTimelineStyles(wsCasesTimeline);
    XLSX.utils.book_append_sheet(workbook, wsCasesTimeline, '📋⏰ Casos & Timeline');
    
    // Hoja 3: Evidencias Detalladas con Screenshots
    if (evidenceData.length > 0) {
        const enhancedEvidence = createEnhancedEvidenceSummary(evidenceData, functionality);
        const wsEvidence = XLSX.utils.json_to_sheet(enhancedEvidence);
        applyEnhancedEvidenceStyles(wsEvidence);
        XLSX.utils.book_append_sheet(workbook, wsEvidence, '📸 Evidencias Detalladas');
    }
    
    // Hoja 4: Resumen de Performance (similar a dashboard de múltiples features)
    const performanceSummary = createPerformanceSummary(reportData, functionality);
    const wsPerformance = XLSX.utils.json_to_sheet(performanceSummary);
    applyPerformanceSummaryStyles(wsPerformance);
    XLSX.utils.book_append_sheet(workbook, wsPerformance, '🎯 Performance Summary');

    // Hoja 5: Terminal Output
    const terminalOutput = createTerminalOutputSummary(output, functionality);
    const wsTerminal = XLSX.utils.json_to_sheet(terminalOutput);
    applyTerminalStyles(wsTerminal);
    XLSX.utils.book_append_sheet(workbook, wsTerminal, '💻 Terminal Output');
    
    return workbook;
}

// Función para crear resumen ejecutivo
function createExecutiveSummary(reportData, functionality, exitCode) {
    const totalCases = reportData.length;
    const passedCases = reportData.filter(r => r.Estado === 'PASSED').length;
    const failedCases = reportData.filter(r => r.Estado === 'FAILED').length;
    const successRate = totalCases > 0 ? ((passedCases / totalCases) * 100).toFixed(2) : 0;
    const avgExecutionTime = calculateAverageExecutionTime(reportData);
    
    return [
        { '📊 Métricas': 'Funcionalidad Probada', '🔢 Valor': functionality, '📝 Descripción': 'Feature principal evaluada en esta ejecución' },
        { '📊 Métricas': 'Total de Casos', '🔢 Valor': totalCases, '📝 Descripción': 'Número total de casos de prueba ejecutados' },
        { '📊 Métricas': 'Casos Exitosos', '🔢 Valor': passedCases, '📝 Descripción': 'Casos que pasaron todas las validaciones' },
        { '📊 Métricas': 'Casos Fallidos', '🔢 Valor': failedCases, '📝 Descripción': 'Casos que presentaron errores durante la ejecución' },
        { '📊 Métricas': 'Tasa de Éxito', '🔢 Valor': `${successRate}%`, '📝 Descripción': 'Porcentaje de casos exitosos sobre el total' },
        { '📊 Métricas': 'Tiempo Promedio', '🔢 Valor': `${avgExecutionTime}s`, '📝 Descripción': 'Tiempo promedio de ejecución por caso de prueba' },
        { '📊 Métricas': 'Estado General', '🔢 Valor': exitCode === 0 ? '✅ EXITOSO' : '❌ CON FALLOS', '📝 Descripción': 'Resultado global de la ejecución de pruebas' },
        { '📊 Métricas': 'Fecha de Ejecución', '🔢 Valor': new Date().toLocaleString('es-ES'), '📝 Descripción': 'Momento en que se ejecutaron las pruebas' }
    ];
}

// Función para crear resumen de evidencias
function createEvidenceSummary(evidenceData) {
    const groupedEvidence = {};
    
    evidenceData.forEach(evidence => {
        if (!groupedEvidence[evidence.id]) {
            groupedEvidence[evidence.id] = {
                'ID Caso': evidence.id,
                'Screenshots': 0,
                'Total Archivos': 0,
                'Tamaño Total (KB)': 0,
                'Archivos': []
            };
        }
        
        if (evidence.type === 'screenshot') {
            groupedEvidence[evidence.id]['Screenshots']++;
        }
        
        groupedEvidence[evidence.id]['Total Archivos']++;
        groupedEvidence[evidence.id]['Tamaño Total (KB)'] += Math.round(evidence.size / 1024);
        groupedEvidence[evidence.id]['Archivos'].push(evidence.name);
    });
    
    return Object.values(groupedEvidence).map(group => ({
        ...group,
        'Archivos': group['Archivos'].join(', ')
    }));
}

// Función para crear datos fusionados de casos con timeline (similar a múltiples features)
function createCasesWithTimelineData(reportData, functionality) {
    return reportData.map((caso, index) => ({
        '🎯 Feature': functionality,
        '🆔 ID': caso['ID Casos'],
        '📋 Descripción': caso['Nombre del caso de prueba'] || 'N/D',
        '📊 Estado': caso.Estado,
        '🚀 Inicio': caso['Timestamp Inicio'],
        '🏁 Fin': caso['Timestamp Fin'],
        '⏱️ Duración (s)': caso['Tiempo Ejecución (s)'] || 0,
        '📸 Screenshots': caso['Screenshots Capturados'] || 0,
        '📝 Observaciones': caso['Observaciones'] || 'Ejecutado correctamente',
        '📈 Orden': index + 1,
        '🎯 Performance': getPerformanceLevel(parseFloat(caso['Tiempo Ejecución (s)']) || 0),
        '📊 Progreso': calculateProgress(caso.Estado)
    }));
}

// Función para crear resumen de performance
function createPerformanceSummary(reportData, functionality) {
    const totalCases = reportData.length;
    const avgTime = calculateAverageExecutionTime(reportData);
    const maxTime = Math.max(...reportData.map(r => parseFloat(r['Tiempo Ejecución (s)']) || 0));
    const minTime = Math.min(...reportData.map(r => parseFloat(r['Tiempo Ejecución (s)']) || 0));
    const totalScreenshots = reportData.reduce((sum, r) => sum + (r['Screenshots Capturados'] || 0), 0);
    
    return [
        { '🎯 Métrica': 'Funcionalidad', '🔢 Valor': functionality, '📝 Detalle': 'Feature principal probada' },
        { '🎯 Métrica': 'Casos Totales', '🔢 Valor': totalCases, '📝 Detalle': 'Número de casos ejecutados' },
        { '🎯 Métrica': 'Tiempo Promedio', '🔢 Valor': `${avgTime}s`, '📝 Detalle': 'Duración promedio por caso' },
        { '🎯 Métrica': 'Tiempo Máximo', '🔢 Valor': `${maxTime}s`, '📝 Detalle': 'Caso más lento ejecutado' },
        { '🎯 Métrica': 'Tiempo Mínimo', '🔢 Valor': `${minTime}s`, '📝 Detalle': 'Caso más rápido ejecutado' },
        { '🎯 Métrica': 'Screenshots Totales', '🔢 Valor': totalScreenshots, '📝 Detalle': 'Evidencias visuales capturadas' },
        { '🎯 Métrica': 'Cobertura Visual', '🔢 Valor': totalScreenshots > 0 ? '✅ Completa' : '❌ Sin Evidencias', '📝 Detalle': 'Estado de capturas de evidencia' }
    ];
}

// Función para obtener nivel de performance (copiada de múltiples features)
function getPerformanceLevel(duration) {
    const time = parseFloat(duration) || 0;
    if (time <= 5) return '🟢 Excelente';
    if (time <= 15) return '🟡 Buena';
    if (time <= 30) return '🟠 Regular';
    return '🔴 Lenta';
}

// Función para calcular progreso (copiada de múltiples features)
function calculateProgress(estado) {
    if (estado === 'PASSED') return '✅ 100%';
    if (estado === 'FAILED') return '❌ 0%';
    return '⏸️ En Proceso';
}

// Función para crear timeline de ejecución (mantener como backup)
function createExecutionTimeline(reportData) {
    return reportData.map((caso, index) => ({
        '# Orden': index + 1,
        'ID Caso': caso['ID Casos'],
        'Nombre Caso': caso['Nombre del caso de prueba'],
        '⏰ Inicio': caso['Timestamp Inicio'],
        '🏁 Fin': caso['Timestamp Fin'],
        '⏱️ Duración': `${caso['Tiempo Ejecución (s)']}s`,
        '📊 Estado': caso['Estado'],
        '📈 Progreso': caso['Avance %']
    }));
}

// Funciones para aplicar estilos a las hojas
function applyExecutiveStyles(worksheet) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
        { wch: 20 }, // Métricas
        { wch: 15 }, // Valor
        { wch: 50 }  // Descripción
    ];
    
    // Configurar altura de filas
    worksheet['!rows'] = [];
    for (let i = 0; i <= range.e.r; i++) {
        worksheet['!rows'][i] = { hpt: 20 };
    }
}

function applyDetailStyles(worksheet) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Configurar anchos de columna optimizados
    worksheet['!cols'] = [
        { wch: 12 }, // ID Casos
        { wch: 25 }, // Funcionalidad
        { wch: 40 }, // Nombre del caso
        { wch: 18 }, // Timestamp Inicio
        { wch: 18 }, // Timestamp Fin
        { wch: 15 }, // Tiempo Ejecución
        { wch: 12 }, // Estado
        { wch: 12 }, // Avance %
        { wch: 60 }, // Observaciones
        { wch: 15 }, // Screenshots
        { wch: 15 }, // HTML
        { wch: 50 }  // Evidencias
    ];
    
    // Configurar altura de filas
    worksheet['!rows'] = [];
    for (let i = 0; i <= range.e.r; i++) {
        worksheet['!rows'][i] = { hpt: i === 0 ? 25 : 22 }; // Header más alto
    }
}

function applyEvidenceStyles(worksheet) {
    worksheet['!cols'] = [
        { wch: 12 }, // ID Caso
        { wch: 15 }, // Screenshots
        { wch: 15 }, // Total Archivos
        { wch: 18 }, // Tamaño Total
        { wch: 80 }  // Archivos
    ];
}

function applyTimelineStyles(worksheet) {
    worksheet['!cols'] = [
        { wch: 8 },  // Orden
        { wch: 12 }, // ID Caso
        { wch: 40 }, // Nombre Caso
        { wch: 18 }, // Inicio
        { wch: 18 }, // Fin
        { wch: 12 }, // Duración
        { wch: 12 }, // Estado
        { wch: 12 }  // Progreso
    ];
}

// Función auxiliar para calcular tiempo promedio
function calculateAverageExecutionTime(reportData) {
    const validTimes = reportData
        .map(r => parseFloat(r['Tiempo Ejecución (s)']) || 0)
        .filter(t => t > 0);
    
    if (validTimes.length === 0) return 'N/D';
    
    const average = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
    return average.toFixed(2);
}

// Crear evidencias mejoradas con detalles organizados
function createEnhancedEvidenceSummary(evidenceData, functionality) {
    const enhancedEvidence = [];
    const evidenceDir = path.join(__dirname, '..', 'features', '_debug');
    
    if (!fs.existsSync(evidenceDir)) {
        return [];
    }

    // Buscar archivos de evidencia directamente en el directorio
    const files = fs.readdirSync(evidenceDir)
        .filter(file => {
            const hasFeature = file.includes(functionality) || file.includes(functionality.replace('_', ''));
            const isScreenshot = file.endsWith('.png') || file.endsWith('.jpg');
            return hasFeature && isScreenshot;
        });

    files.forEach((file, index) => {
        // Extraer información del nombre del archivo
        const caseMatch = file.match(/(CP\d+[a-z]*)/i);
        
        if (caseMatch) {
            const caseId = caseMatch[1];
            const filePath = path.join(evidenceDir, file);
            let fileSize = 'N/D';
            let createdDate = 'N/D';
            
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                fileSize = formatFileSize(stats.size);
                createdDate = stats.birthtime.toLocaleString('es-ES');
            }

            enhancedEvidence.push({
                'Funcionalidad': functionality,
                'Caso de Prueba': caseId,
                'Paso Detectado': extractStepFromFileName(file),
                'Orden en Caso': index + 1,
                'Tipo Evidencia': 'Screenshot',
                'Nombre Archivo': file,
                'Tamaño Archivo': fileSize,
                'Fecha y Hora': createdDate,
                'Estado Archivo': 'Disponible',
                'Descripción Automática': getScreenshotDescription(file),
                'Screenshot': filePath // Ruta para insertar imagen
            });
        }
    });

    return enhancedEvidence.sort((a, b) => {
        if (a['Caso de Prueba'] !== b['Caso de Prueba']) {
            return a['Caso de Prueba'].localeCompare(b['Caso de Prueba']);
        }
        return a['Orden en Caso'] - b['Orden en Caso'];
    });
}

// Crear timeline mejorado con análisis de performance
function createEnhancedTimeline(reportData) {
    return reportData.map((caso, index) => {
        const duration = parseFloat(caso['Tiempo Ejecución (s)']) || 0;
        const performance = getPerformanceLevel(duration);
        const startTime = caso['Timestamp Inicio'] || 'N/D';
        const endTime = caso['Timestamp Fin'] || 'N/D';

        return {
            'Orden': index + 1,
            'Caso ID': caso['Caso ID'],
            'Descripción': caso['Descripción'],
            'Inicio': startTime,
            'Fin': endTime,
            'Duración (s)': duration,
            'Performance': performance,
            'Estado': caso.Estado,
            'Progreso': calculateProgress(caso.Estado),
            'Screenshots': caso['Screenshots Capturados'] || 0,
            'Evidencias HTML': caso['HTML Capturados'] || 0,
            'Observaciones': getPerformanceObservations(duration, caso.Estado)
        };
    });
}

// Crear resumen de terminal output
function createTerminalOutputSummary(output, functionality) {
    const cleanOutput = cleanTerminalOutput(output || '');
    const lines = cleanOutput.split('\n').filter(line => line.trim().length > 0);
    
    return [{
        'Funcionalidad': functionality,
        'Timestamp Ejecución': new Date().toLocaleString('es-ES'),
        'Líneas de Output': lines.length,
        'Tamaño Total (chars)': output ? output.length : 0,
        'Contiene Errores': output && output.toLowerCase().includes('error') ? 'SÍ' : 'NO',
        'Contiene Warnings': output && output.toLowerCase().includes('warn') ? 'SÍ' : 'NO',
        'Output Limpio': cleanOutput,
        'Resumen': `${lines.length} líneas de output capturadas`,
        'Estado Output': cleanOutput.includes('✅') ? 'SUCCESS' : 'INFO'
    }];
}

// Aplicar estilos mejorados para evidencias con screenshots
function applyEnhancedEvidenceStyles(worksheet) {
    worksheet['!cols'] = [
        { wch: 18 }, // Funcionalidad
        { wch: 15 }, // Caso de Prueba  
        { wch: 25 }, // Paso Detectado
        { wch: 12 }, // Orden en Caso
        { wch: 15 }, // Tipo Evidencia
        { wch: 35 }, // Nombre Archivo
        { wch: 12 }, // Tamaño Archivo
        { wch: 20 }, // Fecha y Hora
        { wch: 15 }, // Estado Archivo
        { wch: 35 }, // Descripción Automática
        { wch: 60 }  // Screenshot (imagen)
    ];
    
    // Configurar altura de filas para acomodar imágenes
    worksheet['!rows'] = [];
    for (let i = 0; i <= 100; i++) {
        worksheet['!rows'][i] = { hpt: i === 0 ? 30 : 80 }; // Header más alto, filas de datos para imágenes
    }
}

// Estilos para la hoja fusionada de casos con timeline (copiado de múltiples features)
function applyFusedCasesTimelineStyles(worksheet) {
    worksheet['!cols'] = [
        { wch: 15 }, // 🎯 Feature  
        { wch: 10 }, // 🆔 ID
        { wch: 40 }, // 📋 Descripción
        { wch: 12 }, // 📊 Estado
        { wch: 20 }, // 🚀 Inicio
        { wch: 20 }, // 🏁 Fin
        { wch: 15 }, // ⏱️ Duración (s)
        { wch: 12 }, // 📸 Screenshots
        { wch: 35 }, // 📝 Observaciones
        { wch: 10 }, // 📈 Orden
        { wch: 15 }, // 🎯 Performance
        { wch: 12 }  // 📊 Progreso
    ];
}

// Estilos para el resumen de performance
function applyPerformanceSummaryStyles(worksheet) {
    worksheet['!cols'] = [
        { wch: 25 }, // Métrica
        { wch: 20 }, // Valor
        { wch: 50 }  // Detalle
    ];
}

// Aplicar estilos mejorados para timeline
function applyEnhancedTimelineStyles(worksheet) {
    worksheet['!cols'] = [
        { wch: 8 },  // Orden
        { wch: 12 }, // Caso ID
        { wch: 35 }, // Descripción
        { wch: 18 }, // Inicio
        { wch: 18 }, // Fin
        { wch: 12 }, // Duración
        { wch: 12 }, // Performance
        { wch: 12 }, // Estado
        { wch: 12 }, // Progreso
        { wch: 12 }, // Screenshots
        { wch: 15 }, // Evidencias HTML
        { wch: 40 }  // Observaciones
    ];
}

// Aplicar estilos para terminal output
function applyTerminalStyles(worksheet) {
    worksheet['!cols'] = [
        { wch: 20 }, // Funcionalidad
        { wch: 18 }, // Timestamp Ejecución
        { wch: 12 }, // Líneas de Output
        { wch: 15 }, // Tamaño Total
        { wch: 12 }, // Contiene Errores
        { wch: 12 }, // Contiene Warnings
        { wch: 80 }, // Output Limpio
        { wch: 25 }, // Resumen
        { wch: 12 }  // Estado Output
    ];
}

// Funciones auxiliares mejoradas (copiadas de múltiples features)

// Extraer paso del nombre del archivo
function extractStepFromFileName(fileName) {
    // Analizar el nombre del archivo para determinar el paso
    const lowerFileName = fileName.toLowerCase();
    
    // Mapear palabras clave a pasos específicos
    if (lowerFileName.includes('accede') || lowerFileName.includes('login') || lowerFileName.includes('registro')) return 'Paso 1: Acceso';
    if (lowerFileName.includes('formulario')) return 'Paso 2: Formulario';
    if (lowerFileName.includes('nombre')) return 'Paso 3: Nombre';
    if (lowerFileName.includes('email') || lowerFileName.includes('mail')) return 'Paso 4: Email';
    if (lowerFileName.includes('contraseña') || lowerFileName.includes('password')) return 'Paso 5: Contraseña';
    if (lowerFileName.includes('rut')) return 'Paso 6: RUT';
    if (lowerFileName.includes('rol')) return 'Paso 7: Rol';
    if (lowerFileName.includes('crear') || lowerFileName.includes('envío')) return 'Paso 8: Envío';
    if (lowerFileName.includes('mensaje') || lowerFileName.includes('resultado')) return 'Paso Final: Validación';
    
    // Si no se puede determinar, usar el timestamp para inferir el orden
    return 'Paso Final: Captura';
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Obtener descripción de evidencia
function getScreenshotDescription(fileName) {
    if (fileName.includes('screenshot')) return 'Captura de pantalla del caso de prueba';
    if (fileName.includes('html')) return 'Código fuente de la página';
    return 'Evidencia del caso de prueba';
}

// Funciones auxiliares mejoradas
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function extractStepFromFileName(fileName) {
    const stepMatch = fileName.match(/Step(\d+)/i);
    return stepMatch ? `Paso ${stepMatch[1]}` : 'N/A';
}

function getScreenshotDescription(fileName) {
    if (fileName.includes('Step1')) return 'Captura inicial del caso';
    if (fileName.includes('Step2')) return 'Después de ingresar datos';
    if (fileName.includes('Step3')) return 'Validación intermedia';
    if (fileName.includes('Step4')) return 'Acción principal ejecutada';
    if (fileName.includes('Step5')) return 'Resultado final obtenido';
    return 'Captura durante ejecución';
}

function getPerformanceLevel(duration) {
    if (duration < 5) return 'Excelente';
    if (duration < 15) return 'Bueno';  
    if (duration < 30) return 'Aceptable';
    if (duration < 60) return 'Lento';
    return 'Muy Lento';
}

function calculateProgress(status) {
    switch (status) {
        case 'PASSED': return '100%';
        case 'FAILED': return '75%';
        case 'SKIPPED': return '0%';
        default: return '50%';
    }
}

function getPerformanceObservations(duration, status) {
    const observations = [];
    
    if (duration > 60) observations.push('Tiempo excesivo');
    if (duration > 30) observations.push('Considerar optimización');
    if (duration < 5) observations.push('Rendimiento óptimo');
    if (status === 'FAILED') observations.push('Requiere revisión');
    if (status === 'PASSED' && duration < 10) observations.push('Caso eficiente');
    
    return observations.length > 0 ? observations.join(', ') : 'Sin observaciones';
}

function cleanTerminalOutput(output) {
    if (!output) return 'Sin output capturado';
    
    return output
        .split('\n')
        .filter(line => 
            !line.includes('[ERROR:gpu') && 
            !line.includes('DevTools listening') &&
            !line.includes('This Node.js version') &&
            line.trim().length > 0
        )
        .map(line => line.replace(/\x1b\[[0-9;]*m/g, ''))
        .join('\n')
        .substring(0, 3000) + (output.length > 3000 ? '\n... (output truncado)' : '');
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
            
            // Obtener timestamps específicos para este caso
            const timestampInfo = timestampMap.get(scenarioId);
            let startTimestamp = new Date().toLocaleString('es-ES'); // Fallback
            let endTimestamp = new Date().toLocaleString('es-ES'); // Fallback
            
            if (timestampInfo) {
                startTimestamp = timestampInfo.startTimestamp || startTimestamp;
                endTimestamp = timestampInfo.endTimestamp || timestampInfo.startTimestamp || endTimestamp;
            }
            
            results.push({
                id: testCase.id,
                executionTime: executionTime,
                status: status,
                errors: errors,
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp,
                timestamp: endTimestamp // Mantener compatibilidad
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

// Exportar funciones necesarias para otros scripts
module.exports = {
    extractTestCasesFromFeature,
    parseTestResults,
    getFeatureFunctionality,
    generateExcelReport,
    createEnhancedExcelReport,
    getAvailableEvidence
};

// Ejecutar solo si es llamado directamente
if (require.main === module) {
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

} // Fin del bloque if (require.main === module)
