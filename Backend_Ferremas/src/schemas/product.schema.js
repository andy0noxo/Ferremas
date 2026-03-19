/**
 * Schemas de validacion para productos
 * Define las reglas de validacion para endpoints de productos
 */

const { body, query, param } = require('express-validator');
const { BUSINESS } = require('../constants');

/**
 * Schema de validacion para crear producto
 */
const createProductSchema = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ\s\-\.\,]+$/)
    .withMessage('El nombre contiene caracteres no validos'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: BUSINESS.TEXT_LIMITS.DESCRIPTION })
    .withMessage(`La descripcion no puede exceder ${BUSINESS.TEXT_LIMITS.DESCRIPTION} caracteres`),

  body('precio')
    .isInt({ min: BUSINESS.PRICING.MIN_PRICE, max: BUSINESS.PRICING.MAX_PRICE })
    .withMessage(`El precio debe estar entre ${BUSINESS.PRICING.MIN_PRICE} y ${BUSINESS.PRICING.MAX_PRICE}`),

  body('stock')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('El stock no puede ser negativo'),

  body('marca_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Marca invalida'),

  body('categoria_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Categoria invalida'),

  body('nueva_marca')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }),

  body('nueva_categoria')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
];

/**
 * Schema de validacion para actualizar producto
 */
const updateProductSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de producto invalido'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: BUSINESS.TEXT_LIMITS.DESCRIPTION })
    .withMessage(`La descripcion no puede exceder ${BUSINESS.TEXT_LIMITS.DESCRIPTION} caracteres`),

  body('precio')
    .optional()
    .isInt({ min: BUSINESS.PRICING.MIN_PRICE, max: BUSINESS.PRICING.MAX_PRICE })
    .withMessage(`El precio debe estar entre ${BUSINESS.PRICING.MIN_PRICE} y ${BUSINESS.PRICING.MAX_PRICE}`),

  body('stock')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('El stock no puede ser negativo'),

  body('marca_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Marca invalida'),

  body('categoria_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Categoria invalida'),

  body('nueva_marca')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }),

  body('nueva_categoria')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
];

/**
 * Schema de validacion para parametros de ID
 */
const productIdSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de producto invalido')
];

/**
 * Schema de validacion para busqueda de productos
 */
const searchProductSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Numero de pagina invalido'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: BUSINESS.PAGINATION.MAX_LIMIT })
    .withMessage(`Limite debe estar entre 1 y ${BUSINESS.PAGINATION.MAX_LIMIT}`),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termino de busqueda invalido'),

  query('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoria invalido'),

  query('marca_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de marca invalido'),

  query('precio_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Precio minimo invalido'),

  query('precio_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Precio maximo invalido')
];

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  searchProductSchema
};