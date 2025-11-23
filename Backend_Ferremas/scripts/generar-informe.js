const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

class InformeGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '..', '_informes');
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
        this.terminalOutput = '';
        this.startTime = null;
        this.endTime = null;
        
        // Crear directorio de informes si no existe
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async ejecutarPruebas(feature = null) {
        console.log('🚀 Iniciando ejecución de pruebas...');
        this.startTime = new Date();
        
        // Comando a ejecutar
        const comando = 'npx';
        const args = feature 
            ? ['cucumber-js', '--require', './features/support', '--require', './features/step_definitions', `features/${feature}`]
            : ['cucumber-js', '--require', './features/support', '--require', './features/step_definitions', './features'];
        
        return new Promise((resolve, reject) => {
            const proceso = spawn(comando, args, {
                cwd: path.join(__dirname, '..'),
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdoutData = '';
            let stderrData = '';

            proceso.stdout.on('data', (data) => {
                const texto = data.toString();
                stdoutData += texto;
                this.terminalOutput += texto;
                process.stdout.write(texto); // Mostrar en tiempo real
            });

            proceso.stderr.on('data', (data) => {
                const texto = data.toString();
                stderrData += texto;
                this.terminalOutput += texto;
                process.stderr.write(texto); // Mostrar en tiempo real
            });

            proceso.on('close', (code) => {
                this.endTime = new Date();
                console.log(`\n📊 Proceso finalizado con código: ${code}`);
                
                // Guardar salida de terminal
                this.guardarSalidaTerminal();
                
                // Generar informe completo
                this.generarInforme(code, stdoutData, stderrData);
                
                resolve({
                    code,
                    stdout: stdoutData,
                    stderr: stderrData,
                    duration: this.endTime - this.startTime
                });
            });

            proceso.on('error', (error) => {
                console.error('❌ Error al ejecutar pruebas:', error);
                reject(error);
            });
        });
    }

    guardarSalidaTerminal() {
        const terminalFile = path.join(this.outputDir, `terminal_output_${this.timestamp}.txt`);
        const contenido = `FERREMAS - SALIDA DE TERMINAL DE PRUEBAS AUTOMATIZADAS
========================================================
Fecha de ejecución: ${new Date().toLocaleString('es-ES')}
Hora de inicio: ${this.startTime.toLocaleString('es-ES')}
Hora de fin: ${this.endTime.toLocaleString('es-ES')}
Duración total: ${Math.round((this.endTime - this.startTime) / 1000)} segundos

========================================================
SALIDA COMPLETA DE LA TERMINAL:
========================================================

${this.terminalOutput}

========================================================
FIN DE LA SALIDA
========================================================
`;
        
        fs.writeFileSync(terminalFile, contenido, 'utf8');
        console.log(`📄 Salida de terminal guardada en: ${terminalFile}`);
        return terminalFile;
    }

    generarInforme(exitCode, stdout, stderr) {
        const informeFile = path.join(this.outputDir, `informe_pruebas_${this.timestamp}.html`);
        
        // Analizar resultados
        const resultados = this.analizarResultados(stdout);
        
        const html = this.generarHTML(exitCode, resultados, stdout, stderr);
        
        fs.writeFileSync(informeFile, html, 'utf8');
        console.log(`📋 Informe HTML generado en: ${informeFile}`);
        
        // También generar versión Markdown
        const markdownFile = path.join(this.outputDir, `informe_pruebas_${this.timestamp}.md`);
        const markdown = this.generarMarkdown(exitCode, resultados);
        fs.writeFileSync(markdownFile, markdown, 'utf8');
        console.log(`📝 Informe Markdown generado en: ${markdownFile}`);
        
        // Generar informe Excel detallado
        const excelFile = this.generarInformeExcel(exitCode, resultados, stdout);
        
        return { html: informeFile, markdown: markdownFile, excel: excelFile };
    }

    analizarResultados(output) {
        const lineas = output.split('\n');
        const resultados = {
            scenarios: { total: 0, passed: 0, failed: 0, undefined: 0, skipped: 0 },
            steps: { total: 0, passed: 0, failed: 0, undefined: 0, skipped: 0 },
            features: [],
            errores: [],
            tiempo: '0s'
        };

        // Buscar línea de resumen de escenarios
        const scenarioLine = lineas.find(line => line.includes('scenarios'));
        if (scenarioLine) {
            const match = scenarioLine.match(/(\d+) scenarios? \((.+)\)/);
            if (match) {
                resultados.scenarios.total = parseInt(match[1]);
                const estados = match[2].split(',').map(s => s.trim());
                estados.forEach(estado => {
                    const [count, type] = estado.split(' ');
                    if (type) {
                        resultados.scenarios[type] = parseInt(count) || 0;
                    }
                });
            }
        }

        // Buscar línea de resumen de steps
        const stepLine = lineas.find(line => line.includes('steps'));
        if (stepLine) {
            const match = stepLine.match(/(\d+) steps? \((.+)\)/);
            if (match) {
                resultados.steps.total = parseInt(match[1]);
                const estados = match[2].split(',').map(s => s.trim());
                estados.forEach(estado => {
                    const [count, type] = estado.split(' ');
                    if (type) {
                        resultados.steps[type] = parseInt(count) || 0;
                    }
                });
            }
        }

        // Buscar tiempo de ejecución
        const tiempoLine = lineas.find(line => line.match(/\d+m\d+\.\d+s/));
        if (tiempoLine) {
            const match = tiempoLine.match(/(\d+m\d+\.\d+s)/);
            if (match) {
                resultados.tiempo = match[1];
            }
        }

        // Buscar features ejecutadas
        lineas.forEach(line => {
            if (line.includes('Feature:')) {
                resultados.features.push(line.replace('Feature: ', '').trim());
            }
        });

        // Buscar errores
        lineas.forEach((line, index) => {
            if (line.includes('✗') || line.includes('failed') || line.includes('Error:')) {
                resultados.errores.push({
                    linea: index + 1,
                    mensaje: line.trim()
                });
            }
        });

        return resultados;
    }

    generarHTML(exitCode, resultados, stdout, stderr) {
        const exitStatus = exitCode === 0 ? 'EXITOSO' : 'FALLIDO';
        const statusColor = exitCode === 0 ? '#28a745' : '#dc3545';
        const statusIcon = exitCode === 0 ? '✅' : '❌';

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe de Pruebas Automatizadas - Ferremas</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
        .status { display: inline-block; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin: 10px 0; }
        .status.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.failure { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .card h3 { color: #667eea; margin-bottom: 15px; display: flex; align-items: center; }
        .card h3 .icon { margin-right: 10px; font-size: 1.2em; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .stat-item { padding: 10px; border-radius: 5px; text-align: center; }
        .stat-item.passed { background-color: #d4edda; color: #155724; }
        .stat-item.failed { background-color: #f8d7da; color: #721c24; }
        .stat-item.undefined { background-color: #fff3cd; color: #856404; }
        .stat-item.skipped { background-color: #d1ecf1; color: #0c5460; }
        .terminal-output { background-color: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 10px; font-family: 'Courier New', monospace; font-size: 12px; overflow-x: auto; max-height: 500px; overflow-y: auto; }
        .feature-list { list-style: none; }
        .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .feature-list li:last-child { border-bottom: none; }
        .error-list { list-style: none; }
        .error-item { background-color: #f8d7da; color: #721c24; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 4px solid #dc3545; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; color: #666; }
        .timestamp { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Informe de Pruebas Automatizadas</h1>
            <h2>Sistema Ferremas</h2>
            <div class="status ${exitCode === 0 ? 'success' : 'failure'}">
                ${statusIcon} Estado: ${exitStatus}
            </div>
        </div>

        <div class="timestamp">
            <strong>📅 Fecha de ejecución:</strong> ${new Date().toLocaleString('es-ES')}<br>
            <strong>⏱️ Hora de inicio:</strong> ${this.startTime.toLocaleString('es-ES')}<br>
            <strong>⏰ Hora de fin:</strong> ${this.endTime.toLocaleString('es-ES')}<br>
            <strong>⌛ Duración total:</strong> ${resultados.tiempo} (${Math.round((this.endTime - this.startTime) / 1000)} segundos)
        </div>

        <div class="grid">
            <div class="card">
                <h3><span class="icon">📊</span>Resumen de Escenarios</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <strong>${resultados.scenarios.total}</strong><br>Total
                    </div>
                    <div class="stat-item passed">
                        <strong>${resultados.scenarios.passed || 0}</strong><br>Exitosos
                    </div>
                    <div class="stat-item failed">
                        <strong>${resultados.scenarios.failed || 0}</strong><br>Fallidos
                    </div>
                    <div class="stat-item undefined">
                        <strong>${resultados.scenarios.undefined || 0}</strong><br>Sin definir
                    </div>
                </div>
            </div>

            <div class="card">
                <h3><span class="icon">👣</span>Resumen de Pasos</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <strong>${resultados.steps.total}</strong><br>Total
                    </div>
                    <div class="stat-item passed">
                        <strong>${resultados.steps.passed || 0}</strong><br>Exitosos
                    </div>
                    <div class="stat-item failed">
                        <strong>${resultados.steps.failed || 0}</strong><br>Fallidos
                    </div>
                    <div class="stat-item skipped">
                        <strong>${resultados.steps.skipped || 0}</strong><br>Omitidos
                    </div>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3><span class="icon">📋</span>Features Ejecutadas</h3>
                <ul class="feature-list">
                    ${resultados.features.map(feature => `<li>✓ ${feature}</li>`).join('') || '<li>No se detectaron features específicas</li>'}
                </ul>
            </div>

            ${resultados.errores.length > 0 ? `
            <div class="card">
                <h3><span class="icon">❌</span>Errores Detectados</h3>
                <ul class="error-list">
                    ${resultados.errores.map(error => 
                        `<div class="error-item">
                            <strong>Línea ${error.linea}:</strong> ${error.mensaje}
                        </div>`
                    ).join('')}
                </ul>
            </div>
            ` : ''}
        </div>

        <div class="card">
            <h3><span class="icon">💻</span>Salida Completa de Terminal</h3>
            <div class="terminal-output">${stdout.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}</div>
        </div>

        ${stderr ? `
        <div class="card">
            <h3><span class="icon">⚠️</span>Errores de Sistema</h3>
            <div class="terminal-output" style="background-color: #2d1b1b;">${stderr.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}</div>
        </div>
        ` : ''}

        <div class="footer">
            <p>📄 Informe generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
            <p>🏢 Sistema Ferremas - Automatización de Pruebas - DUOC UC</p>
        </div>
    </div>
</body>
</html>`;
    }

    generarMarkdown(exitCode, resultados) {
        const exitStatus = exitCode === 0 ? 'EXITOSO ✅' : 'FALLIDO ❌';
        
        return `# 🧪 Informe de Pruebas Automatizadas - Sistema Ferremas

## 📊 Resumen Ejecutivo

- **Estado de la ejecución:** ${exitStatus}
- **Fecha de ejecución:** ${new Date().toLocaleString('es-ES')}
- **Hora de inicio:** ${this.startTime.toLocaleString('es-ES')}
- **Hora de fin:** ${this.endTime.toLocaleString('es-ES')}
- **Duración total:** ${resultados.tiempo} (${Math.round((this.endTime - this.startTime) / 1000)} segundos)

## 📈 Métricas de Escenarios

| Estado | Cantidad |
|--------|----------|
| **Total** | ${resultados.scenarios.total} |
| **Exitosos** | ${resultados.scenarios.passed || 0} |
| **Fallidos** | ${resultados.scenarios.failed || 0} |
| **Sin definir** | ${resultados.scenarios.undefined || 0} |
| **Omitidos** | ${resultados.scenarios.skipped || 0} |

## 👣 Métricas de Pasos

| Estado | Cantidad |
|--------|----------|
| **Total** | ${resultados.steps.total} |
| **Exitosos** | ${resultados.steps.passed || 0} |
| **Fallidos** | ${resultados.steps.failed || 0} |
| **Sin definir** | ${resultados.steps.undefined || 0} |
| **Omitidos** | ${resultados.steps.skipped || 0} |

## 📋 Features Ejecutadas

${resultados.features.map(feature => `- ✓ ${feature}`).join('\n') || '- No se detectaron features específicas'}

${resultados.errores.length > 0 ? `
## ❌ Errores Detectados

${resultados.errores.map(error => `- **Línea ${error.linea}:** ${error.mensaje}`).join('\n')}
` : '## ✅ Sin Errores Detectados'}

## 📊 Análisis de Cobertura

- **Total de features disponibles:** 13
- **Features ejecutadas:** ${resultados.features.length}
- **Cobertura:** ${Math.round((resultados.features.length / 13) * 100)}%

## 🎯 Recomendaciones

${exitCode === 0 ? 
    '✅ **Todas las pruebas fueron exitosas.** El sistema está funcionando correctamente según los casos de prueba definidos.' :
    '❌ **Se detectaron fallos en las pruebas.** Se recomienda revisar los errores específicos y corregir los problemas antes del despliegue.'
}

---

*Informe generado automáticamente el ${new Date().toLocaleString('es-ES')}*  
*Sistema Ferremas - Automatización de Pruebas - DUOC UC*
`;
    }

    generarInformeExcel(exitCode, resultados, stdout) {
        console.log('📊 Generando informe Excel detallado...');
        
        // Extraer información detallada de cada escenario de la salida
        const escenarios = this.extraerDetallesEscenarios(stdout);
        
        // Preparar datos para Excel
        const datosExcel = escenarios.map((escenario, index) => ({
            'ID Casos': `TC${(index + 1).toString().padStart(3, '0')}`,
            'Funcionalidad': escenario.funcionalidad,
            'Nombre del caso de prueba': escenario.nombre,
            'Tiempo Ejecución (s)': escenario.tiempoEjecucion,
            'Tiempo de construcción (s)': escenario.tiempoConstruccion,
            'Estado': escenario.estado,
            'Avance %': escenario.avance,
            'Observaciones': escenario.observaciones,
            'Feature': escenario.feature,
            'Pasos Ejecutados': escenario.pasosEjecutados,
            'Pasos Fallidos': escenario.pasosFallidos,
            'Categoría': escenario.categoria,
            'Prioridad': escenario.prioridad,
            'Complejidad': escenario.complejidad,
            'Tipo de Prueba': escenario.tipoPrueba,
            'Módulo': escenario.modulo,
            'Evidencias': escenario.evidencias,
            'Timestamp': new Date().toLocaleString('es-ES')
        }));

        // Crear resumen general
        const resumenGeneral = [{
            'Métrica': 'Total de Casos',
            'Valor': resultados.scenarios.total,
            'Descripción': 'Número total de casos de prueba ejecutados'
        }, {
            'Métrica': 'Casos Exitosos',
            'Valor': resultados.scenarios.passed || 0,
            'Descripción': 'Casos que pasaron todas las validaciones'
        }, {
            'Métrica': 'Casos Fallidos',
            'Valor': resultados.scenarios.failed || 0,
            'Descripción': 'Casos que presentaron errores durante la ejecución'
        }, {
            'Métrica': 'Casos Sin Definir',
            'Valor': resultados.scenarios.undefined || 0,
            'Descripción': 'Casos con pasos no implementados'
        }, {
            'Métrica': 'Casos Omitidos',
            'Valor': resultados.scenarios.skipped || 0,
            'Descripción': 'Casos omitidos por dependencias o errores previos'
        }, {
            'Métrica': 'Tasa de Éxito (%)',
            'Valor': Math.round(((resultados.scenarios.passed || 0) / resultados.scenarios.total) * 100),
            'Descripción': 'Porcentaje de casos exitosos'
        }, {
            'Métrica': 'Tiempo Total (s)',
            'Valor': Math.round((this.endTime - this.startTime) / 1000),
            'Descripción': 'Duración total de la ejecución'
        }, {
            'Métrica': 'Promedio por Caso (s)',
            'Valor': Math.round(((this.endTime - this.startTime) / 1000) / resultados.scenarios.total),
            'Descripción': 'Tiempo promedio por caso de prueba'
        }];

        // Crear estadísticas por feature
        const estadisticasPorFeature = this.calcularEstadisticasPorFeature(escenarios);

        // Crear libro de Excel
        const workbook = XLSX.utils.book_new();

        // Hoja 1: Resumen Ejecutivo
        const wsResumen = XLSX.utils.json_to_sheet(resumenGeneral);
        XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen Ejecutivo');

        // Hoja 2: Detalle de Casos de Prueba
        const wsDetalle = XLSX.utils.json_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle Casos');

        // Hoja 3: Estadísticas por Feature
        const wsFeatures = XLSX.utils.json_to_sheet(estadisticasPorFeature);
        XLSX.utils.book_append_sheet(workbook, wsFeatures, 'Estadísticas Features');

        // Hoja 4: Log de Errores (si existen)
        if (resultados.errores.length > 0) {
            const erroresDetallados = resultados.errores.map((error, index) => ({
                'ID Error': `ERR${(index + 1).toString().padStart(3, '0')}`,
                'Línea': error.linea,
                'Mensaje': error.mensaje,
                'Severidad': this.clasificarSeveridadError(error.mensaje),
                'Categoría': this.categorizarError(error.mensaje),
                'Timestamp': new Date().toLocaleString('es-ES')
            }));
            const wsErrores = XLSX.utils.json_to_sheet(erroresDetallados);
            XLSX.utils.book_append_sheet(workbook, wsErrores, 'Log de Errores');
        }

        // Aplicar estilos y configuraciones
        this.aplicarEstilosExcel(workbook);

        // Guardar archivo
        const excelFile = path.join(this.outputDir, `informe_pruebas_${this.timestamp}.xlsx`);
        XLSX.writeFile(workbook, excelFile);
        
        console.log(`📊 Informe Excel generado: ${excelFile}`);
        return excelFile;
    }

    extraerDetallesEscenarios(stdout) {
        const lineas = stdout.split('\n');
        const escenarios = [];
        let escenarioActual = null;
        let tiempoInicio = null;
        let contadorPasos = 0;
        let pasosFallidos = 0;

        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i].trim();

            // Detectar inicio de escenario
            if (linea.includes('🚀 Iniciando escenario:')) {
                if (escenarioActual) {
                    // Finalizar escenario anterior
                    escenarios.push(this.completarEscenario(escenarioActual, contadorPasos, pasosFallidos));
                }
                
                const nombreEscenario = linea.replace('🚀 Iniciando escenario:', '').trim();
                tiempoInicio = new Date();
                contadorPasos = 0;
                pasosFallidos = 0;
                
                escenarioActual = {
                    nombre: nombreEscenario,
                    tiempoInicio: tiempoInicio,
                    funcionalidad: this.extraerFuncionalidad(nombreEscenario),
                    feature: this.extraerFeature(nombreEscenario),
                    categoria: this.categorizarEscenario(nombreEscenario),
                    tipoPrueba: this.determinarTipoPrueba(nombreEscenario),
                    modulo: this.determinarModulo(nombreEscenario),
                    prioridad: this.determinarPrioridad(nombreEscenario),
                    complejidad: this.determinarComplejidad(nombreEscenario)
                };
            }

            // Contar pasos ejecutados
            if (linea.includes('📝 Paso')) {
                contadorPasos++;
            }

            // Detectar pasos fallidos
            if (linea.includes('❌') || linea.includes('FAILED')) {
                pasosFallidos++;
            }

            // Detectar finalización de escenario
            if (linea.includes('Escenario completado:')) {
                if (escenarioActual) {
                    const estado = linea.includes('✅') ? 'PASSED' : 
                                  linea.includes('❌') ? 'FAILED' : 'UNKNOWN';
                    escenarioActual.estado = estado;
                    escenarioActual.tiempoFin = new Date();
                    
                    escenarios.push(this.completarEscenario(escenarioActual, contadorPasos, pasosFallidos));
                    escenarioActual = null;
                }
            }
        }

        // Procesar último escenario si existe
        if (escenarioActual) {
            escenarios.push(this.completarEscenario(escenarioActual, contadorPasos, pasosFallidos));
        }

        return escenarios;
    }

    completarEscenario(escenario, pasos, fallos) {
        const tiempoEjecucion = escenario.tiempoFin ? 
            Math.round((escenario.tiempoFin - escenario.tiempoInicio) / 1000) : 0;
        
        const avance = pasos > 0 ? Math.round(((pasos - fallos) / pasos) * 100) : 0;
        
        return {
            ...escenario,
            pasosEjecutados: pasos,
            pasosFallidos: fallos,
            tiempoEjecucion: tiempoEjecucion,
            tiempoConstruccion: Math.round(tiempoEjecucion * 0.1), // Estimado 10% del tiempo total
            avance: avance,
            observaciones: this.generarObservaciones(escenario.estado, fallos, pasos),
            evidencias: `${pasos} screenshots, ${pasos} HTML captures`
        };
    }

    extraerFuncionalidad(nombreEscenario) {
        if (nombreEscenario.includes('Registrar usuario')) return 'Gestión de Usuarios';
        if (nombreEscenario.includes('Login')) return 'Autenticación';
        if (nombreEscenario.includes('Registrar producto')) return 'Gestión de Productos';
        if (nombreEscenario.includes('Modificar producto')) return 'Gestión de Productos';
        if (nombreEscenario.includes('Modificar usuario')) return 'Gestión de Usuarios';
        if (nombreEscenario.includes('Eliminar usuario')) return 'Gestión de Usuarios';
        if (nombreEscenario.includes('Eliminar producto')) return 'Gestión de Productos';
        if (nombreEscenario.includes('Listar')) return 'Consultas y Reportes';
        if (nombreEscenario.includes('Búsqueda')) return 'Búsqueda y Filtros';
        if (nombreEscenario.includes('carrito')) return 'Proceso de Compra';
        if (nombreEscenario.includes('stock')) return 'Gestión de Inventario';
        return 'Funcionalidad General';
    }

    extraerFeature(nombreEscenario) {
        const match = nombreEscenario.match(/^(CP\d+[a-z]*)/);
        return match ? match[1] : 'Sin Feature';
    }

    categorizarEscenario(nombre) {
        if (nombre.includes('correcto') || nombre.includes('exitoso')) return 'Casos Positivos';
        if (nombre.includes('vacío') || nombre.includes('vacio')) return 'Validación de Campos';
        if (nombre.includes('duplicado')) return 'Validación de Unicidad';
        if (nombre.includes('incorrecto') || nombre.includes('negativo')) return 'Casos Negativos';
        return 'Casos Funcionales';
    }

    determinarTipoPrueba(nombre) {
        if (nombre.includes('Login') || nombre.includes('registro')) return 'Funcional';
        if (nombre.includes('vacío') || nombre.includes('duplicado')) return 'Validación';
        if (nombre.includes('eliminar')) return 'Integridad';
        if (nombre.includes('listar') || nombre.includes('búsqueda')) return 'Consulta';
        return 'Funcional';
    }

    determinarModulo(nombre) {
        if (nombre.includes('usuario')) return 'Usuarios';
        if (nombre.includes('producto')) return 'Productos';
        if (nombre.includes('Login')) return 'Autenticación';
        if (nombre.includes('carrito')) return 'Ventas';
        if (nombre.includes('stock')) return 'Inventario';
        return 'General';
    }

    determinarPrioridad(nombre) {
        if (nombre.includes('Login') || nombre.includes('registro')) return 'Alta';
        if (nombre.includes('eliminar') || nombre.includes('modificar')) return 'Media';
        if (nombre.includes('listar') || nombre.includes('búsqueda')) return 'Media';
        return 'Baja';
    }

    determinarComplejidad(nombre) {
        const pasos = nombre.split(' ').length;
        if (pasos <= 3) return 'Baja';
        if (pasos <= 6) return 'Media';
        return 'Alta';
    }

    generarObservaciones(estado, fallos, pasos) {
        if (estado === 'PASSED') {
            return `✅ Prueba exitosa. ${pasos} pasos ejecutados correctamente.`;
        } else if (estado === 'FAILED') {
            return `❌ Prueba fallida. ${fallos} de ${pasos} pasos fallaron. Revisar logs para detalles.`;
        }
        return `⚠️ Estado indeterminado. ${pasos} pasos ejecutados.`;
    }

    clasificarSeveridadError(mensaje) {
        if (mensaje.includes('FATAL') || mensaje.includes('Critical')) return 'Crítica';
        if (mensaje.includes('ERROR') || mensaje.includes('Failed')) return 'Alta';
        if (mensaje.includes('WARNING') || mensaje.includes('Warn')) return 'Media';
        return 'Baja';
    }

    categorizarError(mensaje) {
        if (mensaje.includes('login') || mensaje.includes('auth')) return 'Autenticación';
        if (mensaje.includes('element') || mensaje.includes('selector')) return 'UI/Elementos';
        if (mensaje.includes('timeout') || mensaje.includes('wait')) return 'Timing';
        if (mensaje.includes('network') || mensaje.includes('connection')) return 'Conectividad';
        return 'General';
    }

    calcularEstadisticasPorFeature(escenarios) {
        const features = {};
        
        escenarios.forEach(escenario => {
            const feature = escenario.funcionalidad;
            if (!features[feature]) {
                features[feature] = {
                    total: 0,
                    exitosos: 0,
                    fallidos: 0,
                    tiempoTotal: 0
                };
            }
            
            features[feature].total++;
            if (escenario.estado === 'PASSED') features[feature].exitosos++;
            if (escenario.estado === 'FAILED') features[feature].fallidos++;
            features[feature].tiempoTotal += escenario.tiempoEjecucion;
        });

        return Object.entries(features).map(([nombre, stats]) => ({
            'Feature': nombre,
            'Total Casos': stats.total,
            'Casos Exitosos': stats.exitosos,
            'Casos Fallidos': stats.fallidos,
            'Tasa Éxito (%)': Math.round((stats.exitosos / stats.total) * 100),
            'Tiempo Total (s)': stats.tiempoTotal,
            'Tiempo Promedio (s)': Math.round(stats.tiempoTotal / stats.total),
            'Estado General': stats.fallidos === 0 ? '✅ Completa' : 
                           stats.exitosos > stats.fallidos ? '⚠️ Parcial' : '❌ Crítica'
        }));
    }

    aplicarEstilosExcel(workbook) {
        // Configurar anchos de columna para mejor visualización
        const anchos = [
            { wch: 12 }, // ID Casos
            { wch: 25 }, // Funcionalidad
            { wch: 40 }, // Nombre del caso
            { wch: 15 }, // Tiempo Ejecución
            { wch: 18 }, // Tiempo construcción
            { wch: 12 }, // Estado
            { wch: 12 }, // Avance %
            { wch: 50 }  // Observaciones
        ];

        // Aplicar a la hoja de detalle
        if (workbook.Sheets['Detalle Casos']) {
            workbook.Sheets['Detalle Casos']['!cols'] = anchos;
        }
    }

    // ...existing code...
}

// Función principal
async function main() {
    const feature = process.argv[2]; // Opcional: especificar una feature
    const generator = new InformeGenerator();
    
    try {
        console.log('🎯 Generador de Informes de Pruebas Automatizadas');
        console.log('================================================');
        
        const resultado = await generator.ejecutarPruebas(feature);
        
        console.log('\n📈 Resumen de la ejecución:');
        console.log(`   Código de salida: ${resultado.code}`);
        console.log(`   Duración: ${Math.round(resultado.duration / 1000)} segundos`);
        console.log(`   Estado: ${resultado.code === 0 ? '✅ EXITOSO' : '❌ FALLIDO'}`);
        
        console.log('\n✨ ¡Informes generados exitosamente!');
        console.log('   📁 Revisa la carpeta _informes/ para ver los resultados:');
        console.log('   📊 Informe Excel con análisis detallado por casos');
        console.log('   🌐 Dashboard HTML interactivo');
        console.log('   📝 Informe Markdown para documentación');
        console.log('   📄 Log completo de terminal');
        
    } catch (error) {
        console.error('❌ Error al generar informes:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = InformeGenerator;
