const express = require('express');
const { checkRole, verifyToken } = require('../middlewares/auth.jwt');
const ventaController = require('../controllers/venta.controller');
const ROLES = require('../config/roles.config');

const router = express.Router();

// Mueve la ruta de informe-mensual antes de la ruta con parámetro :id para evitar conflictos de rutas
router.get('/informe-mensual', verifyToken, checkRole([ROLES.ADMIN]), ventaController.informeMensualPorSucursal);
router.get('/', verifyToken, checkRole([ROLES.ADMIN, ROLES.VENDEDOR]), ventaController.findAll);
router.get('/:id', verifyToken, checkRole([ROLES.ADMIN, ROLES.VENDEDOR]), ventaController.findById);
router.delete('/:id', verifyToken, checkRole([ROLES.ADMIN]), ventaController.delete);

module.exports = router;
