/**
 * Schemas de validación para usuarios
 * Define las reglas de validación para endpoints de usuarios
 */

const { body, query, param } = require('express-validator');
const { MESSAGES, BUSINESS } = require('../constants');

/**
 * Schema de validación para crear usuario
 */
const createUserSchema = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),
  
  body('rut')
    .matches(/^[0-9]{7,8}-[0-9kK]$/)
    .withMessage(MESSAGES.VALIDATION.INVALID_RUT),
  
  body('contrasena')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage(MESSAGES.VALIDATION.PASSWORD_WEAK),
  
  body('rol_id')
    .isInt({ min: 1 })
    .withMessage('Rol inválido'),
  
  body('sucursal_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sucursal inválida')
];

/**
 * Schema de validación para actualizar usuario
 */
const updateUserSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),
  
  body('rut')
    .optional()
    .matches(/^[0-9]{7,8}-[0-9kK]$/)
    .withMessage(MESSAGES.VALIDATION.INVALID_RUT),
  
  body('rol_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Rol inválido'),
  
  body('sucursal_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sucursal inválida')
];

/**
 * Schema de validación para parámetros de ID de usuario
 */
const userIdSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido')
];

/**
 * Schema de validación para listado de usuarios
 */
const listUsersSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número de página inválido'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: BUSINESS.PAGINATION.MAX_LIMIT })
    .withMessage(`Límite debe estar entre 1 y ${BUSINESS.PAGINATION.MAX_LIMIT}`),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Término de búsqueda inválido'),
  
  query('rol_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de rol inválido'),
  
  query('sucursal_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de sucursal inválido')
];

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  listUsersSchema
};