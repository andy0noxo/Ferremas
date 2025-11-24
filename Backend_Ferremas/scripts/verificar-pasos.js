const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', '_informes', 'Suite_F01_F02_2025-11-24_15-07-16.xlsx');
console.log(`📖 Leyendo: ${filePath}\n`);

const workbook = XLSX.readFile(filePath);
const sheetName = '📋⏰ Casos & Timeline';
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('🔍 Verificando que las observaciones muestren el número correcto de pasos:\n');

data.forEach((row, index) => {
    const idCaso = row['🆔 ID Casos'] || row['ID Casos'];
    const observacion = row['📝 Observaciones'] || row['Observaciones'];
    
    console.log(`\n📌 Caso ${index + 1}: ${idCaso}`);
    
    // Extraer número de pasos de la observación
    const pasosMatch = observacion.match(/Todos los (\d+) pasos/);
    if (pasosMatch) {
        const numPasos = pasosMatch[1];
        console.log(`   ✅ Pasos detectados: ${numPasos}`);
        console.log(`   📝 Observación: ${observacion.substring(0, 100)}...`);
    } else {
        console.log(`   ⚠️  No se encontró patrón de pasos en la observación`);
        console.log(`   📝 Observación: ${observacion}`);
    }
});

console.log('\n\n📊 Resumen:');
console.log(`Total de casos: ${data.length}`);
