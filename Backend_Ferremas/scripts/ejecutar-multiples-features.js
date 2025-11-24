#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

class MultiFeatureExecutor {
    constructor() {
        this.results = [];
        this.totalStartTime = null;
        this.totalEndTime = null;
        this.capturedOutput = '';
        this.featuresExecuted = [];
    }

    // Ejecutar múltiples features
    async executeFeatures(features) {
        this.totalStartTime = new Date();
        console.log('🚀 Iniciando ejecución de múltiples features...');
        console.log('📋 Features a ejecutar: ' + features.join(', '));

        for (const feature of features) {
            console.log(`\n🎯 Ejecutando feature: ${feature}`);
            const code = await this.executeFeature(feature);
        }

        this.totalEndTime = new Date();
        const totalDuration = (this.totalEndTime - this.totalStartTime) / 1000;

        // Generar reporte consolidado
        const reportResult = this.generateConsolidatedReport();
        
        return {
            totalFeatures: this.featuresExecuted.length,
            totalCases: this.results.length,
            totalDuration: totalDuration.toFixed(2),
            filePath: reportResult.filePath
        };
    }

    // Ejecutar una feature individual
    executeFeature(feature) {
        return new Promise((resolve, reject) => {
            const featuresDir = path.join(__dirname, '..', 'features');
            const featurePath = path.join(featuresDir, feature);
            
            if (!fs.existsSync(featurePath)) {
                console.error(`❌ Feature no encontrada: ${feature}`);
                resolve(1);
                return;
            }

            let featureOutput = '';
            const args = [
                'cucumber-js',
                '--require', './features/support',
                '--require', './features/step_definitions',
                `features/${feature}`
            ];

            console.log(`🔧 Ejecutando: npx ${args.join(' ')}`);

            const proceso = spawn('npx', args, {
                stdio: ['inherit', 'pipe', 'pipe'],
                shell: true,
                cwd: path.join(__dirname, '..')
            });

            proceso.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(output);
                featureOutput += output;
                this.capturedOutput += output;
            });

            proceso.stderr.on('data', (data) => {
                const output = data.toString();
                console.error(output);
                featureOutput += output;
                this.capturedOutput += output;
            });

            proceso.on('close', (code) => {
                // Procesar resultados de esta feature
                const featureResults = this.parseFeatureResults(feature, code, featureOutput);
                this.results.push(...featureResults);
                this.featuresExecuted.push({
                    name: feature,
                    exitCode: code,
                    output: featureOutput
                });
                
                console.log(`✅ Feature ${feature} completada con código: ${code}`);
                resolve(code);
            });

            proceso.on('error', (error) => {
                console.error(`❌ Error ejecutando feature ${feature}:`, error);
                reject(error);
            });
        });
    }

    // Parsear resultados de una feature
    parseFeatureResults(featureName, exitCode, output) {
        const results = [];
        const lines = output.split('\n');
        
        // Buscar patrones de casos ejecutados
        let currentCase = null;
        let startTime = null;
        let endTime = null;
        let stepCount = 0;
        let caseStartLine = -1;
        let caseOutput = [];
        const PRE_CONTEXT_LINES = 15; // Capturar 15 líneas antes del inicio del escenario
        
        lines.forEach((line, index) => {
            // Capturar inicio de escenario
            if (line.includes('🚀 Iniciando escenario:')) {
                const match = line.match(/🚀 Iniciando escenario:\s*(.+)/);
                if (match) {
                    currentCase = match[1].trim();
                    stepCount = 0;
                    caseStartLine = index;
                    
                    // Capturar líneas previas (contexto) para incluir logs del sistema
                    caseOutput = [];
                    const startCapture = Math.max(0, index - PRE_CONTEXT_LINES);
                    for (let i = startCapture; i <= index; i++) {
                        caseOutput.push(lines[i]);
                    }
                }
            }
            // Si estamos dentro de un caso, capturar todas las líneas
            else if (currentCase && caseStartLine >= 0) {
                caseOutput.push(line);
            }
            
            // Capturar timestamp de inicio
            if (line.includes('⏰ Timestamp inicio:')) {
                const timestampMatch = line.match(/⏰ Timestamp inicio:\s*(.+)/);
                if (timestampMatch) {
                    startTime = timestampMatch[1].trim();
                }
            }
            // Contar pasos ejecutados del resumen final
            else if (line.includes('📊 Total de pasos ejecutados:')) {
                const stepMatch = line.match(/📊 Total de pasos ejecutados:\s*(\d+)/);
                if (stepMatch) {
                    stepCount = parseInt(stepMatch[1]);
                }
            }
            // Capturar finalización y timestamp de fin
            else if (line.includes('✅ Escenario completado:') || line.includes('❌ Escenario falló:')) {
                if (currentCase) {
                    const status = line.includes('✅') ? 'PASSED' : 'FAILED';
                    
                    // Capturar también las líneas siguientes al completar (duración, timestamp fin, evidencias)
                    for (let i = index + 1; i < Math.min(index + 10, lines.length); i++) {
                        const nextLine = lines[i];
                        // Capturar hasta encontrar el siguiente caso o línea vacía después de evidencias
                        if (nextLine.includes('🚀 Iniciando escenario:')) {
                            break;
                        }
                        caseOutput.push(nextLine);
                        
                        // Detener después de capturar "Evidencias guardadas"
                        if (nextLine.includes('📁 Evidencias guardadas')) {
                            break;
                        }
                    }
                    
                    // Buscar duración en las líneas siguientes
                    let duration = 0;
                    for (let i = index + 1; i < Math.min(index + 5, lines.length); i++) {
                        if (lines[i].includes('⏱️  Duración:')) {
                            const durationMatch = lines[i].match(/⏱️  Duración:\s*(\d+\.?\d*)s/);
                            if (durationMatch) {
                                duration = parseFloat(durationMatch[1]);
                                break;
                            }
                        }
                    }
                    
                    // Buscar timestamp de fin y stepCount en las líneas siguientes
                    for (let i = index + 1; i < Math.min(index + 5, lines.length); i++) {
                        if (lines[i].includes('⏰ Timestamp fin:')) {
                            const endTimestampMatch = lines[i].match(/⏰ Timestamp fin:\s*(.+)/);
                            if (endTimestampMatch) {
                                endTime = endTimestampMatch[1].trim();
                            }
                        }
                        // También buscar stepCount en las líneas siguientes
                        if (lines[i].includes('📊 Total de pasos ejecutados:')) {
                            const stepMatch = lines[i].match(/📊 Total de pasos ejecutados:\s*(\d+)/);
                            if (stepMatch) {
                                stepCount = parseInt(stepMatch[1]);
                            }
                        }
                    }
                    
                    results.push({
                        'Feature': featureName.replace('.feature', ''),
                        'ID Casos': this.extractCaseId(currentCase),
                        'Nombre del caso de prueba': currentCase,
                        'Timestamp Inicio': startTime || new Date().toISOString(),
                        'Timestamp Fin': endTime || new Date().toISOString(),
                        'Tiempo Ejecución (s)': duration,
                        'Estado': status,
                        'Screenshots Capturados': this.countScreenshots(currentCase),
                        'Mensaje/Error': status === 'FAILED' ? 
                            `❌ FALLO: Escenario ${currentCase} falló durante la ejecución. Revisar detalles en logs del terminal para identificar el paso problemático y corregir el error.` : 
                            `✅ ÉXITO: Escenario '${currentCase}' completado exitosamente en ${duration}s. Todos los ${stepCount} pasos ejecutados correctamente. Se capturaron ${this.countScreenshots(currentCase)} screenshots como evidencia del funcionamiento.`,
                        'Output Completo': caseOutput.join('\n') // Guardar el output completo capturado
                    });
                    
                    currentCase = null;
                    startTime = null;
                    endTime = null;
                    caseOutput = [];
                }
            }
        });
        
        return results;
    }

    // Extraer ID del caso de prueba
    extractCaseId(caseName) {
        const match = caseName.match(/(CP\d+[a-z]*)/i);
        return match ? match[1] : caseName.substring(0, 10);
    }

    // Contar screenshots para un caso (solo de la ejecución actual)
    countScreenshots(caseName) {
        const debugDir = path.join(__dirname, '..', 'features', '_debug');
        if (!fs.existsSync(debugDir)) return 0;
        
        const files = fs.readdirSync(debugDir);
        const caseId = this.extractCaseId(caseName);
        
        // Filtrar solo archivos creados DESPUÉS del inicio de esta ejecución
        return files.filter(file => {
            if (!file.includes(caseId) || !(file.endsWith('.png') || file.endsWith('.jpg'))) {
                return false;
            }
            
            // Verificar fecha de modificación del archivo
            const filePath = path.join(debugDir, file);
            const stats = fs.statSync(filePath);
            return stats.mtime >= this.totalStartTime;
        }).length;
    }

    // Generar reporte consolidado
    generateConsolidatedReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
        const outputDir = path.join(__dirname, '..', '_informes');
        
        // Crear directorio si no existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // DEBUG: Guardar el output completo capturado para verificación
        const debugOutputPath = path.join(outputDir, `_debug_output_${timestamp}.txt`);
        fs.writeFileSync(debugOutputPath, this.capturedOutput, 'utf8');
        console.log(`📝 Output completo guardado en: ${debugOutputPath}`);

        // Nombre del archivo
        let fileName;
        if (this.featuresExecuted.length === 1) {
            const featureName = this.featuresExecuted[0].name.replace('.feature', '');
            fileName = `informe_${featureName}_${timestamp}.xlsx`;
        } else {
            const shortNames = this.featuresExecuted.map(f => {
                const match = f.name.match(/(\d+)_/);
                return match ? `F${match[1]}` : f.name.substring(0, 3);
            });
            fileName = `Suite_${shortNames.join('_')}_${timestamp}.xlsx`;
        }

        const filePath = path.join(outputDir, fileName);

        // Crear workbook
        const workbook = XLSX.utils.book_new();

        // Hoja 1: Dashboard
        const dashboardData = this.createDashboard();
        const wsDashboard = XLSX.utils.json_to_sheet(dashboardData);
        XLSX.utils.book_append_sheet(workbook, wsDashboard, '📊 Dashboard');

        // Hoja 2: Casos y Timeline
        const timelineData = this.createTimeline();
        const wsTimeline = XLSX.utils.json_to_sheet(timelineData);
        XLSX.utils.book_append_sheet(workbook, wsTimeline, '📋⏰ Casos & Timeline');

        // Hoja 3: Evidencias (mejorada)
        const evidenceData = this.createEvidenceReport();
        if (evidenceData.length > 0) {
            const wsEvidence = XLSX.utils.json_to_sheet(evidenceData);
            
            // Configurar hipervínculos funcionales
            evidenceData.forEach((row, index) => {
                const cellAddress = XLSX.utils.encode_cell({r: index + 1, c: 8}); // Columna I (Screenshot)
                if (wsEvidence[cellAddress] && row.Screenshot) {
                    wsEvidence[cellAddress].l = { Target: row.Screenshot, Tooltip: "Abrir Screenshot" };
                    wsEvidence[cellAddress].v = "📷 Ver Imagen";
                }
            });
            
            XLSX.utils.book_append_sheet(workbook, wsEvidence, '📸 Evidencias Detalladas');
        }

        // Hoja 4: Terminal Output con estructura detallada
        const terminalData = this.createTerminalOutputReport();
        if (terminalData.length > 0) {
            const wsTerminal = XLSX.utils.json_to_sheet(terminalData);
            XLSX.utils.book_append_sheet(workbook, wsTerminal, '💻 Terminal Output');
        }

        // Hojas individuales por feature
        this.featuresExecuted.forEach(feature => {
            const featureCases = this.results.filter(r => r.Feature === feature.name.replace('.feature', ''));
            if (featureCases.length > 0) {
                const ws = XLSX.utils.json_to_sheet(featureCases);
                const sheetName = `🔹 ${feature.name.replace('.feature', '')}`;
                XLSX.utils.book_append_sheet(workbook, ws, sheetName);
            }
        });

        // Escribir archivo
        XLSX.writeFile(workbook, filePath);

        console.log(`📊 Informe Excel consolidado generado: ${filePath}`);
        console.log(`📋 ${this.results.length} casos de prueba documentados`);
        console.log(`   🎯 ${this.featuresExecuted.length} features ejecutadas`);
        
        return { filePath, totalCases: this.results.length };
    }

    // Crear dashboard
    createDashboard() {
        const totalCases = this.results.length;
        const passedCases = this.results.filter(r => r.Estado === 'PASSED').length;
        const failedCases = this.results.filter(r => r.Estado === 'FAILED').length;
        const totalScreenshots = this.results.reduce((sum, r) => sum + (r['Screenshots Capturados'] || 0), 0);
        
        return [
            { '📊 Métrica': 'Features Ejecutadas', '🔢 Valor': this.featuresExecuted.length, '📝 Descripción': `${this.featuresExecuted.map(f => f.name.replace('.feature', '')).join(', ')}` },
            { '📊 Métrica': 'Total Casos', '🔢 Valor': totalCases, '📝 Descripción': 'Total de casos de prueba ejecutados' },
            { '📊 Métrica': 'Casos Exitosos', '🔢 Valor': passedCases, '📝 Descripción': 'Casos que pasaron correctamente' },
            { '📊 Métrica': 'Casos Fallidos', '🔢 Valor': failedCases, '📝 Descripción': 'Casos que presentaron errores' },
            { '📊 Métrica': 'Tasa de Éxito', '🔢 Valor': `${((passedCases/totalCases)*100).toFixed(1)}%`, '📝 Descripción': 'Porcentaje de casos exitosos' },
            { '📊 Métrica': 'Screenshots Totales', '🔢 Valor': totalScreenshots, '📝 Descripción': 'Total de capturas de pantalla generadas como evidencia' },
            { '📊 Métrica': 'Duración Total', '🔢 Valor': `${((this.totalEndTime - this.totalStartTime) / 1000).toFixed(1)}s`, '📝 Descripción': 'Tiempo total de ejecución de todas las features' }
        ];
    }

    // Crear timeline
    createTimeline() {
        return this.results.map((caso, index) => ({
            '🎯 Feature': caso.Feature,
            '🆔 ID Casos': caso['ID Casos'],
            '📋 Nombre del caso de prueba': caso['Nombre del caso de prueba'],
            '🚀 Timestamp Inicio': caso['Timestamp Inicio'],
            '🏁 Timestamp Fin': caso['Timestamp Fin'],
            '⏱️ Tiempo Ejecución (s)': caso['Tiempo Ejecución (s)'],
            '📊 Estado': caso.Estado,
            '📸 Screenshots Capturados': caso['Screenshots Capturados'],
            '📝 Observaciones': caso['Mensaje/Error'],
            '📈 Orden': index + 1
        }));
    }

    // Crear reporte de evidencias
    createEvidenceReport() {
        const evidenceData = [];
        const evidenceDir = path.join(__dirname, '..', 'features', '_debug');
        
        if (!fs.existsSync(evidenceDir)) {
            return evidenceData;
        }

        const files = fs.readdirSync(evidenceDir)
            .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
            .sort();

        // FILTRAR SOLO POR TIMESTAMP: archivos creados durante esta ejecución
        files.forEach(file => {
            const filePath = path.join(evidenceDir, file);
            const stats = fs.statSync(filePath);
            
            // CRÍTICO: Solo incluir archivos creados DURANTE esta ejecución
            if (stats.mtime < this.totalStartTime) {
                return; // Saltar archivos antiguos
            }
            
            // Extraer información del nombre del archivo
            const featureMatch = file.match(/F(\d+)_/);
            const caseMatch = file.match(/(CP\d+[a-z]*)/i);
            
            if (caseMatch && featureMatch) {
                const caseId = caseMatch[1];
                const featureId = featureMatch[1];
                
                let stepDescription = 'Resultado Final del Caso';
                
                if (file.includes('Step')) {
                    const stepMatch = file.match(/Step(\d+)_([^_]+(?:_[^_]+)*)/);
                    if (stepMatch) {
                        const stepNum = stepMatch[1];
                        const stepDesc = stepMatch[2].replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
                        stepDescription = `Paso ${stepNum}: ${stepDesc}`;
                    }
                }
                
                const featureName = this.getFeatureNameById(featureId);
                
                evidenceData.push({
                    'Feature': featureName,
                    'Caso de Prueba': caseId,
                    'Paso Detectado': stepDescription,
                    'Nombre Archivo': file,
                    'Tamaño Archivo': this.formatFileSize(stats.size),
                    'Fecha y Hora': stats.mtime.toLocaleString(),
                    'Ruta del Archivo': `features/_debug/${file}`,
                    'Estado Archivo': '✅ Disponible',
                    'Screenshot': filePath.replace(/\\/g, '/')
                });
            }
        });

        return evidenceData;
    }

    // Crear reporte de Terminal Output con estructura detallada
    createTerminalOutputReport() {
        const terminalData = [];
        
        // Agregar resumen general de la ejecución
        terminalData.push({
            'Tipo': '🎯 FEATURE',
            'Elemento': this.featuresExecuted.map(f => f.name.replace('.feature', '')).join(', '),
            'Caso/Paso': 'RESUMEN GENERAL',
            'Estado': 'SUCCESS',
            'Duración': `${((this.totalEndTime - this.totalStartTime) / 1000).toFixed(2)}s`,
            'Output Completo': `✅ ${this.featuresExecuted.length} features ejecutadas\n📋 ${this.results.length} casos de prueba\n⏱️ Duración total: ${((this.totalEndTime - this.totalStartTime) / 1000).toFixed(2)}s`,
            'Observaciones': `${this.results.filter(r => r.Estado === 'PASSED').length} casos exitosos - ${this.results.filter(r => r.Estado === 'FAILED').length} casos fallidos`,
            'Timestamp': new Date(this.totalStartTime).toLocaleString()
        });

        // Agregar información detallada por cada caso con su output completo capturado
        this.results.forEach(caso => {
            terminalData.push({
                'Tipo': '🔹 CASO DE PRUEBA',
                'Elemento': caso['Nombre del caso de prueba'],
                'Caso/Paso': caso['ID Casos'],
                'Estado': caso.Estado === 'PASSED' ? '✅ PASSED' : '❌ FAILED',
                'Duración': `${caso['Tiempo Ejecución (s)']}s`,
                'Output Completo': caso['Output Completo'] || '', // Usar el output completo capturado línea por línea
                'Observaciones': caso['Mensaje/Error'] || '✅ Caso ejecutado exitosamente',
                'Timestamp': caso['Timestamp Inicio']
            });
        });

        return terminalData;
    }

    // Obtener nombre de feature por ID
    getFeatureNameById(id) {
        const mapping = {
            '01': '01_RegistrarUsuario',
            '02': '02_Login',
            '03': '03_RegistrarProducto',
            '04': '04_ModificarProducto',
            '05': '05_ModificarUsuario',
            '06': '06_EliminarUsuario',
            '07': '07_EliminarProducto',
            '08': '08_ListarUsuario',
            '09': '09_ListarProducto',
            '10': '10_BusquedaProducto',
            '11': '11_CarritoCompras',
            '12': '12_ModificarStock',
            '13': '13_Reportes'
        };
        return mapping[id] || `Feature_${id}`;
    }

    // Formatear tamaño de archivo
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// Función principal
async function main() {
    const features = process.argv.slice(2);
    
    if (features.length === 0) {
        console.log('❌ Uso: node ejecutar-multiples-features.js <feature1> [feature2] [feature3] ...');
        console.log('📝 Ejemplo: node ejecutar-multiples-features.js 01_RegistrarUsuario.feature 02_Login.feature');
        console.log('📝 Ejemplo: node ejecutar-multiples-features.js *.feature (para todas)');
        process.exit(1);
    }

    // Expandir comodines si es necesario
    let expandedFeatures = [];
    const featuresDir = path.join(__dirname, '..', 'features');
    
    for (const feature of features) {
        if (feature === '*.feature') {
            // Buscar todas las features
            const allFeatures = fs.readdirSync(featuresDir)
                .filter(file => file.endsWith('.feature'))
                .sort();
            expandedFeatures.push(...allFeatures);
        } else {
            expandedFeatures.push(feature);
        }
    }

    try {
        const executor = new MultiFeatureExecutor();
        const result = await executor.executeFeatures(expandedFeatures);
        
        console.log('\n✅ Ejecución de múltiples features completada');
        console.log(`\n📊 Resumen de la ejecución:`);
        console.log(`   📋 Features ejecutadas: ${result.totalFeatures}`);
        console.log(`   🧪 Casos totales: ${result.totalCases}`);
        console.log(`   ⏱️ Duración total: ${result.totalDuration}s`);
        console.log(`   📊 Reporte generado: ${path.basename(result.filePath)}`);
        
    } catch (error) {
        console.error('❌ Error en la ejecución:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = MultiFeatureExecutor;