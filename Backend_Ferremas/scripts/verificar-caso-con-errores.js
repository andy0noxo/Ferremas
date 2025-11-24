const XLSX = require('xlsx');
const path = require('path');

// Leer el archivo Excel más reciente
const excelPath = path.join(__dirname, '..', '_informes', 'informe_01_RegistrarUsuario_2025-11-24_04-19-47.xlsx');

console.log('📖 Leyendo archivo:', excelPath);

const workbook = XLSX.readFile(excelPath);

// Buscar la hoja Terminal Output
const terminalSheetName = workbook.SheetNames.find(name => 
    name.includes('Terminal Output')
);

const ws = workbook.Sheets[terminalSheetName];
const data = XLSX.utils.sheet_to_json(ws);

// Buscar el caso CP02 que tiene errores de registro
console.log('\n🔍 Buscando caso con errores del sistema...');
const casoConErrores = data.find(row => row['Caso/Paso'] && row['Caso/Paso'].includes('CP02'));

if (casoConErrores) {
    console.log('\n📝 Caso encontrado:', casoConErrores['Elemento']);
    console.log('\n📊 OUTPUT COMPLETO (primeros 2000 caracteres):');
    console.log('═'.repeat(100));
    console.log(casoConErrores['Output Completo'].substring(0, 2000));
    console.log('═'.repeat(100));
    
    const output = casoConErrores['Output Completo'];
    
    // Verificar presencia de logs del sistema
    const checks = [
        { name: 'Errores de GPU', pattern: 'ERROR:gpu' },
        { name: 'Errores de registro', pattern: 'PHONE_REGISTRATION_ERROR' },
        { name: 'Errores de GCM', pattern: 'gcm\\engine' },
        { name: 'DevTools', pattern: 'DevTools listening' },
        { name: 'Mensaje de error encontrado', pattern: 'Mensaje de error encontrado' },
        { name: 'Timestamp inicio', pattern: '⏰ Timestamp inicio' },
        { name: 'Timestamp fin', pattern: '⏰ Timestamp fin' },
        { name: 'Duración', pattern: '⏱️  Duración' }
    ];
    
    console.log('\n✅ Verificación de elementos en el output:');
    checks.forEach(check => {
        const found = output.includes(check.pattern);
        console.log(`  ${found ? '✅' : '❌'} ${check.name}: ${found ? 'PRESENTE' : 'AUSENTE'}`);
    });
    
    console.log('\n📏 Longitud total del output:', output.length, 'caracteres');
} else {
    console.log('❌ No se encontró el caso CP02');
}
