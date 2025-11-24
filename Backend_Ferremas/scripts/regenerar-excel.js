const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Datos de ejemplo basados en la ejecución anterior
const datosEjemplo = {
    featuresExecuted: [
        {
            name: '01_RegistrarUsuario.feature',
            results: [
                { id: 'CP01a', name: 'Registrar usuario correcto', status: 'PASSED', startTime: '2025-11-23T22:20:32.107Z', endTime: '2025-11-23T22:20:44.541Z', duration: 12.43, steps: 10 },
                { id: 'CP01b', name: 'Registrar usuario bodeguero correcto', status: 'PASSED', startTime: '2025-11-23T22:20:46.685Z', endTime: '2025-11-23T22:21:01.010Z', duration: 14.32, steps: 10 },
                { id: 'CP02', name: 'Registrar usuario con mail duplicado', status: 'PASSED', startTime: '2025-11-23T22:21:03.021Z', endTime: '2025-11-23T22:21:40.518Z', duration: 37.50, steps: 9 }
            ]
        },
        {
            name: '02_Login.feature',
            results: [
                { id: 'CP06', name: 'Login email y password correcto', status: 'PASSED', startTime: '2025-11-23T22:22:41.702Z', endTime: '2025-11-23T22:22:55.801Z', duration: 14.10, steps: 5 },
                { id: 'CP07', name: 'Login email vacío y password correcto', status: 'PASSED', startTime: '2025-11-23T22:22:57.443Z', endTime: '2025-11-23T22:23:08.290Z', duration: 10.85, steps: 5 },
                { id: 'CP08', name: 'Login email correcto password vacío', status: 'PASSED', startTime: '2025-11-23T22:23:10.244Z', endTime: '2025-11-23T22:23:21.090Z', duration: 10.85, steps: 5 }
            ]
        }
    ]
};

// Función para generar evidencias mejoradas
function createEnhancedEvidenceReport() {
    const evidenceData = [];
    const evidenceDir = path.join(__dirname, '..', 'features', '_debug');
    
    if (!fs.existsSync(evidenceDir)) {
        console.log('❌ Directorio de evidencias no encontrado');
        return [];
    }

    // Organizar evidencias por feature → caso → paso
    const organizedEvidence = {};
    
    for (const feature of datosEjemplo.featuresExecuted) {
        const featureName = feature.name.replace('.feature', '');
        organizedEvidence[featureName] = {};
        
        // Buscar archivos de evidencia para esta feature
        const files = fs.readdirSync(evidenceDir)
            .filter(file => {
                const hasFeature = file.includes(featureName) || file.includes(featureName.replace('_', ''));
                const isScreenshot = file.endsWith('.png') || file.endsWith('.jpg');
                return hasFeature && isScreenshot;
            });
        
        console.log(`📁 Feature ${featureName}: encontrados ${files.length} archivos`);
        
        files.forEach(file => {
            // Extraer información del nombre del archivo
            const caseMatch = file.match(/(CP\d+[a-z]*)/i);
            if (caseMatch) {
                const caseId = caseMatch[1];
                const stepNum = 'Paso 1'; // Simplificado para la prueba
                
                if (!organizedEvidence[featureName][caseId]) {
                    organizedEvidence[featureName][caseId] = {};
                }
                if (!organizedEvidence[featureName][caseId][stepNum]) {
                    organizedEvidence[featureName][caseId][stepNum] = [];
                }
                
                organizedEvidence[featureName][caseId][stepNum].push({
                    fileName: file,
                    filePath: path.join(evidenceDir, file),
                    type: 'Screenshot'
                });
            }
        });
    }
    
    // Convertir a formato de tabla
    for (const [featureName, cases] of Object.entries(organizedEvidence)) {
        for (const [caseId, steps] of Object.entries(cases)) {
            for (const [stepNum, evidences] of Object.entries(steps)) {
                evidences.forEach(evidence => {
                    evidenceData.push({
                        '🎯 Feature': featureName,
                        '📋 Caso': caseId,
                        '👣 Paso': stepNum,
                        '📸 Tipo': evidence.type,
                        '📁 Archivo': evidence.fileName,
                        '📂 Ruta': evidence.filePath,
                        '📊 Tamaño': fs.existsSync(evidence.filePath) ? `${Math.round(fs.statSync(evidence.filePath).size / 1024)} KB` : 'N/A'
                    });
                });
            }
        }
    }
    
    return evidenceData;
}

// Crear Excel
const wb = XLSX.utils.book_new();

// 1. Hoja de evidencias con screenshots
console.log('🔍 Creando hoja de evidencias...');
const evidenceData = createEnhancedEvidenceReport();
console.log(`📊 Total evidencias encontradas: ${evidenceData.length}`);

if (evidenceData.length > 0) {
    const evidenceWS = XLSX.utils.json_to_sheet(evidenceData);
    
    // Ajustar anchos de columnas
    evidenceWS['!cols'] = [
        { wch: 20 }, // Feature
        { wch: 12 }, // Caso
        { wch: 15 }, // Paso
        { wch: 12 }, // Tipo
        { wch: 50 }, // Archivo
        { wch: 60 }, // Ruta
        { wch: 10 }  // Tamaño
    ];
    
    XLSX.utils.book_append_sheet(wb, evidenceWS, '📋 Evidencias Detalladas');
} else {
    console.log('⚠️ No se encontraron evidencias para procesar');
}

// 2. Crear datos consolidados
const allCases = [];
datosEjemplo.featuresExecuted.forEach(feature => {
    feature.results.forEach(caso => {
        allCases.push({
            '🎯 Feature': feature.name.replace('.feature', ''),
            '📋 ID Caso': caso.id,
            '📝 Nombre Caso': caso.name,
            '🏆 Estado': caso.status,
            '⏰ Inicio': new Date(caso.startTime).toLocaleString(),
            '🏁 Fin': new Date(caso.endTime).toLocaleString(),
            '⏱️ Duración (s)': caso.duration,
            '👣 Pasos': caso.steps
        });
    });
});

const casesWS = XLSX.utils.json_to_sheet(allCases);
casesWS['!cols'] = [
    { wch: 20 }, // Feature
    { wch: 12 }, // ID Caso
    { wch: 35 }, // Nombre Caso
    { wch: 10 }, // Estado
    { wch: 20 }, // Inicio
    { wch: 20 }, // Fin
    { wch: 12 }, // Duración
    { wch: 8 }   // Pasos
];

XLSX.utils.book_append_sheet(wb, casesWS, '📊 Timeline Consolidado');

// Guardar archivo
const informesDir = path.join(__dirname, '..', '_informes');
if (!fs.existsSync(informesDir)) {
    fs.mkdirSync(informesDir, { recursive: true });
}

const fileName = `Prueba_Evidencias_${new Date().toISOString().slice(0,19).replace(/[T:]/g, '_')}.xlsx`;
const filePath = path.join(informesDir, fileName);

XLSX.writeFile(wb, filePath);
console.log(`✅ Excel generado: ${fileName}`);
console.log(`📂 Ruta completa: ${filePath}`);