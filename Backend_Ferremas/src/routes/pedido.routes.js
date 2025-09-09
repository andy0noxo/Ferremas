const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validators');
const { verifyToken, checkRole } = require('../middlewares/auth.jwt');
const pedidoController = require('../controllers/pedido.controller');
const ROLES = require('../config/roles.config');

const router = express.Router();

router.get('/', verifyToken, checkRole([ROLES.ADMIN, ROLES.VENDEDOR]), pedidoController.obtenerPedidos); // Nuevo endpoint GET

router.post('/',
  verifyToken,
  checkRole([ROLES.CLIENTE]), // Only clients can create orders
  [
    body('productos').isArray({ min: 1 }),
    body('sucursalId').isInt(),
    body('metodoPago').isIn(['debito', 'credito', 'transferencia']),
    validateRequest
  ],
  pedidoController.createPedido // Corregido: era crearPedido, debe ser createPedido
);

router.put('/:id/estado',
  verifyToken,
  checkRole([ROLES.VENDEDOR, ROLES.ADMIN]),
  [
    body('estado').isIn(['aprobado', 'rechazado', 'preparado', 'despachado', 'entregado']),
    validateRequest
  ],
  pedidoController.updateEstado // Corregido: era actualizarEstado, debe ser updateEstado
);

router.get('/usuario',
  verifyToken,
  pedidoController.obtenerPedidosUsuario
);

router.get('/:id',
  verifyToken,
  pedidoController.obtenerPedidoPorId
);

module.exports = router;