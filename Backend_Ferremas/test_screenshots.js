const path = require('path');
const fs = require('fs');

const evidenceDir = path.join(__dirname, 'features', '_debug');
const files = fs.readdirSync(evidenceDir);

// Contar por caso
const cases = ['CP06', 'CP07', 'CP08', 'CP09', 'CP10'];
cases.forEach(caseId => {
  const screenshots = files.filter(file => 
    (file.endsWith('.png') || file.endsWith('.jpg')) && 
    file.includes('F02') && 
    file.includes(caseId)
  );
  console.log(`📊 ${caseId}: ${screenshots.length} screenshots`);
});

console.log(`📈 Total screenshots: ${files.filter(f => f.endsWith('.png')).length}`);