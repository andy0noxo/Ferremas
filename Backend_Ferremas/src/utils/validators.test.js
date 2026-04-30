/**
 * Pruebas Unitarias - utils/validators.js
 * Validación de datos de entrada (RUT, contraseña, precio, etc.)
 */

const {
  isValidRUT,
  validatePasswordStrength,
  isValidPrice,
  sanitizeString,
  validatePagination
} = require('./validators');

describe('Validators Utils', () => {
  // ========================================
  // Pruebas para isValidRUT
  // ========================================
  describe('isValidRUT', () => {
    test('debe validar un RUT chileno correcto', () => {
      expect(isValidRUT('12345678-5')).toBe(true);
    });

    test('debe validar RUT con puntos', () => {
      expect(isValidRUT('12.345.678-5')).toBe(true);
    });

    test('debe rechazar RUT con formato inválido', () => {
      expect(isValidRUT('12345678')).toBe(false);
      expect(isValidRUT('123456789')).toBe(false);
    });

    test('debe rechazar RUT nulo o undefined', () => {
      expect(isValidRUT(null)).toBe(false);
      expect(isValidRUT(undefined)).toBe(false);
    });

    test('debe rechazar RUT no string', () => {
      expect(isValidRUT(12345678)).toBe(false);
      expect(isValidRUT({})).toBe(false);
    });

    test('debe validar RUT con dígito verificador k', () => {
      expect(isValidRUT('8765432-k')).toBe(true);
    });

    test('debe rechazar RUT con dígito verificador incorrecto', () => {
      expect(isValidRUT('12345678-0')).toBe(false);
    });
  });

  // ========================================
  // Pruebas para validatePasswordStrength
  // ========================================
  describe('validatePasswordStrength', () => {
    test('debe aceptar contraseña fuerte', () => {
      const result = validatePasswordStrength('MiPassword123!@#');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('debe rechazar contraseña muy corta', () => {
      const result = validatePasswordStrength('Pass1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    test('debe rechazar contraseña sin minúsculas', () => {
      const result = validatePasswordStrength('PASSWORD123!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debe contener al menos una letra minúscula');
    });

    test('debe rechazar contraseña sin mayúsculas', () => {
      const result = validatePasswordStrength('password123!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debe contener al menos una letra mayúscula');
    });

    test('debe rechazar contraseña sin números', () => {
      const result = validatePasswordStrength('MyPassword!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debe contener al menos un número');
    });

    test('debe rechazar contraseña sin caracteres especiales', () => {
      const result = validatePasswordStrength('MyPassword123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Debe contener al menos un carácter especial');
    });

    test('debe retornar múltiples errores para contraseña muy débil', () => {
      const result = validatePasswordStrength('pass');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    test('debe rechazar contraseña nula', () => {
      const result = validatePasswordStrength(null);
      expect(result.isValid).toBe(false);
    });
  });

  // ========================================
  // Pruebas para isValidPrice
  // ========================================
  describe('isValidPrice', () => {
    test('debe aceptar precio válido positivo', () => {
      expect(isValidPrice(100)).toBe(true);
      expect(isValidPrice('99.99')).toBe(true);
    });

    test('debe rechazar precio negativo', () => {
      expect(isValidPrice(-50)).toBe(false);
    });

    test('debe rechazar precio cero', () => {
      expect(isValidPrice(0)).toBe(false);
    });

    test('debe rechazar precio NaN', () => {
      expect(isValidPrice('abc')).toBe(false);
      expect(isValidPrice('12.34.56')).toBe(false);
    });

    test('debe aceptar precio decimal', () => {
      expect(isValidPrice(199.99)).toBe(true);
    });

    test('debe rechazar precio muy alto', () => {
      expect(isValidPrice(10000000)).toBe(false);
    });

    test('debe aceptar precio máximo permitido', () => {
      expect(isValidPrice(9999999)).toBe(true);
    });
  });

  // ========================================
  // Pruebas para sanitizeString
  // ========================================
  describe('sanitizeString', () => {
    test('debe sanitizar string con caracteres especiales HTML', () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    test('debe remover comillas', () => {
      const result = sanitizeString('He said "hello"');
      expect(result).not.toContain('"');
    });

    test('debe remover comillas simples', () => {
      const result = sanitizeString("It's mine");
      expect(result).not.toContain("'");
    });

    test('debe trimear espacios', () => {
      const result = sanitizeString('  texto con espacios  ');
      expect(result).toBe('texto con espacios');
    });

    test('debe retornar string vacío para null', () => {
      expect(sanitizeString(null)).toBe('');
    });

    test('debe retornar string vacío para undefined', () => {
      expect(sanitizeString(undefined)).toBe('');
    });

    test('debe retornar string vacío para no-string', () => {
      expect(sanitizeString(123)).toBe('');
    });

    test('debe preservar caracteres seguros', () => {
      const safe = 'Texto normal con números 123 y guiones-';
      expect(sanitizeString(safe)).toBe(safe);
    });
  });

  // ========================================
  // Pruebas para validatePagination
  // ========================================
  describe('validatePagination', () => {
    test('debe retornar valores por defecto válidos', () => {
      const result = validatePagination(undefined, undefined);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('debe aceptar página y límite válidos', () => {
      const result = validatePagination(2, 20);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    test('debe rechazar página negativa y establecer a 1', () => {
      const result = validatePagination(-5, 10);
      expect(result.page).toBe(1);
    });

    test('debe rechazar límite negativo y establecer a 1', () => {
      const result = validatePagination(1, -10);
      expect(result.limit).toBe(1);
    });

    test('debe rechazar límite mayor a 100', () => {
      const result = validatePagination(1, 200);
      expect(result.limit).toBe(100);
    });

    test('debe convertir strings a números', () => {
      const result = validatePagination('3', '15');
      expect(result.page).toBe(3);
      expect(result.limit).toBe(15);
      expect(typeof result.page).toBe('number');
      expect(typeof result.limit).toBe('number');
    });

    test('debe manejar strings inválidos como NaN', () => {
      const result = validatePagination('abc', 'xyz');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
