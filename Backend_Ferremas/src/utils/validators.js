/**
 * Utilidades de validación
 * Funciones reutilizables para validar datos de entrada
 */

/**
 * Valida formato de RUT chileno
 * @param {string} rut - RUT a validar (formato: 12345678-9)
 * @returns {boolean} true si es válido
 */
const isValidRUT = (rut) => {
  if (!rut || typeof rut !== 'string') return false;
  
  const rutRegex = /^[0-9]{7,8}-[0-9kK]$/;
  if (!rutRegex.test(rut)) return false;
  
  const [numbers, dv] = rut.split('-');
  let sum = 0;
  let multiplier = 2;
  
  // Calcular dígito verificador
  for (let i = numbers.length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDV = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'k' : (11 - remainder).toString());
  
  return dv.toLowerCase() === calculatedDV;
};

/**
 * Valida fortaleza de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} {isValid: boolean, errors: string[]}
 */
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida formato de precio
 * @param {any} price - Precio a validar
 * @returns {boolean} true si es válido
 */
const isValidPrice = (price) => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0 && numPrice <= 9999999;
};

/**
 * Sanitiza string para evitar inyecciones
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/[<>"']/g, '');
};

/**
 * Valida parámetros de paginación
 * @param {any} page - Número de página
 * @param {any} limit - Límite de elementos
 * @returns {object} {page: number, limit: number}
 */
const validatePagination = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
  return { page: validPage, limit: validLimit };
};

/**
 * Valida que un valor esté en una lista de opciones válidas
 * @param {any} value - Valor a validar
 * @param {array} validOptions - Opciones válidas
 * @returns {boolean} true si es válido
 */
const isValidOption = (value, validOptions) => {
  return validOptions.includes(value);
};

module.exports = {
  isValidRUT,
  validatePasswordStrength,
  isValidPrice,
  sanitizeString,
  validatePagination,
  isValidOption
};