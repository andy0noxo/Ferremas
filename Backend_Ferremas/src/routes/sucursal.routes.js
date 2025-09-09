const { checkRole, verifyToken } = require('../middlewares/auth.jwt');
const { validateRequest } = require('../middlewares/validators');
const sucursalController = require('../controllers/sucursal.controller');
const ROLES = require('../config/roles.config');

const express = require('express');
const router = express.Router();

router.get('/', sucursalController.findAll);
router.get('/:id', sucursalController.findById);
router.post('/', verifyToken, checkRole([ROLES.ADMIN]), [
  // validaciones aquí si es necesario
  validateRequest
], sucursalController.create);
router.get('/:id/stock', verifyToken, checkRole([ROLES.BODEGUERO, ROLES.ADMIN]), sucursalController.getStockSucursal);

module.exports = router;