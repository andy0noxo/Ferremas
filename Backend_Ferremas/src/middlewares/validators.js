const { body, param, validationResult } = require('express-validator');
const db = require('../models');
const ROLES = require('../config/roles.config');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userValidations = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2-100 caracteres'),
  body('email')
    .isEmail()
    .custom(async (value, { req }) => {
      // Permitir el mismo email si es update y corresponde al usuario actual
      const user = await db.Usuario.findOne({ where: { email: value } });
      if (user && (!req.params.id || user.id != req.params.id)) {
        throw new Error('Email ya registrado');
      }
    }),
  body('rut')
    .matches(/^[0-9]{7,8}-[0-9kK]$/)
    .withMessage('RUT inválido'),
  body('contrasena')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1
    })
    .withMessage('La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 símbolo')
];

const productValidations = [
  body('nombre').isLength({ min: 3, max: 100 }),
  body('precio').isFloat({ min: 1 }),
  body('marca_id').isInt().custom(async value => {
    const exists = await db.Marca.findByPk(value);
    if (!exists) throw new Error('Marca no existe');
  }),
  body('categoria_id').isInt().custom(async value => {
    const exists = await db.Categoria.findByPk(value);
    if (!exists) throw new Error('Categoría no existe');
  })
];

const pedidoValidations = [
  body('productos').isArray({ min: 1 }),
  body('productos.*.producto_id').isInt(),
  body('productos.*.cantidad').isInt({ min: 1 }),
  body('sucursal_id').isInt()
];

const idParamValidation = [
  param('id').isInt().toInt()
];

module.exports = {
  validateRequest,
  userValidations,
  productValidations,
  pedidoValidations,
  idParamValidation
};