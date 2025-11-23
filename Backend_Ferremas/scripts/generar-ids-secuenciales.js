#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para generar IDs secuenciales para todos los casos de prueba
function generateSequentialIds() {
    const featuresDir = path.join(__dirname, '..', 'features');
    const files = fs.readdirSync(featuresDir)
        .filter(f => f.endsWith('.feature') && f.match(/^\d+_/)) // Solo features numerados
        .sort(); // Ordenar alfabéticamente para mantener orden 01, 02, 03...
    
    const allCases = [];
    let globalId = 1;
    
    // Primero contar escenarios por feature para calcular rangos
    const featureCounts = [];
    files.forEach(file => {
        const filePath = path.join(featuresDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const scenarios = lines.filter(line => line.trim().startsWith('Scenario:')).length;
        featureCounts.push({ file, scenarios });
    });
    
    // Ahora asignar IDs consecutivos respetando el orden de features
    featureCounts.forEach(({ file, scenarios }) => {
        const filePath = path.join(featuresDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        let scenarioIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('Scenario:')) {
                const scenarioText = line.replace('Scenario:', '').trim();
                
                // Extraer el nombre del escenario (sin el ID actual)
                const match = scenarioText.match(/^(?:CP\d+[a-z]*\s+)?(.+)$/);
                const scenarioName = match ? match[1] : scenarioText;
                
                // Generar nuevo ID secuencial global
                const newId = `CP${String(globalId).padStart(2, '0')}`;
                
                allCases.push({
                    file: file,
                    originalLine: line,
                    originalScenario: scenarioText,
                    newId: newId,
                    scenarioName: scenarioName,
                    newScenarioLine: `  Scenario: ${newId} ${scenarioName}`,
                    scenarioIndex: scenarioIndex
                });
                
                globalId++;
                scenarioIndex++;
            }
        }
    });
    
    return allCases;
}

// Función para obtener el mapeo de IDs
function getIdMapping() {
    const cases = generateSequentialIds();
    const mapping = {};
    
    cases.forEach(caseInfo => {
        const functionality = caseInfo.file.replace('.feature', '');
        if (!mapping[functionality]) {
            mapping[functionality] = [];
        }
        
        mapping[functionality].push({
            id: caseInfo.newId,
            name: `${caseInfo.newId} ${caseInfo.scenarioName}`,
            originalScenario: caseInfo.originalScenario
        });
    });
    
    return mapping;
}

module.exports = {
    generateSequentialIds,
    getIdMapping
};

// Si se ejecuta directamente, mostrar el mapeo
if (require.main === module) {
    console.log('📋 Generando mapeo de IDs secuenciales...\n');
    
    const mapping = getIdMapping();
    let totalCases = 0;
    
    Object.keys(mapping).forEach(functionality => {
        console.log(`🎯 ${functionality}:`);
        mapping[functionality].forEach(testCase => {
            console.log(`   ${testCase.id}: ${testCase.name}`);
            totalCases++;
        });
        console.log('');
    });
    
    console.log(`📊 Total de casos de prueba: ${totalCases}`);
}
