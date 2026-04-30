# Jest - Guía de Buenas Prácticas

## 📋 Configuración Actualizada

### `jest.config.js`
✅ **Mejoras implementadas:**
- Corrección de `statements: -10` → `75` (válido)
- `bail: 1` - Detiene en primer error
- `transformIgnorePatterns` - Ignora node_modules
- `collectCoverageFrom` - Cobertura precisa
- `testTimeout: 30000` - Suficiente para BD
- Cobertura granular por carpeta (Controllers: 80%, Middlewares: 85%)
- `restoreMocks: true` - Restaura implementaciones
- Múltiples formatos de reporte

### `jest.setup.js`
✅ **Características añadidas:**
- Variables de entorno automáticas para pruebas
- Silenciamiento de logs (Winston, console)
- Mock de Sequelize
- Hooks de ciclo de vida (before/afterEach)
- Funciones helper globales (delay, waitFor, compareObjects)
- Manejo de promesas rechazadas
- Configuración de zona horaria

### `.env.test`
✅ **Configuración específica para pruebas:**
- Credenciales de BD de prueba
- JWT y servidor en puertos alternativos
- Logging desactivado
- Servicios externos deshabilitados

---

## 🚀 Uso de Jest

### Ejecutar Pruebas
```bash
# Todos los tests
npm test

# Con cobertura
npm run test:coverage

# Modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Test específico
npm test -- auth.controller.test.js

# Test con patrón
npm test -- --testNamePattern="login"

# Test en una carpeta
npm test -- src/controllers
```

### Variables de Entorno en Tests
Las siguientes variables se configuran automáticamente en `jest.setup.js`:
```javascript
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-...'
process.env.DB_NAME = 'ferremas_test'
// etc.
```

**Para pruebas específicas, crea un `.env.test.local` (ignorado en git)**

---

## ✍️ Estructura de Test

### Ejemplo Básico
```javascript
describe('AuthController', () => {
  let authService;

  beforeEach(() => {
    // Setup antes de cada test
    authService = {
      login: jest.fn(),
    };
  });

  afterEach(() => {
    // Cleanup automático (jest.setup.js)
  });

  test('debe validar credenciales', async () => {
    authService.login.mockResolvedValue({ token: 'abc123' });
    
    const result = await authService.login('user', 'pass');
    
    expect(result).toHaveProperty('token');
    expect(authService.login).toHaveBeenCalledWith('user', 'pass');
  });
});
```

### Con Base de Datos (Sequelize)
```javascript
describe('ProductoController - BD', () => {
  let db;

  beforeAll(async () => {
    // Sincronizar BD (una vez antes de todos)
    db = require('../models');
    await db.sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Limpiar tablas antes de cada test
    await db.Producto.destroy({ where: {} });
  });

  afterAll(async () => {
    // Cerrar conexión
    await db.sequelize.close();
  });

  test('debe crear producto', async () => {
    const producto = await db.Producto.create({
      nombre: 'Martillo',
      precio: 15.99,
    });

    expect(producto.id).toBeDefined();
    expect(producto.nombre).toBe('Martillo');
  });
});
```

---

## 🔍 Funciones Helper Globales

### `global.delay(ms)`
Espera N milisegundos:
```javascript
await global.delay(1000); // Espera 1 segundo
```

### `global.waitFor(condition, timeout, interval)`
Espera hasta que se cumpla una condición:
```javascript
await global.waitFor(
  () => user.isActive === true,
  5000,  // timeout
  100    // interval
);
```

### `global.compareObjects(obj1, obj2, ignoreKeys)`
Compara objetos ignorando ciertos campos:
```javascript
global.compareObjects(userData, expectedData, ['createdAt', 'updatedAt']);
// true si son iguales (ignorando timestamps)
```

---

## 📊 Cobertura de Código

### Genera Reporte
```bash
npm run test:coverage
```

### Revisar Reporte HTML
```
coverage/index.html  # Abrir en navegador
```

### Umbrales por Carpeta
- **Global**: 70% coverage
- **Controllers**: 80% coverage
- **Middlewares**: 85% coverage

**Si falla cobertura:**
```bash
# Ver detalle de qué lineas no están cubiertas
npm run test:coverage -- --verbose
```

---

## 🎯 Mocks Comunes

### Mock de Express Response
```javascript
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
};
```

### Mock de Sequelize Model
```javascript
jest.mock('../models/usuario', () => ({
  findByPk: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }),
  create: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }),
}));
```

### Mock de Servicio
```javascript
jest.mock('../services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
```

---

## 🚨 Problemas Comunes

### ❌ "Cannot find module"
**Solución:** Asegurar que testPathIgnorePatterns y transformIgnorePatterns estén correctos

### ❌ "Test timeout"
**Solución:** Aumentar `testTimeout` en jest.config.js (ahora 30s)

### ❌ "Cannot set headers after they are sent"
**Solución:** Usar `mockReturnThis()` en res.status() y res.json()

### ❌ "Logs contaminating output"
**Solución:** Ya manejado en jest.setup.js (silenciamiento automático)

### ❌ "Connection refused" (BD)
**Solución:** Verificar `.env.test` y que la BD de prueba existe

---

## 📝 Mejores Prácticas

1. ✅ **Describe Blocks** - Agrupar tests relacionados
2. ✅ **Nombres descriptivos** - `test('debe validar correo válido')`
3. ✅ **AAA Pattern** - Arrange, Act, Assert
4. ✅ **Mock externals** - No llamar APIs reales
5. ✅ **Limpiar después** - afterEach/afterAll
6. ✅ **Tests independientes** - Sin dependencias entre tests
7. ✅ **Cobertura, no cantidad** - Calidad > Cantidad
8. ✅ **Documentar tests complejos** - Comentarios cuando sea necesario

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Sequelize Testing Guide](https://sequelize.org/docs/v6/guides/hooks/)
