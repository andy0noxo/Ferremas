const path = require('path');
const fs = require('fs');

const evidenceDir = path.join(__dirname, 'features', '_debug');
const files = fs.readdirSync(evidenceDir);

// Contar por caso F01 - Registrar Usuario
const cases = ['CP01a', 'CP01b', 'CP02', 'CP03', 'CP04', 'CP05'];
let total = 0;

console.log('📊 F01 - Registrar Usuario - Conteos por caso:');
cases.forEach(caseId => {
  const screenshots = files.filter(file => 
    (file.endsWith('.png') || file.endsWith('.jpg')) && 
    file.includes('F01') && 
    file.includes(caseId)
  );
  console.log(`  ${caseId}: ${screenshots.length} screenshots`);
  total += screenshots.length;
});

console.log(`📈 Total F01: ${total} screenshots`);
console.log(`📈 Total todos los archivos PNG: ${files.filter(f => f.endsWith('.png')).length}`);