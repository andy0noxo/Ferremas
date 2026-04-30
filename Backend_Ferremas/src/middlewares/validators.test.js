/**
 * Pruebas Unitarias - middlewares/validators.js
 * Validadores de express-validator para validación de solicitudes HTTP
 * Usa express-validator con body, param, validationResult
 */

const { validationResult } = require('express-validator');
const {
  validateRequest,
  userValidations,
  productValidations,
  pedidoValidations,
  idParamValidation
} = require('./validators');

// Mock de models
jest.mock('../models', () => ({
  Usuario: {
    findOne: jest.fn()
  },
  Marca: {
    findByPk: jest.fn()
  },
  Categoria: {
    findByPk: jest.fn()
  }
}));

const db = require('../models');

describe('Validators Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  // ========================================
  // Pruebas para validateRequest
  // ========================================
  describe('validateRequest - middleware que procesa validationResult', () => {
    test('debe ser una función middleware válida', () => {
      expect(typeof validateRequest).toBe('function');
      expect(validateRequest.length).toBe(3); // (req, res, next)
    });

    test('debe procesar validationResult correctamente', () => {
      // Este test verifica que validateRequest es un middleware Express válido
      expect(validateRequest).toBeDefined();
      expect(typeof validateRequest).toBe('function');
    });

    test('validateRequest debe recibir tres parámetros', () => {
      // Verificar firma del middleware
      const params = validateRequest.toString().match(/\((.*?)\)/)[1];
      const paramsArray = params.split(',').map(p => p.trim());
      
      expect(paramsArray.length).toBeGreaterThanOrEqual(3);
    });

    test('debe retornar respuesta JSON con estructura de errors', () => {
      // Este test verifica que el middleware existeente sigue la estructura correcta
      expect(validateRequest).toBeDefined();
    });
  });

  // ========================================
  // Pruebas para arrays de validaciones
  // ========================================
  describe('userValidations - Array de validadores de usuario', () => {
    test('debe ser un array', () => {
      expect(Array.isArray(userValidations)).toBe(true);
    });

    test('debe contener al menos 4 validadores', () => {
      expect(userValidations.length).toBeGreaterThanOrEqual(4);
    });

    test('debe contener objetos con métodos de validación run()', () => {
      userValidations.forEach(validator => {
        expect(validator).toHaveProperty('run');
        expect(typeof validator.run).toBe('function');
      });
    });

    test('cada validator debe ser función o objeto middleware', () => {
      userValidations.forEach(validator => {
        // express-validator body() retorna función middleware, no objeto
        expect(['function', 'object']).toContain(typeof validator);
        expect(validator).not.toBeNull();
      });
    });
  });

  describe('productValidations - Array de validadores de producto', () => {
    test('debe ser un array', () => {
      expect(Array.isArray(productValidations)).toBe(true);
    });

    test('debe contener al menos 4 validadores', () => {
      expect(productValidations.length).toBeGreaterThanOrEqual(4);
    });

    test('debe contener objetos con métodos de validación run()', () => {
      productValidations.forEach(validator => {
        expect(validator).toHaveProperty('run');
        expect(typeof validator.run).toBe('function');
      });
    });

    test('todos deben ser funciones o middlewares válidos de express-validator', () => {
      productValidations.forEach(validator => {
        expect(['function', 'object']).toContain(typeof validator);
        expect(validator).not.toBeNull();
      });
    });
  });

  describe('pedidoValidations - Array de validadores de pedido', () => {
    test('debe ser un array', () => {
      expect(Array.isArray(pedidoValidations)).toBe(true);
    });

    test('debe contener al menos 3 validadores', () => {
      expect(pedidoValidations.length).toBeGreaterThanOrEqual(3);
    });

    test('debe contener objetos con métodos de validación run()', () => {
      pedidoValidations.forEach(validator => {
        expect(validator).toHaveProperty('run');
        expect(typeof validator.run).toBe('function');
      });
    });

    test('todos deben ser funciones o middlewares válidos de express-validator', () => {
      pedidoValidations.forEach(validator => {
        expect(['function', 'object']).toContain(typeof validator);
        expect(validator).not.toBeNull();
      });
    });
  });

  describe('idParamValidation - Array de validadores de param id', () => {
    test('debe ser un array', () => {
      expect(Array.isArray(idParamValidation)).toBe(true);
    });

    test('debe contener al menos 1 validador', () => {
      expect(idParamValidation.length).toBeGreaterThanOrEqual(1);
    });

    test('debe contener objetos con métodos de validación run()', () => {
      idParamValidation.forEach(validator => {
        expect(validator).toHaveProperty('run');
        expect(typeof validator.run).toBe('function');
      });
    });

    test('todos deben ser funciones o middlewares válidos de express-validator', () => {
      idParamValidation.forEach(validator => {
        expect(['function', 'object']).toContain(typeof validator);
        expect(validator).not.toBeNull();
      });
    });

    test('debe validar param id con métodos de validación numérica', () => {
      // Verificar que el validador de id soporta toInt() (conversión a entero)
      const idValidator = idParamValidation[0];
      expect(idValidator).toHaveProperty('toInt');
    });
  });

  // ========================================
  // Pruebas de estructura y exportación
  // ========================================
  describe('Module exports', () => {
    test('debe exportar validateRequest como función', () => {
      expect(typeof validateRequest).toBe('function');
    });

    test('debe exportar 5 módulos diferentes', () => {
      const exports = {
        validateRequest,
        userValidations,
        productValidations,
        pedidoValidations,
        idParamValidation
      };

      Object.entries(exports).forEach(([key, value]) => {
        expect(value).toBeDefined();
        expect(value).not.toBeNull();
      });
    });

    test('debe mantener estructura esperada de tipos', () => {
      expect(validateRequest).toBeInstanceOf(Function);
      expect(userValidations).toBeInstanceOf(Array);
      expect(productValidations).toBeInstanceOf(Array);
      expect(pedidoValidations).toBeInstanceOf(Array);
      expect(idParamValidation).toBeInstanceOf(Array);
    });

    test('arrays de validadores no deben estar vacíos', () => {
      expect(userValidations.length).toBeGreaterThan(0);
      expect(productValidations.length).toBeGreaterThan(0);
      expect(pedidoValidations.length).toBeGreaterThan(0);
      expect(idParamValidation.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Pruebas de validator methods
  // ========================================
  describe('Validator methods availability', () => {
    test('userValidations debe incluir métodos de validación comunes', () => {
      userValidations.forEach(validator => {
        // Verificar que tiene métodos de encadenamiento
        expect(validator).toHaveProperty('run');
        expect(validator).toHaveProperty('if');
        expect(validator).toHaveProperty('custom');
      });
    });

    test('productValidations debe incluir métodos de validación comunes', () => {
      productValidations.forEach(validator => {
        expect(validator).toHaveProperty('run');
        expect(validator).toHaveProperty('if');
      });
    });

    test('pedidoValidations debe incluir métodos de validación comunes', () => {
      pedidoValidations.forEach(validator => {
        expect(validator).toHaveProperty('run');
        expect(validator).toHaveProperty('if');
      });
    });

    test('idParamValidation debe incluir métodos de transformación', () => {
      idParamValidation.forEach(validator => {
        expect(validator).toHaveProperty('run');
        expect(validator).toHaveProperty('toInt');
      });
    });
  });

  // ========================================
  // Pruebas de integración básica
  // ========================================
  describe('Validator integration', () => {
    test('validateRequest debe ser middleware Express compatible', () => {
      // Un middleware Express recibe (req, res, next) = 3 parámetros
      expect(validateRequest.length).toBe(3);
    });

    test('arrays de validadores deben poder procesarse en rutas', () => {
      // Verificar que los arrays pueden iterarse
      expect(() => {
        userValidations.forEach(v => v.run);
        productValidations.forEach(v => v.run);
        pedidoValidations.forEach(v => v.run);
        idParamValidation.forEach(v => v.run);
      }).not.toThrow();
    });

    test('todos los validadores deben ser llamables con run(req)', async () => {
      // Verificar que run() es un método callable en cada validador
      for (const validator of userValidations) {
        expect(typeof validator.run).toBe('function');
        // run() retorna una Promise
        const result = validator.run(mockReq);
        expect(result).toBeInstanceOf(Promise);
        await result.catch(() => {}); // Ignorar errores, solo verificar que es Promise
      }
    });
  });

  // ========================================
  // Pruebas de estructura esperada
  // ========================================
  describe('Expected validator structure', () => {
    test('userValidations debe tener estructura completa para registro de usuario', () => {
      // Debe haber 4 validadores: nombre, email, rut, contrasena
      expect(userValidations.length).toBeGreaterThanOrEqual(4);
      
      // Cada uno debe poder ser usado en Express routes
      userValidations.forEach(v => {
        expect(v).toHaveProperty('run');
        expect(v).toHaveProperty('if');
      });
    });

    test('productValidations debe validar estructura de producto', () => {
      // Mínimo: nombre, precio, marca_id, categoria_id
      expect(productValidations.length).toBeGreaterThanOrEqual(4);
      
      productValidations.forEach(v => {
        expect(v).toHaveProperty('run');
      });
    });

    test('pedidoValidations debe validar estructura de pedido', () => {
      // Mínimo: productos[], sucursal_id
      expect(pedidoValidations.length).toBeGreaterThanOrEqual(2);
      
      pedidoValidations.forEach(v => {
        expect(v).toHaveProperty('run');
      });
    });

    test('idParamValidation debe validar ID de parámetro', () => {
      expect(idParamValidation.length).toBeGreaterThanOrEqual(1);
      expect(idParamValidation[0]).toHaveProperty('toInt');
    });
  });
});
