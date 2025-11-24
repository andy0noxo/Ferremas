// Importar y probar la función countScreenshotsForCase
const path = require('path');
const fs = require('fs');

// Recrear la función para probar
function countScreenshotsForCase(caseId, feature) {
    const evidenceDir = path.join(__dirname, 'features', '_debug');
    
    if (!fs.existsSync(evidenceDir)) {
        return 0;
    }
    
    try {
        const files = fs.readdirSync(evidenceDir);
        const featureName = feature.replace('.feature', '');
        const featureCode = featureName.match(/(\d+)/)?.[0]; // Extraer número (01, 02, etc.)
        
        const screenshots = files.filter(file => {
            // Debe ser una imagen
            const isScreenshot = file.endsWith('.png') || file.endsWith('.jpg');
            
            // Debe contener el ID del caso
            const hasCaseId = file.includes(caseId);
            
            // Debe pertenecer a la feature correcta
            const hasFeature = file.includes(featureName) || 
                             file.includes(featureName.replace('_', '')) ||
                             (featureCode && file.includes(`F${featureCode}`));
            
            return isScreenshot && hasCaseId && hasFeature;
        });
        
        console.log(`Debug ${caseId}:`, screenshots.slice(0, 3).map(f => f.substring(0, 50)));
        return screenshots.length;
    } catch (error) {
        console.warn(`⚠️ Error contando screenshots para ${caseId}:`, error.message);
        return 0;
    }
}

// Probar la función
console.log('📊 Conteos por caso:');
['CP06', 'CP07', 'CP08', 'CP09', 'CP10'].forEach(caseId => {
  const count = countScreenshotsForCase(caseId, '02_Login.feature');
  console.log(`  ${caseId}: ${count} screenshots`);
});