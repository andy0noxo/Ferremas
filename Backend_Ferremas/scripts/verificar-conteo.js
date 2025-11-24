const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Buscar el archivo Excel más reciente
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
    console.log('❌ No se encontraron archivos Excel de suite');
    process.exit(1);
}

const filePath = files[0].path;
console.log(`📖 Leyendo: ${filePath}\n`);

const workbook = XLSX.readFile(filePath);

// Dashboard
const dashboardSheet = workbook.Sheets['📊 Dashboard'];
const dashboardData = XLSX.utils.sheet_to_json(dashboardSheet);
console.log('📊 DASHBOARD:');
console.log(dashboardData[0]);

// Casos & Timeline
const casosSheet = workbook.Sheets['📋⏰ Casos & Timeline'];
const casosData = XLSX.utils.sheet_to_json(casosSheet);
console.log('\n📋 CASOS & TIMELINE:');
console.log(`Total de casos: ${casosData.length}`);
let totalScreenshots = 0;
casosData.forEach(row => {
    const screenshots = row['📸 Screenshots Capturados'] || row['Screenshots Capturados'] || 0;
    totalScreenshots += screenshots;
    console.log(`  ${row['🆔 ID Casos'] || row['ID Casos']}: ${screenshots} screenshots`);
});
console.log(`\n📊 Total screenshots en Casos & Timeline: ${totalScreenshots}`);

// Evidencias
const evidenciasSheet = workbook.Sheets['📸 Evidencias Detalladas'];
const evidenciasData = XLSX.utils.sheet_to_json(evidenciasSheet);
console.log(`\n📸 EVIDENCIAS DETALLADAS:`);
console.log(`Total de evidencias: ${evidenciasData.length}`);

// Contar por feature
const evidenciasPorFeature = {};
evidenciasData.forEach(row => {
    const feature = row['🎯 Feature'] || row['Feature'];
    evidenciasPorFeature[feature] = (evidenciasPorFeature[feature] || 0) + 1;
});
console.log('\nEvidencias por feature:');
Object.entries(evidenciasPorFeature).forEach(([feature, count]) => {
    console.log(`  ${feature}: ${count}`);
});
