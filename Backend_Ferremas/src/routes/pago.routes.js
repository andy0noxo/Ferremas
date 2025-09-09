const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validators');
const { verifyToken } = require('../middlewares/auth.jwt');
const pagoController = require('../controllers/pago.controller');

module.exports = (app) => {
  app.post('/api/pagos/procesar',
    verifyToken,
    [
      body('pedidoId').isInt(),
      body('metodoPago').isIn(['debito', 'credito', 'transferencia']),
      validateRequest
    ],
    pagoController.procesarPago
  );

  app.post('/api/pagos/confirmar',
    [
      body('token_ws').notEmpty(),
      validateRequest
    ],
    pagoController.confirmarPago
  );

  app.get('/api/pagos/estado/:pedidoId',
    verifyToken,
    pagoController.obtenerEstadoPago
  );
};