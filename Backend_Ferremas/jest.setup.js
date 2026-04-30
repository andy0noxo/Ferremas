// jest.setup.js
// ============================================
// Configuración Global para Jest
// ============================================

// ============================================
// 1. VARIABLES DE ENTORNO PARA PRUEBAS
// ============================================
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.JWT_EXPIRATION = '1h';
process.env.PORT = '3001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'ferremas_test';
process.env.DB_DIALECT = 'mysql';
process.env.DB_FORCE_SYNC = 'false';
process.env.DB_ALTER_SYNC = 'false';
process.env.DB_LOGGING = 'false';
process.env.MORGAN_FORMAT = 'short';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// ============================================
// 2. CONFIGURACIÓN DE TIMEOUT Y MANEJO DE ERRORES
// ============================================
// Timeout global para pruebas con BD (30 segundos)
jest.setTimeout(30000);

// Manejar promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// ============================================
// 3. SILENCIAMIENTO DE LOGS
// ============================================

// Guardar las funciones originales antes de silenciar
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Silenciar logs de consola durante pruebas (excepto errores críticos)
console.log = jest.fn((...args) => {
  // Permitir solo logs que contengan palabras clave importantes
  const message = args[0]?.toString?.() || '';
  if (message.includes('FAIL') || message.includes('PASS') || message.includes('ERROR')) {
    originalConsoleLog(...args);
  }
});

console.error = jest.fn((...args) => {
  // Permitir errores reales
  const message = args[0]?.toString?.() || '';
  if (message.includes('test') || message.includes('Error')) {
    originalConsoleError(...args);
  }
});

console.warn = jest.fn();

// ============================================
// 4. MOCK DE WINSTON (Logger)
// ============================================
// Silenciar Winston logger si está disponible
jest.mock('winston', () => {
  return {
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
    })),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn(),
      colorize: jest.fn(),
      simple: jest.fn(),
      json: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
  };
}, { virtual: true });

// ============================================
// 5. CONFIGURACIÓN DE SEQUELIZE
// ============================================
// Mock global de Sequelize para pruebas
jest.mock('sequelize', () => {
  const Sequelize = jest.requireActual('sequelize');
  return {
    ...Sequelize,
    DataTypes: Sequelize.DataTypes,
  };
});

// ============================================
// 6. HOOKS DE CICLO DE VIDA
// ============================================

beforeAll(() => {
  // Configuración inicial antes de todas las pruebas
  // Timestamp para identificar sesión de pruebas
  global.testStartTime = new Date();
  process.env.NODE_ENV = 'test';
});

beforeEach(() => {
  // Limpiar todos los mocks antes de cada prueba
  jest.clearAllMocks();
  
  // Resetear timers (si se usan fake timers)
  jest.clearAllTimers();
});

afterEach(() => {
  // Limpiar todos los mocks después de cada prueba
  jest.clearAllMocks();
  
  // Restaurar todos los mocks a su implementación original
  jest.restoreAllMocks();
  
  // Limpiar cualquier timer pendiente
  jest.clearAllTimers();
  
  // Limpiar variables globales de prueba
  delete global.testData;
  delete global.testSession;
});

afterAll(async () => {
  // Limpieza final después de todas las pruebas
  jest.clearAllMocks();
  
  // Restaurar funciones originales de console
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  
  // Dar tiempo para que se cierren conexiones
  await new Promise(resolve => setTimeout(resolve, 100));
});

// ============================================
// 7. CONFIGURACIÓN GLOBAL DE UTILIDADES
// ============================================

// Función helper para crear delays en pruebas
global.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función helper para esperar condición
global.waitFor = async (condition, timeout = 5000, interval = 100) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true;
    }
    await global.delay(interval);
  }
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
};

// Función helper para comparar objetos (útil para BD)
global.compareObjects = (obj1, obj2, ignoreKeys = ['createdAt', 'updatedAt']) => {
  const o1 = { ...obj1 };
  const o2 = { ...obj2 };
  ignoreKeys.forEach(key => {
    delete o1[key];
    delete o2[key];
  });
  return JSON.stringify(o1) === JSON.stringify(o2);
};

// ============================================
// 8. CONFIGURACIÓN ADICIONAL
// ============================================

// Deshabilitar llamadas HTTP reales si se usan (activar si usas nock)
// process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

// Configurar zona horaria para pruebas
process.env.TZ = 'America/Santiago';