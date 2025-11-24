#!/usr/bin/env node
/**
 * Configurador de entornos de prueba para optimizar velocidad vs completitud
 * Permite ejecutar tests en diferentes modos según necesidades
 */

const fs = require('fs');
const path = require('path');

// Configuraciones predefinidas
const configs = {
  fast: {
    name: 'Modo Rápido',
    description: 'Optimizado para máxima velocidad - ideal para desarrollo',
    env: {
      HEADLESS: 'true',
      CAPTURE_EVIDENCE: 'false', 
      STEP_WAIT: 'false',
      FINAL_SCREENSHOT_WAIT: 'false',
      CHROME_ARGS: '--fast-start --disable-background-timer-throttling',
      TEST_TIMEOUT: '15000'
    }
  },
  
  balanced: {
    name: 'Modo Balanceado', 
    description: 'Balance entre velocidad y estabilidad - ideal para CI/CD',
    env: {
      HEADLESS: 'true',
      CAPTURE_EVIDENCE: 'false',
      STEP_WAIT: 'true',
      FINAL_SCREENSHOT_WAIT: 'false', 
      CHROME_ARGS: '--disable-extensions',
      TEST_TIMEOUT: '20000'
    }
  },

  complete: {
    name: 'Modo Completo',
    description: 'Máxima evidencia y estabilidad - ideal para validación final',
    env: {
      HEADLESS: 'false',
      CAPTURE_EVIDENCE: 'true',
      STEP_WAIT: 'true', 
      FINAL_SCREENSHOT_WAIT: 'true',
      CHROME_ARGS: '',
      TEST_TIMEOUT: '30000'
    }
  },

  debug: {
    name: 'Modo Debug',
    description: 'Navegador visible con máxima evidencia - ideal para depuración',
    env: {
      HEADLESS: 'false',
      CAPTURE_EVIDENCE: 'true',
      STEP_WAIT: 'true',
      FINAL_SCREENSHOT_WAIT: 'true',
      CHROME_ARGS: '--start-maximized',
      TEST_TIMEOUT: '60000'
    }
  }
};

// Función para aplicar configuración
function applyConfig(configName) {
  if (!configs[configName]) {
    console.error(`❌ Configuración '${configName}' no encontrada.`);
    console.log('📋 Configuraciones disponibles:');
    Object.keys(configs).forEach(key => {
      console.log(`   - ${key}: ${configs[key].description}`);
    });
    process.exit(1);
  }

  const config = configs[configName];
  console.log(`🔧 Aplicando ${config.name}...`);
  console.log(`📝 ${config.description}\n`);

  // Crear archivo .env.test
  const envPath = path.join(__dirname, '..', '.env.test');
  let envContent = `# Configuración de pruebas - ${config.name}\n`;
  envContent += `# Generado automáticamente el ${new Date().toLocaleString()}\n\n`;
  
  Object.entries(config.env).forEach(([key, value]) => {
    envContent += `${key}=${value}\n`;
  });

  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Archivo de configuración creado: .env.test`);

  // Mostrar configuración aplicada
  console.log('\n📊 Variables configuradas:');
  Object.entries(config.env).forEach(([key, value]) => {
    console.log(`   ${key}=${value}`);
  });

  console.log(`\n🚀 Para ejecutar pruebas con esta configuración:`);
  console.log(`   npm run features:fast`);
  console.log(`   npm run features:single -- 02_Login.feature`);
  console.log('\n💡 La configuración se aplicará automáticamente en la próxima ejecución.');
}

// Función para mostrar configuraciones disponibles
function showConfigs() {
  console.log('🎯 Configuraciones de Prueba Disponibles:\n');
  
  Object.entries(configs).forEach(([key, config]) => {
    console.log(`📋 ${key.toUpperCase()}`);
    console.log(`   Nombre: ${config.name}`);
    console.log(`   Descripción: ${config.description}`);
    console.log(`   Variables principales:`);
    
    // Mostrar solo las variables más importantes para legibilidad
    const importantVars = ['HEADLESS', 'CAPTURE_EVIDENCE', 'TEST_TIMEOUT'];
    importantVars.forEach(varName => {
      if (config.env[varName]) {
        console.log(`     ${varName}=${config.env[varName]}`);
      }
    });
    console.log('');
  });

  console.log('🔧 Para aplicar una configuración:');
  console.log('   node scripts/test-config.js <config>');
  console.log('\n📈 Tiempos estimados por escenario:');
  console.log('   • fast: ~8-12 segundos');
  console.log('   • balanced: ~12-18 segundos');  
  console.log('   • complete: ~20-30 segundos');
  console.log('   • debug: ~30-60 segundos');
}

// Función para crear scripts npm optimizados
function createNpmScripts() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Añadir scripts optimizados
    const newScripts = {
      'test:fast': 'node scripts/test-config.js fast && npm run features',
      'test:balanced': 'node scripts/test-config.js balanced && npm run features',
      'test:complete': 'node scripts/test-config.js complete && npm run features',
      'test:debug': 'node scripts/test-config.js debug && npm run features',
      'test:single:fast': 'node scripts/test-config.js fast && npm run features:single --',
      'test:config': 'node scripts/test-config.js'
    };

    Object.assign(packageJson.scripts, newScripts);
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Scripts npm actualizados en package.json');
    console.log('\n🎯 Nuevos comandos disponibles:');
    Object.entries(newScripts).forEach(([key, value]) => {
      console.log(`   npm run ${key}`);
    });
  }
}

// Función para validar entorno
function validateEnvironment() {
  const requiredPaths = [
    path.join(__dirname, '..', 'features'),
    path.join(__dirname, '..', 'features', 'support', 'hooks.js')
  ];

  for (const reqPath of requiredPaths) {
    if (!fs.existsSync(reqPath)) {
      console.error(`❌ Error: Ruta requerida no encontrada: ${reqPath}`);
      process.exit(1);
    }
  }

  console.log('✅ Entorno de pruebas validado correctamente');
}

// Procesamiento de argumentos de línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showConfigs();
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'list':
    case 'show':
      showConfigs();
      break;
      
    case 'setup':
      validateEnvironment();
      createNpmScripts();
      console.log('\n🎉 Configuración inicial completa');
      break;
      
    case 'validate':
      validateEnvironment();
      break;
      
    default:
      if (configs[command]) {
        validateEnvironment();
        applyConfig(command);
      } else {
        console.error(`❌ Comando desconocido: ${command}`);
        showConfigs();
        process.exit(1);
      }
  }
}

module.exports = { configs, applyConfig, showConfigs };