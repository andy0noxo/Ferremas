#!/usr/bin/env node

const MultiFeatureExecutor = require('./scripts/ejecutar-multiples-features');
const path = require('path');
const fs = require('fs');

// Test específico para detectar duplicados
function testDuplicados() {
    const executor = new MultiFeatureExecutor();
    const evidenceDir = path.join(__dirname, 'features', '_debug');
    
    console.log('🔍 Análisis de duplicados en el procesamiento...');
    
    if (!fs.existsSync(evidenceDir)) {
        console.log('❌ Directorio _debug no existe');
        return;
    }
    
    const files = fs.readdirSync(evidenceDir);
    console.log(`📁 Total de archivos en _debug: ${files.length}`);
    
    // Simular el procesamiento organizado
    const organizedEvidence = {};
    const featureName = '02_Login';
    organizedEvidence[featureName] = {};
    
    // Agrupar archivos por caso
    const caseGroups = {};
    files.forEach(file => {
        if (file.endsWith('.png')) {
            const caseMatch = file.match(/(CP\d+)/i);
            if (caseMatch) {
                const caseId = caseMatch[1];
                if (!caseGroups[caseId]) {
                    caseGroups[caseId] = [];
                }
                caseGroups[caseId].push(file);
            }
        }
    });
    
    console.log('\n📊 Análisis por caso de prueba:');
    Object.keys(caseGroups).forEach(caseId => {
        const caseFiles = caseGroups[caseId];
        console.log(`\n${caseId}: ${caseFiles.length} archivos`);
        
        // Separar archivos con Step específico de screenshots generales
        const stepFiles = caseFiles.filter(file => file.match(/step(\d+)/i));
        const screenshotFiles = caseFiles.filter(file => !file.match(/step(\d+)/i) && file.includes('screenshot'));
        
        console.log(`  - Archivos con Step: ${stepFiles.length}`);
        console.log(`  - Screenshots generales: ${screenshotFiles.length}`);
        
        // Verificar duplicados en steps
        const stepNumbers = stepFiles.map(file => {
            const match = file.match(/step(\d+)/i);
            return match ? parseInt(match[1], 10) : null;
        }).filter(num => num !== null);
        
        const uniqueSteps = [...new Set(stepNumbers)];
        console.log(`  - Pasos únicos detectados: [${uniqueSteps.join(', ')}]`);
        
        if (stepNumbers.length !== uniqueSteps.length) {
            console.log(`  ⚠️ DUPLICADOS DETECTADOS en ${caseId}:`);
            stepNumbers.forEach((step, index) => {
                if (stepNumbers.indexOf(step) !== index) {
                    console.log(`    - Paso ${step} aparece múltiples veces`);
                }
            });
        }
        
        // Mostrar archivos para debugging
        caseFiles.forEach(file => {
            const stepMatch = file.match(/step(\d+)/i);
            const stepNum = stepMatch ? stepMatch[1] : 'N/A';
            console.log(`    ${stepNum}: ${file.substring(0, 80)}...`);
        });
    });
    
    // Simular el procesamiento de evidencias
    console.log('\n🧪 Simulando procesamiento de evidencias...');
    const evidenceData = [];
    
    for (const [caseId, caseFiles] of Object.entries(caseGroups)) {
        // Crear un mapa para evitar duplicados por nombre de archivo
        const processedFiles = new Set();
        const stepEntries = [];
        const screenshotEntries = [];
        
        // Separar archivos con Step específico de screenshots generales
        const stepFiles = caseFiles.filter(file => file.match(/step(\d+)/i));
        const screenshotFiles = caseFiles.filter(file => !file.match(/step(\d+)/i) && file.includes('screenshot'));
        
        // Ordenar archivos con step por número
        const sortedStepFiles = stepFiles.sort((a, b) => {
            const stepA = a.match(/step(\d+)/i);
            const stepB = b.match(/step(\d+)/i);
            return parseInt(stepA[1], 10) - parseInt(stepB[1], 10);
        });
        
        // Procesar archivos con step numerado
        sortedStepFiles.forEach((file, actualIndex) => {
            // Evitar procesar el mismo archivo dos veces
            if (processedFiles.has(file)) {
                console.log(`⚠️ Archivo duplicado detectado y saltado: ${file}`);
                return;
            }
            processedFiles.add(file);
            
            const stepMatch = file.match(/step(\d+)/i);
            const stepNumber = stepMatch ? parseInt(stepMatch[1], 10) : actualIndex + 1;
            
            stepEntries.push({
                caso: caseId,
                archivo: file,
                paso: stepNumber,
                tipo: 'Step'
            });
        });
        
        // Procesar screenshots generales por separado
        screenshotFiles.forEach((file, index) => {
            if (processedFiles.has(file)) {
                console.log(`⚠️ Screenshot duplicado detectado y saltado: ${file}`);
                return;
            }
            processedFiles.add(file);
            
            screenshotEntries.push({
                caso: caseId,
                archivo: file,
                paso: 999,
                tipo: 'Screenshot Final'
            });
        });
        
        // Ordenar pasos numerados correctamente
        stepEntries.sort((a, b) => a.paso - b.paso);
        
        // Agregar primero los pasos, luego los screenshots generales
        evidenceData.push(...stepEntries);
        evidenceData.push(...screenshotEntries);
    }
    
    console.log(`\n📋 Resultado del procesamiento: ${evidenceData.length} entradas`);
    
    // Verificar duplicados en el resultado final
    console.log('\n🔍 Verificación de duplicados en resultado final:');
    const resultByCaso = {};
    evidenceData.forEach(entry => {
        if (!resultByCaso[entry.caso]) {
            resultByCaso[entry.caso] = [];
        }
        resultByCaso[entry.caso].push(entry);
    });
    
    Object.keys(resultByCaso).forEach(caseId => {
        const entries = resultByCaso[caseId];
        console.log(`${caseId}: ${entries.length} entradas`);
        
        entries.forEach((entry, index) => {
            const stepText = entry.paso === 999 ? 'Final' : entry.paso;
            console.log(`  ${index + 1}. Paso ${stepText}: ${entry.tipo}`);
        });
        
        // Verificar duplicados de pasos
        const steps = entries.filter(e => e.paso !== 999).map(e => e.paso);
        const uniqueSteps = [...new Set(steps)];
        
        if (steps.length !== uniqueSteps.length) {
            console.log(`  ❌ DUPLICADOS ENCONTRADOS en ${caseId}!`);
            const duplicates = steps.filter((step, index) => steps.indexOf(step) !== index);
            console.log(`  Pasos duplicados: [${duplicates.join(', ')}]`);
        } else {
            console.log(`  ✅ ${caseId}: Sin duplicados`);
        }
    });
}

// Ejecutar test
testDuplicados();