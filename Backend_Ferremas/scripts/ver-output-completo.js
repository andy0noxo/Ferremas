const XLSX = require('xlsx');
const path = require('path');

// Leer el archivo Excel más reciente
const excelPath = path.join(__dirname, '..', '_informes', 'informe_01_RegistrarUsuario_2025-11-24_04-19-47.xlsx');

const workbook = XLSX.readFile(excelPath);
const terminalSheetName = workbook.SheetNames.find(name => name.includes('Terminal Output'));
const ws = workbook.Sheets[terminalSheetName];
const data = XLSX.utils.sheet_to_json(ws);

const casoConErrores = data.find(row => row['Caso/Paso'] && row['Caso/Paso'].includes('CP02'));

if (casoConErrores) {
    const output = casoConErrores['Output Completo'];
    
    console.log('\n📊 OUTPUT COMPLETO (Completo):');
    console.log('═'.repeat(100));
    console.log(output);
    console.log('═'.repeat(100));
    
    console.log('\n📏 Longitud total:', output.length, 'caracteres');
    console.log('📝 Número de líneas:', output.split('\n').length);
    
    // Buscar específicamente logs del sistema
    const hasDevTools = output.includes('DevTools listening');
    const hasGPUErrors = output.includes('ERROR:gpu');
    const hasGCMErrors = output.includes('PHONE_REGISTRATION_ERROR');
    
    console.log('\n🔍 Búsqueda de logs del sistema:');
    console.log(`  DevTools listening: ${hasDevTools ? '✅ PRESENTE' : '❌ AUSENTE'}`);
    console.log(`  Errores GPU: ${hasGPUErrors ? '✅ PRESENTE' : '❌ AUSENTE'}`);
    console.log(`  Errores GCM: ${hasGCMErrors ? '✅ PRESENTE' : '❌ AUSENTE'}`);
} else {
    console.log('❌ No se encontró el caso CP02');
}
