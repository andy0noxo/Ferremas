/**
 * Schemas de validación para productos
 * Define las reglas de validación para endpoints de productos
 */

const { body, query, param } = require('express-validator');
const { BUSINESS } = require('../constants');

/**
 * Schema de validación para crear producto
 */
const createProductSchema = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ\s\-\.\,]+$/)
    .withMessage('El nombre contiene caracteres no válidos'),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: BUSINESS.TEXT_LIMITS.DESCRIPTION })
    .withMessage(`La descripción no puede exceder ${BUSINESS.TEXT_LIMITS.DESCRIPTION} caracteres`),
  
  body('precio')
    .isInt({ min: BUSINESS.PRICING.MIN_PRICE, max: BUSINESS.PRICING.MAX_PRICE })
    .withMessage(`El precio debe estar entre ${BUSINESS.PRICING.MIN_PRICE} y ${BUSINESS.PRICING.MAX_PRICE}`),
  
  body('marca_id')
    .isInt({ min: 1 })
    .withMessage('Marca inválida'),
  
  body('categoria_id')
    .isInt({ min: 1 })
    .withMessage('Categoría inválida')
];

/**
 * Schema de validación para actualizar producto
 */
const updateProductSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: BUSINESS.TEXT_LIMITS.DESCRIPTION })
    .withMessage(`La descripción no puede exceder ${BUSINESS.TEXT_LIMITS.DESCRIPTION} caracteres`),
  
  body('precio')
    .optional()
    .isInt({ min: BUSINESS.PRICING.MIN_PRICE, max: BUSINESS.PRICING.MAX_PRICE })
    .withMessage(`El precio debe estar entre ${BUSINESS.PRICING.MIN_PRICE} y ${BUSINESS.PRICING.MAX_PRICE}`),
  
  body('marca_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Marca inválida'),
  
  body('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Categoría inválida')
];

/**
 * Schema de validación para parámetros de ID
 */
const productIdSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido')
];

/**
 * Schema de validación para búsqueda de productos
 */
const searchProductSchema = [
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
  
  query('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  
  query('marca_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de marca inválido'),
  
  query('precio_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Precio mínimo inválido'),
  
  query('precio_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Precio máximo inválido')
];

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  searchProductSchema
};