#!/usr/bin/env node

/**
 * Script de validación de configuración .env
 * Verifica que todas las variables necesarias estén definidas
 */

require('dotenv').config();

const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT', 
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_EXPIRATION',
  'PORT',
  'NODE_ENV'
];

const optionalEnvVars = [
  'CORS_ORIGIN',
  'TRANSBANK_API_KEY',
  'TRANSBANK_COMMERCE_CODE', 
  'TRANSBANK_RETURN_URL',
  'TRANSBANK_ENVIRONMENT',
  'MOCK_PAYMENT',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'DOLLAR_API_URL',
  'LOG_LEVEL',
  'RATE_LIMIT_WINDOW',
  'RATE_LIMIT_MAX'
];

console.log('🔍 Validando configuración de variables de entorno...\n');

let hasErrors = false;
let hasWarnings = false;

// Verificar variables requeridas
console.log('✅ Variables REQUERIDAS:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ❌ ${varName}: NO DEFINIDA`);
    hasErrors = true;
  } else if (value.includes('tu_') || value.includes('your_')) {
    console.log(`  ⚠️  ${varName}: CONTIENE PLACEHOLDER`);
    hasWarnings = true;
  } else {
    console.log(`  ✅ ${varName}: OK`);
  }
});

console.log('\n📋 Variables OPCIONALES:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ⚪ ${varName}: No definida`);
  } else if (value.includes('tu_') || value.includes('your_')) {
    console.log(`  ⚠️  ${varName}: CONTIENE PLACEHOLDER`);
    hasWarnings = true;
  } else {
    console.log(`  ✅ ${varName}: OK`);
  }
});

// Validaciones específicas
console.log('\n🔧 Validaciones específicas:');

// JWT Secret
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log('  ⚠️  JWT_SECRET: Debería tener al menos 32 caracteres');
  hasWarnings = true;
} else if (process.env.JWT_SECRET) {
  console.log('  ✅ JWT_SECRET: Longitud adecuada');
}

// CORS Origin
if (process.env.CORS_ORIGIN && !process.env.CORS_ORIGIN.includes('8000')) {
  console.log('  ⚠️  CORS_ORIGIN: Debería incluir puerto 8000 para el frontend Django');
  hasWarnings = true;
} else if (process.env.CORS_ORIGIN) {
  console.log('  ✅ CORS_ORIGIN: Configurado para Django');
}

// Node Environment
if (process.env.NODE_ENV === 'production' && process.env.MOCK_PAYMENT === 'true') {
  console.log('  ⚠️  MOCK_PAYMENT: No debería estar en true para producción');
  hasWarnings = true;
} else {
  console.log('  ✅ MOCK_PAYMENT: Configuración apropiada para el entorno');
}

// Transbank
if (process.env.TRANSBANK_API_KEY === '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C') {
  console.log('  ✅ TRANSBANK_API_KEY: Usando clave de integración oficial');
} else if (process.env.TRANSBANK_API_KEY && process.env.TRANSBANK_API_KEY.includes('tu_')) {
  console.log('  ⚠️  TRANSBANK_API_KEY: Contiene placeholder');
  hasWarnings = true;
}

// Resumen final
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ ERRORES ENCONTRADOS: Hay variables requeridas sin definir');
  console.log('   Por favor, configura las variables marcadas como NO DEFINIDA');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  ADVERTENCIAS ENCONTRADAS: Configuración parcial');
  console.log('   El sistema funcionará, pero algunas funciones pueden estar limitadas');
  console.log('   Considera actualizar las variables con placeholders');
  process.exit(0);
} else {
  console.log('✅ CONFIGURACIÓN COMPLETA: Todas las variables están correctamente definidas');
  process.exit(0);
}