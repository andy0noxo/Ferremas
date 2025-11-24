/**
 * Schemas de validación para autenticación
 * Define las reglas de validación para endpoints de autenticación
 */

const { body } = require('express-validator');
const { MESSAGES } = require('../constants');

/**
 * Schema de validación para login
 */
const loginSchema = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),
  
  body('contrasena')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
];

/**
 * Schema de validación para registro
 */
const registerSchema = [
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
 * Schema de validación para cambio de contraseña
 */
const changePasswordSchema = [
  body('contrasenaActual')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('contrasenaNueva')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage(MESSAGES.VALIDATION.PASSWORD_WEAK),
  
  body('confirmarContrasena')
    .custom((value, { req }) => {
      if (value !== req.body.contrasenaNueva) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema
};