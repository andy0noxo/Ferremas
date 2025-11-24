const XLSX = require('xlsx');
const path = require('path');

// Archivo de referencia
const referencePath = path.join(__dirname, '..', '_informes', 'informe_02_Login_2025-11-24_04-31-19.xlsx');

// Buscar el archivo más reciente
const fs = require('fs');
const informesDir = path.join(__dirname, '..', '_informes');
const files = fs.readdirSync(informesDir)
    .filter(f => f.startsWith('Suite_') && f.endsWith('.xlsx'))
    .map(f => ({
        name: f,
        path: path.join(informesDir, f),
        mtime: fs.statSync(path.join(informesDir, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);

if (files.length === 0) {
    console.log('❌ No se encontró archivo Suite_ reciente');
    process.exit(1);
}

const newPath = files[0].path;

console.log('📊 Comparando archivos Excel:');
console.log('═'.repeat(100));
console.log('📄 Referencia:', path.basename(referencePath));
console.log('📄 Nuevo:', path.basename(newPath));
console.log('═'.repeat(100));

const wbReference = XLSX.readFile(referencePath);
const wbNew = XLSX.readFile(newPath);

console.log('\n📋 COMPARACIÓN DE HOJAS:');
console.log('-'.repeat(100));

// Comparar hojas
const refSheets = wbReference.SheetNames;
const newSheets = wbNew.SheetNames;

console.log(`\n✅ Hojas en Referencia (${refSheets.length}):`);
refSheets.forEach((name, i) => console.log(`   ${i + 1}. ${name}`));

console.log(`\n✅ Hojas en Nuevo (${newSheets.length}):`);
newSheets.forEach((name, i) => console.log(`   ${i + 1}. ${name}`));

// Verificar hojas en común
const commonSheets = refSheets.filter(s => !s.includes('01_') && !s.includes('02_'));

console.log('\n📊 COMPARACIÓN DE CONTENIDO POR HOJA:');
console.log('═'.repeat(100));

commonSheets.forEach(sheetName => {
    const sheetInNew = newSheets.find(s => s.includes(sheetName.replace('📋⏰', '').replace('📊', '').replace('📸', '').replace('💻', '').trim()));
    
    if (!sheetInNew) {
        console.log(`\n❌ Hoja "${sheetName}" no encontrada en nuevo archivo`);
        return;
    }
    
    console.log(`\n🔹 Hoja: ${sheetInNew}`);
    
    const dataRef = XLSX.utils.sheet_to_json(wbReference.Sheets[sheetName]);
    const dataNew = XLSX.utils.sheet_to_json(wbNew.Sheets[sheetInNew]);
    
    console.log(`   Referencia: ${dataRef.length} filas`);
    console.log(`   Nuevo: ${dataNew.length} filas`);
    
    if (dataRef.length > 0 && dataNew.length > 0) {
        const refCols = Object.keys(dataRef[0]);
        const newCols = Object.keys(dataNew[0]);
        
        console.log(`   Columnas Referencia: ${refCols.length}`);
        console.log(`   Columnas Nuevo: ${newCols.length}`);
        
        // Verificar columnas faltantes o adicionales
        const missingCols = refCols.filter(c => !newCols.includes(c));
        const extraCols = newCols.filter(c => !refCols.includes(c));
        
        if (missingCols.length > 0) {
            console.log(`   ⚠️  Columnas faltantes: ${missingCols.join(', ')}`);
        }
        if (extraCols.length > 0) {
            console.log(`   ⚠️  Columnas adicionales: ${extraCols.join(', ')}`);
        }
        
        if (missingCols.length === 0 && extraCols.length === 0) {
            console.log(`   ✅ Estructura de columnas idéntica`);
        }
    }
});

console.log('\n═'.repeat(100));

// Análisis específico de evidencias
const evidenceSheetRef = refSheets.find(s => s.includes('Evidencias'));
const evidenceSheetNew = newSheets.find(s => s.includes('Evidencias'));

if (evidenceSheetRef && evidenceSheetNew) {
    console.log('\n📸 ANÁLISIS DE EVIDENCIAS:');
    console.log('-'.repeat(100));
    
    const evidRef = XLSX.utils.sheet_to_json(wbReference.Sheets[evidenceSheetRef]);
    const evidNew = XLSX.utils.sheet_to_json(wbNew.Sheets[evidenceSheetNew]);
    
    console.log(`Referencia (02_Login): ${evidRef.length} evidencias`);
    console.log(`Nuevo (Suite): ${evidNew.length} evidencias`);
    
    // Agrupar por feature
    const featuresNew = {};
    evidNew.forEach(e => {
        const feature = e.Feature || 'Unknown';
        featuresNew[feature] = (featuresNew[feature] || 0) + 1;
    });
    
    console.log('\nDistribución por Feature en archivo nuevo:');
    Object.keys(featuresNew).forEach(f => {
        console.log(`   ${f}: ${featuresNew[f]} evidencias`);
    });
}

console.log('\n✅ Comparación completada');
