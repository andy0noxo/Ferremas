// jest.config.js
module.exports = {
  // ========================================
  // CONFIGURACIÓN BÁSICA
  // ========================================
  // El entorno de prueba que se utilizará para las pruebas
  testEnvironment: 'node',

  // Parar en el primer error encontrado
  bail: 1,

  // ========================================
  // PATRONES DE ARCHIVOS
  // ========================================
  // Directorios que serán ignorados por Jest
  testPathIgnorePatterns: [
    '/node_modules/',
    '/_informes/',
    '/_evidencias/',
    '/_debug/',
    '/coverage/',
    '/uploads/'
  ],

  // Patrones de archivos de prueba que Jest debe buscar
  testMatch: [
    '**/__tests__/**/*.js?(x)',
    '**/?(*.)+(spec|test).js?(x)'
  ],

  // Patrones a ignorar en transformación (JS plano sin transformar)
  transformIgnorePatterns: [
    'node_modules/(?!(sequelize)/)',
  ],

  // ========================================
  // COBERTURA DE CÓDIGO
  // ========================================
  // Habilitar/deshabilitar la recolección de cobertura de código
  collectCoverage: true,

  // Directorio donde se generarán los reportes de cobertura
  coverageDirectory: 'coverage',

  // Archivos a incluir en reporte de cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
    '!src/models/index.js',
  ],

  // Formatos de reporte de cobertura
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],

  // Umbrales de cobertura para asegurar un mínimo de calidad
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './src/controllers/**': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/middlewares/**': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // ========================================
  // CONFIGURACIÓN DE PRUEBAS
  // ========================================
  // Timeout global para pruebas asincrónicas (30 segundos para BD)
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Un script que se ejecuta después de configurar el entorno de prueba
  // Ideal para cargar variables de entorno o configurar mocks globales
  setupFilesAfterEnv: ['./jest.setup.js'],

  // Limpiar mocks después de cada prueba para evitar interferencias
  clearMocks: true,

  // Restaurar mocks globales después de cada test
  restoreMocks: true,

  // ========================================
  // REPORTERÍA
  // ========================================
  // Mostrar resumen de cobertura
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
  ],

  // Notificar cambios en cobertura
  notify: false,

  // ========================================
  // PERFORMANCE
  // ========================================
  // Máximo workers para pruebas paralelas
  maxWorkers: '50%',

  // Detectar tests abiertos (no llamados)
  detectOpenHandles: false,
};
