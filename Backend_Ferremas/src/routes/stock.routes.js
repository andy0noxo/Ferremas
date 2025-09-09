const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validators');
const { verifyToken, checkRole } = require('../middlewares/auth.jwt');
const stockController = require('../controllers/stock.controller');
const ROLES = require('../config/roles.config');

const router = express.Router();

// Obtener todo el stock general
router.get('/', verifyToken, checkRole([ROLES.ADMIN, ROLES.BODEGUERO, ROLES.VENDEDOR]), stockController.obtenerStockGeneral);

// Actualizar stock de un producto en una sucursal
router.put('/:productoId/sucursal/:sucursalId',
  verifyToken,
  checkRole([ROLES.BODEGUERO, ROLES.ADMIN]),
  [body('cantidad').isInt({ min: 0 }), validateRequest],
  stockController.actualizarStock
);

// Obtener stock de una sucursal específica
router.get('/sucursal/:sucursalId',
  verifyToken,
  stockController.obtenerStockSucursal
);

module.exports = router;