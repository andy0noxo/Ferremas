const XLSX = require('xlsx');
const path = require('path');

// Leer el archivo Excel más reciente
const excelPath = path.join(__dirname, '..', '_informes', 'informe_01_RegistrarUsuario_2025-11-24_04-06-35.xlsx');

console.log('📖 Leyendo archivo:', excelPath);

const workbook = XLSX.readFile(excelPath);

// Listar todas las hojas disponibles
console.log('\n📋 Hojas disponibles en el archivo:');
workbook.SheetNames.forEach((name, index) => {
    console.log(`  ${index + 1}. "${name}"`);
});

// Verificar que existe la hoja Terminal Output (con o sin emoji)
const terminalSheetName = workbook.SheetNames.find(name => 
    name.includes('Terminal Output')
);

if (!terminalSheetName) {
    console.log('\n❌ No se encontró la hoja "Terminal Output"');
    process.exit(1);
}

console.log(`✅ Hoja encontrada: "${terminalSheetName}"`);

// Leer la hoja
const ws = workbook.Sheets[terminalSheetName];
const data = XLSX.utils.sheet_to_json(ws);

console.log('\n📊 Total de filas en Terminal Output:', data.length);

// Verificar las primeras 3 filas
console.log('\n📝 Verificando contenido de "Output Completo":');
console.log('═'.repeat(80));

data.slice(0, 3).forEach((row, index) => {
    console.log(`\n🔹 Fila ${index + 1}:`);
    console.log('  Tipo:', row.Tipo);
    console.log('  Elemento:', row.Elemento);
    console.log('  Caso/Paso:', row['Caso/Paso']);
    console.log('  Estado:', row.Estado);
    console.log('  Output Completo (primeros 300 caracteres):');
    console.log('  ', (row['Output Completo'] || 'VACÍO').substring(0, 300));
    console.log('  Longitud total del output:', (row['Output Completo'] || '').length, 'caracteres');
    console.log('-'.repeat(80));
});

// Verificar si alguna fila tiene output vacío
const filasVacias = data.filter(row => !row['Output Completo'] || row['Output Completo'].trim() === '');
if (filasVacias.length > 0) {
    console.log('\n⚠️  Se encontraron', filasVacias.length, 'filas con output vacío');
} else {
    console.log('\n✅ Todas las filas tienen contenido en "Output Completo"');
}

// Mostrar estadísticas
const outputLengths = data.map(row => (row['Output Completo'] || '').length);
console.log('\n📊 Estadísticas de longitud del output:');
console.log('  Mínimo:', Math.min(...outputLengths), 'caracteres');
console.log('  Máximo:', Math.max(...outputLengths), 'caracteres');
console.log('  Promedio:', Math.round(outputLengths.reduce((a, b) => a + b, 0) / outputLengths.length), 'caracteres');
