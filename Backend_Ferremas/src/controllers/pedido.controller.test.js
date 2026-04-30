jest.mock('../models', () => ({
  Sequelize: {
    Op: {
      gte: 'gte',
      lt: 'lt',
      not: 'not'
    }
  },
  sequelize: {
    transaction: jest.fn()
  },
  Pedido: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  DetallePedido: {
    bulkCreate: jest.fn()
  },
  Stock: {
    decrement: jest.fn(),
    findOne: jest.fn()
  },
  Usuario: {},
  Sucursal: {
    findByPk: jest.fn()
  },
  Pago: {
    create: jest.fn()
  },
  Producto: {}
}));

jest.mock('../services/transbank.service', () => ({
  createTransaction: jest.fn()
}));

jest.mock('../services/email.service', () => ({
  sendOrderConfirmation: jest.fn(),
  sendReadyForPickup: jest.fn()
}));

jest.mock('../services/cart.service', () => ({
  calculateCartTotal: jest.fn()
}));

jest.mock('../services/exchangeRateHost.service', () => ({
  getCurrentRate: jest.fn()
}));

jest.mock('../middlewares/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

const db = require('../models');
const CartService = require('../services/cart.service');
const EmailService = require('../services/email.service');
const ExchangeRateHostService = require('../services/exchangeRateHost.service');
const TransbankService = require('../services/transbank.service');
const controller = require('./pedido.controller');

describe('pedido.controller', () => {
  let req;
  let res;
  let next;
  let transaction;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      user: { id: 10, email: 'cliente@test.cl', rol: 'Cliente' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      finished: false
    };
    db.sequelize.transaction.mockResolvedValue(transaction);
    process.env.MOCK_PAYMENT = 'true';
    jest.clearAllMocks();
    db.sequelize.transaction.mockResolvedValue(transaction);
    process.env.MOCK_PAYMENT = 'true';
  });

  afterEach(() => {
    delete process.env.MOCK_PAYMENT;
  });

  test('createPedido returns error when sucursal is missing', async () => {
    req.body = { productos: [] };

    await controller.createPedido(req, res, next);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('createPedido returns error when stock is insufficient', async () => {
    req.body = { sucursalId: 1, productos: [{ id: 1, cantidad: 2 }] };
    CartService.calculateCartTotal.mockResolvedValue({
      items: [{ producto_id: 1, cantidad: 2, precio: 1000, stockValido: false }],
      total: 2000
    });

    await controller.createPedido(req, res, next);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('createPedido creates order and payment in mock mode', async () => {
    req.body = {
      sucursalId: 2,
      productos: [{ id: 1, cantidad: 2 }],
      metodoPago: 'webpay',
      direccionEnvio: 'Calle 123'
    };
    CartService.calculateCartTotal.mockResolvedValue({
      items: [{ producto_id: 1, cantidad: 2, precio: 1000, stockValido: true }],
      total: 2000
    });
    ExchangeRateHostService.getCurrentRate.mockResolvedValue(0.001);
    const pedido = {
      id: 50,
      total: 2000,
      metodo_pago: 'webpay',
      toJSON: () => ({ id: 50, total: 2000, metodo_pago: 'webpay' })
    };
    db.Pedido.create.mockResolvedValue(pedido);
    db.DetallePedido.bulkCreate.mockResolvedValue([{ id: 1 }]);
    db.Stock.decrement.mockResolvedValue(undefined);
    db.Pago.create.mockResolvedValue({ id: 99 });
    EmailService.sendOrderConfirmation.mockResolvedValue(undefined);

    await controller.createPedido(req, res, next);

    expect(db.Pedido.create).toHaveBeenCalledWith(expect.objectContaining({
      usuario_id: 10,
      sucursal_retiro: 2,
      direccion_envio: 'Calle 123',
      metodo_pago: 'webpay',
      total: 2000
    }), { transaction });
    expect(db.DetallePedido.bulkCreate).toHaveBeenCalledTimes(1);
    expect(db.Stock.decrement).toHaveBeenCalledTimes(1);
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(db.Pago.create).toHaveBeenCalledWith(expect.objectContaining({
      pedido_id: 50,
      monto: 2000,
      metodo_pago: 'webpay',
      estado: 'completado',
      transbank_token: 'MOCK_TOKEN_50'
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      pedido: expect.objectContaining({ id: 50, total_usd: 2 }),
      payment_url: '/mock-pago-exitoso/50',
      mock_payment: true
    }));
  });

  test('createPedido procesa pago real cuando MOCK_PAYMENT es false', async () => {
    process.env.MOCK_PAYMENT = 'false';
    req.body = {
      sucursalId: 2,
      productos: [{ id: 1, cantidad: 2 }],
      metodoPago: 'webpay'
    };
    CartService.calculateCartTotal.mockResolvedValue({
      items: [{ producto_id: 1, cantidad: 2, precio: 1000, stockValido: true }],
      total: 2000
    });
    ExchangeRateHostService.getCurrentRate.mockResolvedValue(0.001);
    const pedido = {
      id: 53,
      total: 2000,
      metodo_pago: 'webpay',
      toJSON: () => ({ id: 53, total: 2000, metodo_pago: 'webpay' })
    };
    db.Pedido.create.mockResolvedValue(pedido);
    db.DetallePedido.bulkCreate.mockResolvedValue([{ id: 1 }]);
    db.Stock.decrement.mockResolvedValue(undefined);
    db.Pago.create.mockResolvedValue({ id: 101 });
    TransbankService.createTransaction.mockResolvedValue({ url: 'https://tbk', token: 'TBK53' });
    EmailService.sendOrderConfirmation.mockResolvedValue(undefined);

    await controller.createPedido(req, res, next);

    expect(TransbankService.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      buy_order: '53',
      session_id: '10',
      amount: 2000
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      payment_url: 'https://tbk',
      mock_payment: false
    }));
  });

  test('createPedido acepta alias sucursal_id y direccion_envio', async () => {
    process.env.MOCK_PAYMENT = 'false';
    req.body = {
      sucursal_id: 2,
      productos: [{ id: 1, cantidad: 1 }],
      metodo_pago: 'webpay',
      direccion_envio: 'Pasaje 456'
    };
    CartService.calculateCartTotal.mockResolvedValue({
      items: [{ producto_id: 1, cantidad: 1, precio: 1000, stockValido: true }],
      total: 1000
    });
    ExchangeRateHostService.getCurrentRate.mockResolvedValue(0.001);
    const pedido = {
      id: 54,
      total: 1000,
      metodo_pago: 'webpay',
      toJSON: () => ({ id: 54, total: 1000, metodo_pago: 'webpay' })
    };
    db.Pedido.create.mockResolvedValue(pedido);
    db.DetallePedido.bulkCreate.mockResolvedValue([{ id: 1 }]);
    db.Stock.decrement.mockResolvedValue(undefined);
    db.Pago.create.mockResolvedValue({ id: 102 });
    TransbankService.createTransaction.mockResolvedValue({ url: 'https://tbk2', token: 'TBK54' });
    EmailService.sendOrderConfirmation.mockResolvedValue(undefined);

    await controller.createPedido(req, res, next);

    expect(db.Pedido.create).toHaveBeenCalledWith(expect.objectContaining({
      sucursal_retiro: 2,
      direccion_envio: 'Pasaje 456',
      metodo_pago: 'webpay'
    }), expect.any(Object));
  });

  test('createPedido returns 500 when payment processing fails', async () => {
    req.body = {
      sucursalId: 2,
      productos: [{ id: 1, cantidad: 2 }],
      metodoPago: 'webpay'
    };
    CartService.calculateCartTotal.mockResolvedValue({
      items: [{ producto_id: 1, cantidad: 2, precio: 1000, stockValido: true }],
      total: 2000
    });
    ExchangeRateHostService.getCurrentRate.mockResolvedValue(0.001);
    const pedido = {
      id: 51,
      total: 2000,
      metodo_pago: 'webpay',
      toJSON: () => ({ id: 51, total: 2000, metodo_pago: 'webpay' })
    };
    db.Pedido.create.mockResolvedValue(pedido);
    db.DetallePedido.bulkCreate.mockResolvedValue([{ id: 1 }]);
    db.Stock.decrement.mockResolvedValue(undefined);
    db.Pago.create.mockRejectedValueOnce(new Error('pago fallido'));

    await controller.createPedido(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error al procesar el pago',
      detalle: 'pago fallido'
    });
  });

  test('createPedido uses null USD total when exchange rate is unavailable', async () => {
    req.body = {
      sucursalId: 2,
      productos: [{ id: 1, cantidad: 1 }],
      metodoPago: 'webpay'
    };
    CartService.calculateCartTotal.mockResolvedValue({
      items: [{ producto_id: 1, cantidad: 1, precio: 1000, stockValido: true }],
      total: 1000
    });
    ExchangeRateHostService.getCurrentRate.mockRejectedValueOnce(new Error('rate unavailable'));
    const pedido = {
      id: 52,
      total: 1000,
      metodo_pago: 'webpay',
      toJSON: () => ({ id: 52, total: 1000, metodo_pago: 'webpay' })
    };
    db.Pedido.create.mockResolvedValue(pedido);
    db.DetallePedido.bulkCreate.mockResolvedValue([{ id: 1 }]);
    db.Stock.decrement.mockResolvedValue(undefined);
    db.Pago.create.mockResolvedValue({ id: 100 });
    EmailService.sendOrderConfirmation.mockResolvedValue(undefined);

    await controller.createPedido(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      pedido: expect.objectContaining({ id: 52, total_usd: null }),
      mock_payment: true
    }));
  });

  test('updateEstado rejects customer changing to non cancel state', async () => {
    req.params.id = '15';
    req.body = { estado: 'preparado' };
    req.user = { id: 10, rol: 'Cliente' };
    db.Pedido.findByPk.mockResolvedValue({
      id: 15,
      usuario_id: 10,
      estado: 'pendiente',
      update: jest.fn(),
      usuario: { email: 'cliente@test.cl' }
    });

    await controller.updateEstado(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Clientes solo pueden cancelar pedidos.' });
  });

  test('updateEstado allows admin and sends ready email when prepared', async () => {
    req.params.id = '15';
    req.body = { estado: 'preparado' };
    req.user = { id: 1, rol: 'admin' };
    const pedido = {
      id: 15,
      usuario_id: 99,
      estado: 'pendiente',
      usuario: { email: 'usuario@test.cl' },
      update: jest.fn().mockResolvedValue(undefined)
    };
    db.Pedido.findByPk.mockResolvedValue(pedido);

    await controller.updateEstado(req, res, next);

    expect(pedido.update).toHaveBeenCalledWith({ estado: 'preparado' });
    expect(EmailService.sendReadyForPickup).toHaveBeenCalledWith('usuario@test.cl', 15);
    expect(res.json).toHaveBeenCalledWith(pedido);
  });

  test('updateEstado rejects customer changing another user pedido', async () => {
    req.params.id = '16';
    req.body = { estado: 'rechazado' };
    req.user = { id: 10, rol: 'Cliente' };
    db.Pedido.findByPk.mockResolvedValue({
      id: 16,
      usuario_id: 99,
      estado: 'pendiente',
      update: jest.fn(),
      usuario: { email: 'otro@test.cl' }
    });

    await controller.updateEstado(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No autorizado para modificar este pedido.' });
  });

  test('updateEstado rejects cancelling a non pending pedido', async () => {
    req.params.id = '17';
    req.body = { estado: 'rechazado' };
    req.user = { id: 10, rol: 'Cliente' };
    db.Pedido.findByPk.mockResolvedValue({
      id: 17,
      usuario_id: 10,
      estado: 'preparado',
      update: jest.fn(),
      usuario: { email: 'cliente@test.cl' }
    });

    await controller.updateEstado(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Solo se pueden cancelar pedidos pendientes.' });
  });

  test('obtenerPedidos returns list of pedidos', async () => {
    const pedidos = [{ id: 1 }];
    db.Pedido.findAll.mockResolvedValue(pedidos);

    await controller.obtenerPedidos(req, res, next);

    expect(res.json).toHaveBeenCalledWith(pedidos);
  });

  test('obtenerPedidosUsuario filters by authenticated user', async () => {
    const pedidos = [{ id: 2 }];
    db.Pedido.findAll.mockResolvedValue(pedidos);

    await controller.obtenerPedidosUsuario(req, res, next);

    expect(db.Pedido.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { usuario_id: 10 }
    }));
    expect(res.json).toHaveBeenCalledWith(pedidos);
  });

  test('obtenerPedidoPorId returns 404 when pedido is missing', async () => {
    req.params.id = '20';
    db.Pedido.findByPk.mockResolvedValue(null);

    await controller.obtenerPedidoPorId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pedido no encontrado' });
  });

  test('obtenerPedidoPorId enriches pedido details and shipping totals', async () => {
    req.params.id = '20';
    ExchangeRateHostService.getCurrentRate.mockResolvedValue(0.001);
    const pedido = {
      id: 20,
      total: 15000,
      direccion_envio: 'Calle 1',
      sucursal_retiro: 3,
      toJSON: () => ({
        id: 20,
        total: 15000,
        direccion_envio: 'Calle 1',
        sucursal_retiro: 3,
        detalles: [
          { producto_id: 1, precio_unitario: 5000, cantidad: 2, producto: { id: 1, nombre: 'Taladro' } }
        ]
      })
    };
    db.Pedido.findByPk.mockResolvedValue(pedido);
    db.Stock.findOne.mockResolvedValue({ cantidad: 7 });

    await controller.obtenerPedidoPorId(req, res, next);

    expect(db.Stock.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: { producto_id: 1, sucursal_id: 3 }
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: 20,
      clp_to_usd_rate: 0.001,
      costo_envio: 5000,
      subtotal_productos: 10000,
      total_usd: 15
    }));
  });

  test('obtenerPedidoPorId handles pedidos sin envio y sin tasa de cambio', async () => {
    req.params.id = '21';
    ExchangeRateHostService.getCurrentRate.mockRejectedValueOnce(new Error('rate error'));
    const pedido = {
      id: 21,
      total: 8000,
      direccion_envio: null,
      sucursal_retiro: null,
      toJSON: () => ({
        id: 21,
        total: 8000,
        direccion_envio: null,
        sucursal_retiro: null,
        detalles: [
          { producto_id: 2, precio_unitario: 4000, cantidad: 2, producto: { id: 2, nombre: 'Sierra' } }
        ]
      })
    };
    db.Pedido.findByPk.mockResolvedValue(pedido);

    await controller.obtenerPedidoPorId(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: 21,
      total_usd: null,
      clp_to_usd_rate: 0,
      detalles: [expect.objectContaining({
        subtotal: 8000,
        precio_unitario_usd: null,
        subtotal_usd: null
      })]
    }));
  });
});