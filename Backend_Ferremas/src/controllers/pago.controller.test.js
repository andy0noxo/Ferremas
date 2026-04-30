jest.mock('../models', () => ({
  sequelize: {
    transaction: jest.fn()
  },
  Pedido: {
    findByPk: jest.fn(),
    update: jest.fn()
  },
  Pago: {
    create: jest.fn(),
    findOne: jest.fn()
  },
  DetallePedido: {},
  Producto: {},
  Usuario: {}
}));

jest.mock('../services/transbank.service', () => ({
  createTransaction: jest.fn(),
  commitTransaction: jest.fn()
}));

jest.mock('../middlewares/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

jest.mock('../config/roles.config', () => ({
  ADMIN: 'admin'
}));

const db = require('../models');
const TransbankService = require('../services/transbank.service');
const logger = require('../middlewares/logger');
const controller = require('./pago.controller');

describe('pago.controller', () => {
  let req;
  let res;
  let next;
  let transaction;

  beforeEach(() => {
    req = { params: {}, body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };
    db.sequelize.transaction.mockResolvedValue(transaction);
    jest.clearAllMocks();
    db.sequelize.transaction.mockResolvedValue(transaction);
  });

  test('procesarPago returns 404 when pedido does not exist', async () => {
    req.body.pedido_id = 1;
    db.Pedido.findByPk.mockResolvedValue(null);

    await controller.procesarPago(req, res, next);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pedido no encontrado' });
  });

  test('procesarPago returns 403 when user is not authorized', async () => {
    req.body.pedido_id = 1;
    req.user = { id: 10, rol: 'cliente' };
    db.Pedido.findByPk.mockResolvedValue({
      id: 1,
      usuario_id: 99,
      metodo_pago: 'webpay',
      DetallePedidos: []
    });

    await controller.procesarPago(req, res, next);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado para este pedido' });
  });

  test('procesarPago creates payment and returns gateway data', async () => {
    req.body.pedido_id = 1;
    req.user = { id: 10, rol: 'cliente' };
    db.Pedido.findByPk.mockResolvedValue({
      id: 1,
      usuario_id: 10,
      metodo_pago: 'webpay',
      DetallePedidos: [
        { cantidad: 2, precio_unitario: 1000 },
        { cantidad: 1, precio_unitario: 3000 }
      ]
    });
    TransbankService.createTransaction.mockResolvedValue({ url: 'https://pay', token: 'TK1' });
    db.Pago.create.mockResolvedValue({ id: 77 });

    await controller.procesarPago(req, res, next);

    expect(TransbankService.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      buy_order: '1',
      session_id: '10',
      amount: 5000
    }));
    expect(db.Pago.create).toHaveBeenCalledWith(expect.objectContaining({
      pedido_id: 1,
      monto: 5000,
      metodo_pago: 'webpay',
      estado: 'pendiente',
      transbank_token: 'TK1'
    }), { transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      url_pago: 'https://pay',
      token: 'TK1',
      pago_id: 77
    });
  });

  test('procesarPago rolls back and forwards error on failure', async () => {
    req.body.pedido_id = 1;
    req.user = { id: 10, rol: 'cliente' };
    db.Pedido.findByPk.mockResolvedValue({
      id: 1,
      usuario_id: 10,
      metodo_pago: 'webpay',
      DetallePedidos: []
    });
    TransbankService.createTransaction.mockRejectedValue(new Error('tbk failed'));

    await controller.procesarPago(req, res, next);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('confirmarPago returns 400 when token is missing', async () => {
    req.body = {};

    await controller.confirmarPago(req, res, next);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token requerido' });
  });

  test('confirmarPago returns 404 when payment is missing', async () => {
    req.body = { token_ws: 'TK1' };
    db.Pago.findOne.mockResolvedValue(null);

    await controller.confirmarPago(req, res, next);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pago no encontrado' });
  });

  test('confirmarPago completes payment and updates pedido when authorized', async () => {
    req.body = { token_ws: 'TK1' };
    const pago = {
      pedido_id: 9,
      update: jest.fn().mockResolvedValue(undefined)
    };
    db.Pago.findOne.mockResolvedValue(pago);
    TransbankService.commitTransaction.mockResolvedValue({ status: 'AUTHORIZED', tx: 'x' });

    await controller.confirmarPago(req, res, next);

    expect(pago.update).toHaveBeenCalledWith(expect.objectContaining({
      estado: 'completado',
      respuesta_transbank: JSON.stringify({ status: 'AUTHORIZED', tx: 'x' })
    }), { transaction });
    expect(db.Pedido.update).toHaveBeenCalledWith(
      { estado: 'preparado' },
      { where: { id: 9 }, transaction }
    );
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      estado: 'completado',
      detalle: { status: 'AUTHORIZED', tx: 'x' },
      pedido_id: 9
    });
  });

  test('obtenerEstadoPago returns 404 when payment is missing', async () => {
    req.params.pedido_id = '8';
    db.Pago.findOne.mockResolvedValue(null);

    await controller.obtenerEstadoPago(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pago no encontrado' });
  });

  test('obtenerEstadoPago returns 403 when user is not authorized', async () => {
    req.params.pedido_id = '8';
    req.user = { id: 5, rol: 'cliente' };
    db.Pago.findOne.mockResolvedValue({
      estado: 'pendiente',
      monto: 1000,
      fecha_pago: null,
      metodo_pago: 'webpay',
      Pedido: { usuario_id: 99 }
    });

    await controller.obtenerEstadoPago(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado' });
  });

  test('obtenerEstadoPago returns payment state for authorized user', async () => {
    req.params.pedido_id = '8';
    req.user = { id: 5, rol: 'cliente' };
    db.Pago.findOne.mockResolvedValue({
      estado: 'completado',
      monto: 12000,
      fecha_pago: '2026-04-29',
      metodo_pago: 'webpay',
      Pedido: { usuario_id: 5 }
    });

    await controller.obtenerEstadoPago(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      estado: 'completado',
      monto: 12000,
      fecha_pago: '2026-04-29',
      metodo_pago: 'webpay'
    });
  });
});