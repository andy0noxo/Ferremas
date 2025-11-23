#!/usr/bin/env node

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Función para leer y mostrar el contenido de un archivo Excel
function readExcelReport(filePath) {
    try {
        console.log(`📖 Leyendo informe: ${path.basename(filePath)}\n`);
        
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON para mostrar
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`📊 Hoja: ${sheetName}`);
        console.log(`📋 Total de casos: ${data.length}\n`);
        
        // Mostrar estructura de columnas
        if (data.length > 0) {
            console.log('🏗️  Estructura de columnas:');
            Object.keys(data[0]).forEach((col, index) => {
                console.log(`   ${index + 1}. ${col}`);
            });
            console.log('');
        }
        
        // Mostrar datos de cada caso
        data.forEach((row, index) => {
            console.log(`📝 Caso ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
                console.log(`   ${key}: ${value}`);
            });
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error leyendo archivo Excel:', error.message);
    }
}

// Si se ejecuta directamente
if (require.main === module) {
    const informesDir = path.join(__dirname, '..', '_informes');
    
    if (process.argv.length > 2) {
        // Leer archivo específico
        const fileName = process.argv[2];
        const filePath = path.join(informesDir, fileName);
        readExcelReport(filePath);
    } else {
        // Leer el archivo más reciente
        if (fs.existsSync(informesDir)) {
            const files = fs.readdirSync(informesDir)
                .filter(f => f.endsWith('.xlsx'))
                .map(f => ({
                    name: f,
                    path: path.join(informesDir, f),
                    mtime: fs.statSync(path.join(informesDir, f)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);
            
            if (files.length > 0) {
                console.log(`🎯 Leyendo el informe más reciente...\n`);
                readExcelReport(files[0].path);
            } else {
                console.log('❌ No se encontraron archivos Excel en _informes/');
            }
        } else {
            console.log('❌ El directorio _informes/ no existe');
        }
    }
}

module.exports = { readExcelReport };
