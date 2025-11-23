#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

let testProcess = null;
let isTerminating = false;

// Función para limpiar procesos
function cleanup() {
    if (isTerminating) return;
    isTerminating = true;
    
    console.log('\n🧹 Limpiando procesos...');
    
    if (testProcess) {
        testProcess.kill('SIGTERM');
        setTimeout(() => {
            if (testProcess && !testProcess.killed) {
                console.log('⚠️  Forzando terminación del proceso de pruebas...');
                testProcess.kill('SIGKILL');
            }
        }, 3000);
    }
    
    setTimeout(() => {
        console.log('✅ Limpieza completada');
        process.exit(0);
    }, 5000);
}

// Manejar señales de terminación
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

async function runTests(feature = null) {
    return new Promise((resolve, reject) => {
        console.log('🚀 Iniciando ejecutor de pruebas con terminación forzada...');
        
        let comando, args;
        
        if (feature) {
            console.log(`🎯 Ejecutando feature específica: ${feature}`);
            comando = 'npx';
            args = [
                'cucumber-js',
                '--require', './features/support',
                '--require', './features/step_definitions',
                `features/${feature}`
            ];
        } else {
            console.log('🎯 Ejecutando todas las features');
            comando = 'npm';
            args = ['run', 'features'];
        }
        
        testProcess = spawn(comando, args, {
            stdio: 'inherit',
            shell: true
        });
        
        let completed = false;
        
        testProcess.on('close', (code) => {
            if (!completed) {
                completed = true;
                console.log(`\n📊 Proceso completado con código: ${code}`);
                
                // Dar tiempo para que se escriban los archivos finales
                setTimeout(() => {
                    console.log('✅ Ejecución finalizada correctamente');
                    resolve(code);
                }, 2000);
            }
        });
        
        testProcess.on('error', (error) => {
            if (!completed) {
                completed = true;
                console.error('❌ Error en ejecución:', error);
                reject(error);
            }
        });
        
        // Timeout de seguridad para evitar que se cuelgue
        const timeout = setTimeout(() => {
            if (!completed) {
                completed = true;
                console.log('\n⏰ Timeout alcanzado - terminando proceso...');
                testProcess.kill('SIGTERM');
                
                setTimeout(() => {
                    if (testProcess && !testProcess.killed) {
                        testProcess.kill('SIGKILL');
                    }
                    resolve(124); // Exit code for timeout
                }, 3000);
            }
        }, 10 * 60 * 1000); // 10 minutos timeout
        
        testProcess.on('close', () => {
            clearTimeout(timeout);
        });
    });
}

async function main() {
    try {
        const feature = process.argv[2];
        const exitCode = await runTests(feature);
        
        console.log('\n🎉 Ejecución completada exitosamente');
        console.log('📁 Revisa las carpetas _evidencias/ y _debug/ para ver las evidencias');
        
        // Forzar terminación después de un breve delay
        setTimeout(() => {
            process.exit(exitCode);
        }, 1000);
        
    } catch (error) {
        console.error('\n❌ Error en la ejecución:', error.message);
        process.exit(1);
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { runTests };
