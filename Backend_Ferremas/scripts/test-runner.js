#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Script para ejecutar pruebas con informes Excel mejorados
class TestRunner {
    constructor() {
        this.featuresDir = path.join(__dirname, '..', 'features');
    }

    // Listar features disponibles
    listAvailableFeatures() {
        try {
            const files = fs.readdirSync(this.featuresDir)
                .filter(f => f.endsWith('.feature'))
                .sort();
            
            console.log('📂 Features disponibles:');
            files.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file}`);
            });
            
            return files;
        } catch (error) {
            console.error('❌ Error listando features:', error.message);
            return [];
        }
    }

    // Ejecutar una sola feature
    async runSingleFeature(featureName) {
        console.log(`🎯 Ejecutando feature individual: ${featureName}`);
        
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, 'ejecutar-feature.js');
            const proceso = spawn('node', [scriptPath, featureName], {
                stdio: 'inherit',
                shell: true,
                cwd: __dirname
            });

            proceso.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Feature ${featureName} ejecutada exitosamente`);
                    resolve(code);
                } else {
                    console.log(`❌ Feature ${featureName} terminó con errores (código: ${code})`);
                    resolve(code);
                }
            });

            proceso.on('error', (error) => {
                console.error(`❌ Error ejecutando ${featureName}:`, error);
                reject(error);
            });
        });
    }

    // Ejecutar múltiples features
    async runMultipleFeatures(featureNames) {
        console.log(`🎯 Ejecutando múltiples features: ${featureNames.join(', ')}`);
        
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, 'ejecutar-multiples-features.js');
            const proceso = spawn('node', [scriptPath, ...featureNames], {
                stdio: 'inherit',
                shell: true,
                cwd: __dirname
            });

            proceso.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Múltiples features ejecutadas exitosamente`);
                    resolve(code);
                } else {
                    console.log(`❌ Ejecución múltiple terminó con errores (código: ${code})`);
                    resolve(code);
                }
            });

            proceso.on('error', (error) => {
                console.error(`❌ Error en ejecución múltiple:`, error);
                reject(error);
            });
        });
    }

    // Función principal del runner
    async run() {
        const args = process.argv.slice(2);
        
        if (args.length === 0) {
            this.showUsage();
            return;
        }

        // Comandos especiales
        if (args[0] === '--list' || args[0] === '-l') {
            this.listAvailableFeatures();
            return;
        }

        if (args[0] === '--all') {
            const allFeatures = this.listAvailableFeatures();
            if (allFeatures.length > 0) {
                console.log(`\n🚀 Ejecutando TODAS las features (${allFeatures.length} en total)...`);
                await this.runMultipleFeatures(allFeatures);
            }
            return;
        }

        if (args[0] === '--suite') {
            // Suites predefinidas
            const suites = {
                'auth': ['01_RegistrarUsuario.feature', '02_Login.feature'],
                'productos': ['03_RegistrarProducto.feature', '04_ModificarProducto.feature', '07_EliminarProducto.feature', '09_ListarProducto.feature'],
                'usuarios': ['01_RegistrarUsuario.feature', '05_ModificarUsuario.feature', '06_EliminarUsuario.feature', '08_ListarUsuario.feature'],
                'core': ['01_RegistrarUsuario.feature', '02_Login.feature', '03_RegistrarProducto.feature'],
                'busqueda': ['10_BusquedaProducto.feature', '09_ListarProducto.feature'],
                'ventas': ['11_CarritoCompras.feature', '12_ModificarStock.feature'],
                'reportes': ['13_Reportes.feature']
            };

            const suiteName = args[1];
            if (!suiteName) {
                console.log('📦 Suites disponibles:');
                Object.keys(suites).forEach(suite => {
                    console.log(`   ${suite}: ${suites[suite].join(', ')}`);
                });
                return;
            }

            if (suites[suiteName]) {
                console.log(`\n🎯 Ejecutando suite "${suiteName}": ${suites[suiteName].join(', ')}`);
                await this.runMultipleFeatures(suites[suiteName]);
            } else {
                console.error(`❌ Suite "${suiteName}" no encontrada`);
            }
            return;
        }

        // Expandir comodines
        let featuresToRun = [];
        for (const arg of args) {
            if (arg.includes('*')) {
                const allFeatures = fs.readdirSync(this.featuresDir)
                    .filter(f => f.endsWith('.feature'));
                
                if (arg === '*.feature') {
                    featuresToRun.push(...allFeatures);
                } else {
                    const pattern = new RegExp(arg.replace('*', '.*'));
                    const matchingFeatures = allFeatures.filter(f => pattern.test(f));
                    featuresToRun.push(...matchingFeatures);
                }
            } else {
                // Agregar .feature si no está presente
                const featureName = arg.endsWith('.feature') ? arg : `${arg}.feature`;
                featuresToRun.push(featureName);
            }
        }

        // Eliminar duplicados
        featuresToRun = [...new Set(featuresToRun)];

        // Verificar que los archivos existen
        for (const feature of featuresToRun) {
            const featurePath = path.join(this.featuresDir, feature);
            if (!fs.existsSync(featurePath)) {
                console.error(`❌ Feature no encontrada: ${feature}`);
                console.log('📂 Features disponibles:');
                this.listAvailableFeatures();
                return;
            }
        }

        // Ejecutar
        if (featuresToRun.length === 1) {
            await this.runSingleFeature(featuresToRun[0]);
        } else {
            await this.runMultipleFeatures(featuresToRun);
        }
    }

    showUsage() {
        console.log(`
🧪 Test Runner con Informes Excel Mejorados - Sistema Ferremas

📋 Uso:
   node test-runner.js <feature(s)>           Ejecutar feature(s) específica(s)
   node test-runner.js --all                  Ejecutar todas las features
   node test-runner.js --list | -l           Listar features disponibles
   node test-runner.js --suite <nombre>      Ejecutar suite predefinida
   
📝 Ejemplos:
   node test-runner.js 01_RegistrarUsuario   Ejecutar solo registro de usuarios
   node test-runner.js 01_* 02_*             Ejecutar features que empiecen con 01_ o 02_
   node test-runner.js *.feature             Ejecutar todas las features
   node test-runner.js 01_RegistrarUsuario.feature 02_Login.feature  Ejecutar múltiples features específicas
   node test-runner.js --suite auth          Ejecutar suite de autenticación
   node test-runner.js --suite core          Ejecutar funcionalidades core
   
🎯 Suites disponibles:
   auth      - Autenticación (registro + login)
   productos - Gestión de productos
   usuarios  - Gestión de usuarios  
   core      - Funcionalidades principales
   busqueda  - Búsqueda y listados
   ventas    - Carrito y stock
   reportes  - Reportería
   
📊 Características de los informes:
   ✅ Timestamps de inicio y fin para cada caso
   ✅ Evidencias capturadas (screenshots + HTML)
   ✅ Múltiples hojas con análisis detallado
   ✅ Estilos y formato profesional
   ✅ Nombres descriptivos con fecha/hora
   ✅ Reporte consolidado para múltiples features
   ✅ Nombres cortos (F01, F02) o completos (configurable)

⚙️  Variables de entorno:
   SHORT_NAMES=false     Usar nombres completos en archivos
   CAPTURE_EVIDENCE=false Desactivar captura de evidencias
   
🔗 Archivos generados:
   📁 _informes/     - Reportes Excel
   📁 _evidencias/   - Screenshots y HTML captures
        `);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    const runner = new TestRunner();
    runner.run().catch(error => {
        console.error('❌ Error en test runner:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;