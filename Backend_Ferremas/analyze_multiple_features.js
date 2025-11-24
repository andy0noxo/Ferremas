#!/usr/bin/env node

const XLSX = require('xlsx');
const path = require('path');

// Script para analizar el Excel de múltiples features
function analyzeMultipleFeatures() {
    const informesDir = path.join(__dirname, '_informes');
    const excelFile = path.join(informesDir, 'Suite_F01_F02_23-11-2025_22-47-28.xlsx');
    
    console.log('🔍 Analizando Excel de múltiples features:', excelFile);
    
    try {
        const workbook = XLSX.readFile(excelFile);
        const sheetNames = workbook.SheetNames;
        
        console.log(`📋 Hojas encontradas: ${sheetNames.join(', ')}`);
        
        // Buscar hoja de evidencias
        const evidenceSheetName = sheetNames.find(name => 
            name.includes('Evidencias') || name.includes('📸')
        );
        
        if (!evidenceSheetName) {
            console.log('❌ No se encontró hoja de evidencias');
            return;
        }
        
        console.log(`🎯 Analizando hoja: ${evidenceSheetName}`);
        const evidenceSheet = workbook.Sheets[evidenceSheetName];
        
        // Convertir hoja a JSON para análisis
        const data = XLSX.utils.sheet_to_json(evidenceSheet);
        
        console.log(`📊 Total de filas de datos: ${data.length}`);
        console.log(`📊 Columnas detectadas: ${Object.keys(data[0] || {}).join(', ')}`);
        
        // Mostrar primeras 5 filas para diagnóstico
        console.log(`\n🔍 Primeras 5 filas de datos:`);
        data.slice(0, 5).forEach((row, i) => {
            console.log(`  ${i+1}. Feature: "${row['Feature']}" | Caso: "${row['Caso de Prueba']}" | Paso: "${row['Paso Detectado']}"`);
        });
        
        // Agrupar por feature
        const featureGroups = {};
        data.forEach(row => {
            const feature = row['Feature'] || 'UNKNOWN';
            if (!featureGroups[feature]) {
                featureGroups[feature] = {};
            }
            
            const caseId = row['Caso de Prueba'] || row['Caso'] || 'UNKNOWN';
            if (!featureGroups[feature][caseId]) {
                featureGroups[feature][caseId] = [];
            }
            
            featureGroups[feature][caseId].push({
                fila: data.indexOf(row) + 2,
                paso: row['Paso Detectado'] || row['Paso'] || 'N/D',
                archivo: row['Nombre Archivo'] || row['Archivo'] || 'N/D'
            });
        });
        
        console.log('\n📋 Análisis por feature y caso de prueba:');
        
        let totalDuplicates = 0;
        let totalEntries = 0;
        
        Object.keys(featureGroups).forEach(featureName => {
            console.log(`\n🎯 FEATURE: ${featureName}`);
            
            const cases = featureGroups[featureName];
            Object.keys(cases).forEach(caseId => {
                const entries = cases[caseId];
                totalEntries += entries.length;
                console.log(`\n  ${caseId}: ${entries.length} entradas`);
                
                // Mapear pasos para detectar duplicados
                const stepCounts = {};
                const finalScreenshots = [];
                
                entries.forEach(entry => {
                    if (entry.paso.toLowerCase().includes('resultado final')) {
                        finalScreenshots.push(entry);
                    } else {
                        const stepMatch = entry.paso.match(/Paso (\d+)/);
                        if (stepMatch) {
                            const step = parseInt(stepMatch[1], 10);
                            stepCounts[step] = (stepCounts[step] || 0) + 1;
                        }
                    }
                });
                
                // Mostrar todas las entradas
                entries.forEach((entry, i) => {
                    console.log(`    ${i + 1}. Fila ${entry.fila}: ${entry.paso}`);
                });
                
                // Detectar duplicados
                const duplicates = Object.entries(stepCounts).filter(([step, count]) => count > 1);
                if (duplicates.length > 0) {
                    console.log(`    ❌ DUPLICADOS DETECTADOS:`);
                    duplicates.forEach(([step, count]) => {
                        console.log(`      - Paso ${step} aparece ${count} veces`);
                        totalDuplicates += count - 1;
                    });
                } else {
                    console.log(`    ✅ Sin duplicados de pasos`);
                }
                
                // Verificar screenshots finales
                if (finalScreenshots.length === 1) {
                    console.log(`    ✅ 1 screenshot final correcto`);
                } else if (finalScreenshots.length === 0) {
                    console.log(`    ⚠️ No se encontró screenshot final`);
                } else {
                    console.log(`    ❌ ${finalScreenshots.length} screenshots finales (debería ser 1)`);
                    totalDuplicates += finalScreenshots.length - 1;
                }
            });
        });
        
        console.log(`\n📊 RESUMEN GENERAL:`);
        console.log(`  - Total de features: ${Object.keys(featureGroups).length}`);
        console.log(`  - Total de casos: ${Object.values(featureGroups).reduce((sum, cases) => sum + Object.keys(cases).length, 0)}`);
        console.log(`  - Total de entradas: ${totalEntries}`);
        console.log(`  - Duplicados encontrados: ${totalDuplicates}`);
        
        // Verificar patrones esperados
        console.log(`\n🔍 VERIFICACIONES ADICIONALES:`);
        
        // Verificar que F01 tenga casos con más pasos (9-10) y F02 tenga casos con menos pasos (5)
        const f01Cases = featureGroups['01_RegistrarUsuario'] || {};
        const f02Cases = featureGroups['02_Login'] || {};
        
        console.log(`  - F01_RegistrarUsuario: ${Object.keys(f01Cases).length} casos`);
        console.log(`  - F02_Login: ${Object.keys(f02Cases).length} casos`);
        
        // Verificar patrón de entradas por caso
        Object.keys(f01Cases).forEach(caseId => {
            const entryCount = f01Cases[caseId].length;
            if (entryCount === 10) {
                console.log(`    ✅ ${caseId}: ${entryCount} entradas (9 pasos + 1 final)`);
            } else {
                console.log(`    ⚠️ ${caseId}: ${entryCount} entradas (esperado: 10)`);
            }
        });
        
        Object.keys(f02Cases).forEach(caseId => {
            const entryCount = f02Cases[caseId].length;
            if (entryCount === 6) {
                console.log(`    ✅ ${caseId}: ${entryCount} entradas (5 pasos + 1 final)`);
            } else {
                console.log(`    ⚠️ ${caseId}: ${entryCount} entradas (esperado: 6)`);
            }
        });
        
        if (totalDuplicates > 0) {
            console.log(`\n❌ EL EXCEL TIENE ${totalDuplicates} DUPLICADOS - NECESITA CORRECCIÓN`);
        } else {
            console.log(`\n✅ EL EXCEL ESTÁ CORRECTO - SIN DUPLICADOS`);
        }
        
    } catch (error) {
        console.log('❌ Error analizando Excel:', error.message);
    }
}

// Ejecutar análisis
analyzeMultipleFeatures();