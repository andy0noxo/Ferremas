const XLSX = require('xlsx');
const path = require('path');

// Leer el archivo Excel más reciente
const excelPath = path.join(__dirname, '..', '_informes', 'informe_02_Login_2025-11-24_04-31-19.xlsx');

console.log('📖 Leyendo archivo:', excelPath);

const workbook = XLSX.readFile(excelPath);

// Buscar la hoja de Evidencias
const evidenceSheetName = workbook.SheetNames.find(name => 
    name.includes('Evidencias Detalladas')
);

if (!evidenceSheetName) {
    console.log('❌ No se encontró la hoja de Evidencias Detalladas');
    process.exit(1);
}

console.log(`✅ Hoja encontrada: "${evidenceSheetName}"`);

const ws = workbook.Sheets[evidenceSheetName];
const data = XLSX.utils.sheet_to_json(ws);

console.log(`\n📊 Total de evidencias en la hoja: ${data.length}`);

// Agrupar por feature
const byFeature = {};
data.forEach(row => {
    const feature = row.Feature || 'Sin Feature';
    if (!byFeature[feature]) {
        byFeature[feature] = [];
    }
    byFeature[feature].push(row);
});

console.log('\n📋 Evidencias agrupadas por Feature:');
console.log('═'.repeat(80));
Object.keys(byFeature).forEach(feature => {
    console.log(`\n🔹 ${feature}: ${byFeature[feature].length} evidencias`);
    
    // Mostrar las primeras 3
    byFeature[feature].slice(0, 3).forEach(evidence => {
        console.log(`   - ${evidence['Caso de Prueba']}: ${evidence['Paso Detectado']}`);
    });
    
    if (byFeature[feature].length > 3) {
        console.log(`   ... y ${byFeature[feature].length - 3} más`);
    }
});

console.log('\n' + '═'.repeat(80));

// Verificar si hay evidencias de otras features
const hasOtherFeatures = Object.keys(byFeature).some(f => !f.includes('Login'));
if (hasOtherFeatures) {
    console.log('\n⚠️  ADVERTENCIA: Se encontraron evidencias de otras features además de Login');
    console.log('Features detectadas:', Object.keys(byFeature).join(', '));
} else {
    console.log('\n✅ Correcto: Solo hay evidencias de la feature Login');
}
