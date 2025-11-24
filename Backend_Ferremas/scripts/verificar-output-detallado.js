const XLSX = require('xlsx');
const path = require('path');

// Leer el archivo Excel más reciente
const excelPath = path.join(__dirname, '..', '_informes', 'informe_01_RegistrarUsuario_2025-11-24_04-14-36.xlsx');

console.log('📖 Leyendo archivo:', excelPath);

const workbook = XLSX.readFile(excelPath);

// Buscar la hoja Terminal Output
const terminalSheetName = workbook.SheetNames.find(name => 
    name.includes('Terminal Output')
);

const ws = workbook.Sheets[terminalSheetName];
const data = XLSX.utils.sheet_to_json(ws);

// Verificar el segundo caso (primer caso de prueba real)
console.log('\n🔍 Análisis detallado del primer caso de prueba:');
console.log('═'.repeat(100));

const primerCaso = data[1]; // Índice 1 porque el 0 es el resumen

console.log('Caso:', primerCaso['Caso/Paso']);
console.log('Elemento:', primerCaso.Elemento);
console.log('Estado:', primerCaso.Estado);
console.log('\n📝 OUTPUT COMPLETO:\n');
console.log(primerCaso['Output Completo']);
console.log('\n' + '═'.repeat(100));

// Verificar que contiene los elementos clave
const output = primerCaso['Output Completo'];
const checks = [
    { name: 'Inicio del escenario', pattern: '🚀 Iniciando escenario' },
    { name: 'Timestamp inicio', pattern: '⏰ Timestamp inicio' },
    { name: 'Pasos ejecutados', pattern: '📝 Paso' },
    { name: 'Evidencias capturadas', pattern: '📸 Evidencias capturadas' },
    { name: 'Timestamp fin', pattern: '⏰ Timestamp fin' },
    { name: 'Duración', pattern: '⏱️  Duración' },
    { name: 'Evidencias guardadas', pattern: '📁 Evidencias guardadas' }
];

console.log('\n✅ Verificación de elementos en el output:');
checks.forEach(check => {
    const found = output.includes(check.pattern);
    console.log(`  ${found ? '✅' : '❌'} ${check.name}: ${found ? 'PRESENTE' : 'AUSENTE'}`);
});

// Contar pasos en el output
const pasosCount = (output.match(/📝 Paso \d+:/g) || []).length;
console.log(`\n📊 Cantidad de pasos encontrados en el output: ${pasosCount}`);

// Verificar si tiene logs de errores del sistema (que deberían estar incluidos)
const tieneErrores = output.includes('ERROR:') || output.includes('DevTools');
console.log(`\n🔍 Incluye logs del sistema (errores, DevTools, etc.): ${tieneErrores ? 'SÍ' : 'NO'}`);

console.log('\n✅ Análisis completado');
