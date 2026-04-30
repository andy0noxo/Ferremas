/**
 * Pruebas Unitarias - constants/messages.js
 * Validación de mensajes constantes del sistema
 */

const MESSAGES = require('./messages');

describe('Constants - Messages', () => {
  // ========================================
  // Pruebas de estructura
  // ========================================
  describe('Structure', () => {
    test('debe existir categoría AUTH', () => {
      expect(MESSAGES.AUTH).toBeDefined();
      expect(typeof MESSAGES.AUTH).toBe('object');
    });

    test('debe existir categoría VALIDATION', () => {
      expect(MESSAGES.VALIDATION).toBeDefined();
      expect(typeof MESSAGES.VALIDATION).toBe('object');
    });

    test('debe existir categoría CRUD', () => {
      expect(MESSAGES.CRUD).toBeDefined();
      expect(typeof MESSAGES.CRUD).toBe('object');
    });

    test('debe existir categoría PRODUCTS', () => {
      expect(MESSAGES.PRODUCTS).toBeDefined();
      expect(typeof MESSAGES.PRODUCTS).toBe('object');
    });

    test('debe existir categoría ORDERS', () => {
      expect(MESSAGES.ORDERS).toBeDefined();
      expect(typeof MESSAGES.ORDERS).toBe('object');
    });
  });

  // ========================================
  // Pruebas de mensajes AUTH
  // ========================================
  describe('AUTH Messages', () => {
    test('debe tener LOGIN_SUCCESS', () => {
      expect(MESSAGES.AUTH.LOGIN_SUCCESS).toBeDefined();
      expect(typeof MESSAGES.AUTH.LOGIN_SUCCESS).toBe('string');
      expect(MESSAGES.AUTH.LOGIN_SUCCESS.length).toBeGreaterThan(0);
    });

    test('debe tener LOGIN_FAILED', () => {
      expect(MESSAGES.AUTH.LOGIN_FAILED).toBeDefined();
      expect(typeof MESSAGES.AUTH.LOGIN_FAILED).toBe('string');
    });

    test('debe tener REGISTER_SUCCESS', () => {
      expect(MESSAGES.AUTH.REGISTER_SUCCESS).toBeDefined();
      expect(typeof MESSAGES.AUTH.REGISTER_SUCCESS).toBe('string');
    });

    test('debe tener REGISTER_FAILED', () => {
      expect(MESSAGES.AUTH.REGISTER_FAILED).toBeDefined();
    });

    test('debe tener TOKEN_INVALID', () => {
      expect(MESSAGES.AUTH.TOKEN_INVALID).toBeDefined();
    });

    test('debe tener TOKEN_REQUIRED', () => {
      expect(MESSAGES.AUTH.TOKEN_REQUIRED).toBeDefined();
    });

    test('debe tener ACCESS_DENIED', () => {
      expect(MESSAGES.AUTH.ACCESS_DENIED).toBeDefined();
    });

    test('todos los mensajes AUTH deben ser strings no vacíos', () => {
      Object.values(MESSAGES.AUTH).forEach(msg => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });

  // ========================================
  // Pruebas de mensajes VALIDATION
  // ========================================
  describe('VALIDATION Messages', () => {
    test('debe tener REQUIRED_FIELD', () => {
      expect(MESSAGES.VALIDATION.REQUIRED_FIELD).toBeDefined();
    });

    test('debe tener INVALID_EMAIL', () => {
      expect(MESSAGES.VALIDATION.INVALID_EMAIL).toBeDefined();
    });

    test('debe tener INVALID_RUT', () => {
      expect(MESSAGES.VALIDATION.INVALID_RUT).toBeDefined();
    });

    test('debe tener PASSWORD_WEAK', () => {
      expect(MESSAGES.VALIDATION.PASSWORD_WEAK).toBeDefined();
    });

    test('debe tener EMAIL_EXISTS', () => {
      expect(MESSAGES.VALIDATION.EMAIL_EXISTS).toBeDefined();
    });

    test('debe tener RUT_EXISTS', () => {
      expect(MESSAGES.VALIDATION.RUT_EXISTS).toBeDefined();
    });

    test('todos los mensajes VALIDATION deben ser strings', () => {
      Object.values(MESSAGES.VALIDATION).forEach(msg => {
        expect(typeof msg).toBe('string');
      });
    });
  });

  // ========================================
  // Pruebas de mensajes CRUD
  // ========================================
  describe('CRUD Messages', () => {
    test('debe tener CREATE_SUCCESS', () => {
      expect(MESSAGES.CRUD.CREATE_SUCCESS).toBeDefined();
    });

    test('debe tener CREATE_ERROR', () => {
      expect(MESSAGES.CRUD.CREATE_ERROR).toBeDefined();
    });

    test('debe tener UPDATE_SUCCESS', () => {
      expect(MESSAGES.CRUD.UPDATE_SUCCESS).toBeDefined();
    });

    test('debe tener UPDATE_ERROR', () => {
      expect(MESSAGES.CRUD.UPDATE_ERROR).toBeDefined();
    });

    test('debe tener DELETE_SUCCESS', () => {
      expect(MESSAGES.CRUD.DELETE_SUCCESS).toBeDefined();
    });

    test('debe tener DELETE_ERROR', () => {
      expect(MESSAGES.CRUD.DELETE_ERROR).toBeDefined();
    });

    test('debe tener NOT_FOUND', () => {
      expect(MESSAGES.CRUD.NOT_FOUND).toBeDefined();
    });

    test('debe tener FETCH_SUCCESS', () => {
      expect(MESSAGES.CRUD.FETCH_SUCCESS).toBeDefined();
    });

    test('debe tener FETCH_ERROR', () => {
      expect(MESSAGES.CRUD.FETCH_ERROR).toBeDefined();
    });
  });

  // ========================================
  // Pruebas de mensajes PRODUCTS
  // ========================================
  describe('PRODUCTS Messages', () => {
    test('debe tener OUT_OF_STOCK', () => {
      expect(MESSAGES.PRODUCTS.OUT_OF_STOCK).toBeDefined();
    });

    test('debe tener INSUFFICIENT_STOCK', () => {
      expect(MESSAGES.PRODUCTS.INSUFFICIENT_STOCK).toBeDefined();
    });

    test('debe tener STOCK_UPDATED', () => {
      expect(MESSAGES.PRODUCTS.STOCK_UPDATED).toBeDefined();
    });
  });

  // ========================================
  // Pruebas de mensajes ORDERS
  // ========================================
  describe('ORDERS Messages', () => {
    test('debe tener ORDER_PLACED', () => {
      expect(MESSAGES.ORDERS.ORDER_PLACED).toBeDefined();
    });

    test('debe tener ORDER_CANCELLED', () => {
      expect(MESSAGES.ORDERS.ORDER_CANCELLED).toBeDefined();
    });
  });

  // ========================================
  // Pruebas de consistencia
  // ========================================
  describe('Message Consistency', () => {
    test('todos los mensajes deben ser strings', () => {
      const walk = (obj) => {
        Object.values(obj).forEach(val => {
          if (typeof val === 'object' && val !== null) {
            walk(val);
          } else {
            expect(typeof val).toBe('string');
          }
        });
      };
      walk(MESSAGES);
    });

    test('ningún mensaje debe estar vacío', () => {
      const walk = (obj) => {
        Object.values(obj).forEach(val => {
          if (typeof val === 'object' && val !== null) {
            walk(val);
          } else {
            expect(val.length).toBeGreaterThan(0);
          }
        });
      };
      walk(MESSAGES);
    });

    test('debe tener al menos 5 categorías', () => {
      const categories = Object.keys(MESSAGES).filter(key =>
        typeof MESSAGES[key] === 'object' && MESSAGES[key] !== null
      );
      expect(categories.length).toBeGreaterThanOrEqual(5);
    });

    test('cada categoría debe tener al menos un mensaje', () => {
      Object.entries(MESSAGES).forEach(([category, messages]) => {
        if (typeof messages === 'object') {
          expect(Object.keys(messages).length).toBeGreaterThan(0);
        }
      });
    });
  });

  // ========================================
  // Pruebas de uso real
  // ========================================
  describe('Usage Examples', () => {
    test('debe poder acceder a mensajes de éxito de login', () => {
      const message = MESSAGES.AUTH.LOGIN_SUCCESS;
      expect(message).toBeTruthy();
      expect(message.toLowerCase()).toMatch(/exitos|inicio de sesi[oó]n/);
    });

    test('debe poder acceder a mensajes de error de email', () => {
      const message = MESSAGES.VALIDATION.INVALID_EMAIL;
      expect(message).toBeTruthy();
      expect(message.toLowerCase()).toContain('email');
    });

    test('debe poder acceder a mensajes de producto sin stock', () => {
      const message = MESSAGES.PRODUCTS.OUT_OF_STOCK;
      expect(message).toBeTruthy();
      expect(message.toLowerCase()).toContain('stock');
    });

    test('debe poder acceder a todos los mensajes sin errores', () => {
      const getAllMessages = (obj) => {
        const messages = [];
        Object.values(obj).forEach(val => {
          if (typeof val === 'object' && val !== null) {
            messages.push(...getAllMessages(val));
          } else {
            messages.push(val);
          }
        });
        return messages;
      };

      const allMessages = getAllMessages(MESSAGES);
      expect(allMessages.length).toBeGreaterThan(0);
      allMessages.forEach(msg => {
        expect(typeof msg).toBe('string');
      });
    });
  });

  // ========================================
  // Pruebas de Internacionalización
  // ========================================
  describe('i18n Compatibility', () => {
    test('debe poder usarse como base para traducción', () => {
      const messageKeys = Object.keys(MESSAGES);
      messageKeys.forEach(category => {
        expect(typeof category).toBe('string');
        expect(category).toMatch(/^[A-Z_]+$/);
      });
    });

    test('las claves deben ser consistentes', () => {
      Object.values(MESSAGES).forEach(category => {
        if (typeof category === 'object') {
          Object.keys(category).forEach(key => {
            expect(key).toMatch(/^[A-Z_]+$/);
          });
        }
      });
    });
  });
});
