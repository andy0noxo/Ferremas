#!/usr/bin/env node

const XLSX = require('xlsx');
const path = require('path');

// Script para verificar todas las hojas del Excel
function checkAllSheets() {
    const informesDir = path.join(__dirname, '_informes');
    const excelFile = path.join(informesDir, 'Suite_F01_F02_23-11-2025_22-47-28.xlsx');
    
    console.log('🔍 Verificando todas las hojas del Excel:', excelFile);
    
    try {
        const workbook = XLSX.readFile(excelFile);
        const sheetNames = workbook.SheetNames;
        
        console.log(`📋 Hojas encontradas: ${sheetNames.join(', ')}`);
        
        sheetNames.forEach(sheetName => {
            console.log(`\n🎯 Analizando hoja: ${sheetName}`);
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            
            console.log(`  📊 Filas de datos: ${data.length}`);
            
            if (data.length > 0) {
                console.log(`  📊 Columnas: ${Object.keys(data[0]).join(', ')}`);
                
                // Si es una hoja con casos de prueba
                if (data[0]['Caso de Prueba'] || data[0]['Case ID'] || data[0]['Scenario']) {
                    console.log(`  📋 Casos encontrados:`);
                    const uniqueCases = [...new Set(data.map(row => 
                        row['Caso de Prueba'] || row['Case ID'] || row['Scenario'] || 'Unknown'
                    ))];
                    uniqueCases.forEach(caseId => {
                        console.log(`    - ${caseId}`);
                    });
                }
                
                // Si es la hoja de evidencias
                if (sheetName.includes('Evidencias')) {
                    const features = [...new Set(data.map(row => row['Feature'] || 'Unknown'))];
                    console.log(`  🎯 Features en evidencias: ${features.join(', ')}`);
                }
            } else {
                console.log(`  ⚠️ Hoja vacía`);
            }
        });
        
    } catch (error) {
        console.log('❌ Error analizando Excel:', error.message);
    }
}

// Ejecutar análisis
checkAllSheets();