#!/usr/bin/env node

const XLSX = require('xlsx');
const path = require('path');

// Script para analizar el Excel generado y detectar duplicados
function analyzeExcel() {
    const informesDir = path.join(__dirname, '_informes');
    const excelFile = path.join(informesDir, 'informe_F02_23-11-2025_22-39-30.xlsx');
    
    console.log('🔍 Analizando Excel generado:', excelFile);
    
    try {
        const workbook = XLSX.readFile(excelFile);
        const sheetNames = workbook.SheetNames;
        
        console.log(`📋 Hojas encontradas: ${sheetNames.join(', ')}`);
        
        // Buscar hoja de evidencias
        let evidenceSheet = null;
        const evidenceSheetName = sheetNames.find(name => 
            name.includes('Evidencias') || name.includes('📸')
        );
        
        if (!evidenceSheetName) {
            console.log('❌ No se encontró hoja de evidencias');
            return;
        }
        
        console.log(`🎯 Analizando hoja: ${evidenceSheetName}`);
        evidenceSheet = workbook.Sheets[evidenceSheetName];
        
        // Convertir hoja a JSON para análisis
        const data = XLSX.utils.sheet_to_json(evidenceSheet);
        
        console.log(`📊 Total de filas de datos: ${data.length}`);
        console.log(`📊 Columnas detectadas: ${Object.keys(data[0] || {}).join(', ')}`);
        
        // Agrupar por caso de prueba
        const caseGroups = {};
        data.forEach((row, index) => {
            const caseId = row['Caso de Prueba'] || row['Caso'] || 'UNKNOWN';
            if (!caseGroups[caseId]) {
                caseGroups[caseId] = [];
            }
            caseGroups[caseId].push({
                fila: index + 2, // +2 porque Excel empieza en 1 y hay header
                paso: row['Paso Detectado'] || row['Paso'] || 'N/D',
                archivo: row['Nombre Archivo'] || row['Archivo'] || 'N/D'
            });
        });
        
        console.log('\n📋 Análisis por caso de prueba:');
        
        let totalDuplicates = 0;
        Object.keys(caseGroups).forEach(caseId => {
            const entries = caseGroups[caseId];
            console.log(`\n${caseId}: ${entries.length} entradas`);
            
            // Mapear pasos para detectar duplicados
            const stepCounts = {};
            entries.forEach(entry => {
                const stepNum = entry.paso.match(/Paso (\d+)/);
                if (stepNum) {
                    const step = parseInt(stepNum[1], 10);
                    stepCounts[step] = (stepCounts[step] || 0) + 1;
                }
            });
            
            // Mostrar todas las entradas
            entries.forEach((entry, i) => {
                console.log(`  ${i + 1}. Fila ${entry.fila}: ${entry.paso}`);
            });
            
            // Detectar duplicados
            const duplicates = Object.entries(stepCounts).filter(([step, count]) => count > 1);
            if (duplicates.length > 0) {
                console.log(`  ❌ DUPLICADOS DETECTADOS:`);
                duplicates.forEach(([step, count]) => {
                    console.log(`    - Paso ${step} aparece ${count} veces`);
                    totalDuplicates += count - 1; // Contar duplicados extra
                });
            } else {
                console.log(`  ✅ Sin duplicados`);
            }
        });
        
        console.log(`\n📊 RESUMEN:`);
        console.log(`  - Total de entradas: ${data.length}`);
        console.log(`  - Casos analizados: ${Object.keys(caseGroups).length}`);
        console.log(`  - Duplicados encontrados: ${totalDuplicates}`);
        
        if (totalDuplicates > 0) {
            console.log(`\n❌ EL EXCEL TIENE DUPLICADOS - NECESITA CORRECCIÓN`);
        } else {
            console.log(`\n✅ EL EXCEL ESTÁ CORRECTO - SIN DUPLICADOS`);
        }
        
    } catch (error) {
        console.log('❌ Error analizando Excel:', error.message);
    }
}

// Ejecutar análisis
analyzeExcel();