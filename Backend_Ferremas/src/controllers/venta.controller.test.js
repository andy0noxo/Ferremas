jest.mock('../models', () => ({
  Sequelize: {
    Op: {
      gte: 'gte',
      lt: 'lt',
      not: 'not'
    }
  },
  Pedido: {
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  Usuario: {},
  Sucursal: {
    findByPk: jest.fn()
  },
  DetallePedido: {},
  Pago: {},
  Producto: {}
}));

const db = require('../models');
const controller = require('./venta.controller');

describe('venta.controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {}, user: { id: 1, rol: 'admin' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('findAll returns ventas', async () => {
    const ventas = [{ id: 1 }];
    db.Pedido.findAll.mockResolvedValue(ventas);

    await controller.findAll(req, res, next);

    expect(res.json).toHaveBeenCalledWith(ventas);
  });

  test('findById returns 404 when venta is missing', async () => {
    req.params.id = '9';
    db.Pedido.findByPk.mockResolvedValue(null);

    await controller.findById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Venta no encontrada' });
  });

  test('findById returns venta when found', async () => {
    const venta = { id: 9 };
    req.params.id = '9';
    db.Pedido.findByPk.mockResolvedValue(venta);

    await controller.findById(req, res, next);

    expect(res.json).toHaveBeenCalledWith(venta);
  });

  test('delete returns 404 when venta is missing', async () => {
    req.params.id = '9';
    db.Pedido.findByPk.mockResolvedValue(null);

    await controller.delete(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Venta no encontrada' });
  });

  test('delete removes venta when found', async () => {
    req.params.id = '9';
    const venta = { destroy: jest.fn().mockResolvedValue(undefined) };
    db.Pedido.findByPk.mockResolvedValue(venta);

    await controller.delete(req, res, next);

    expect(venta.destroy).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Venta eliminada' });
  });

  test('informeMensualPorSucursal returns 400 when params are missing', async () => {
    req.query = { sucursalId: '1', anio: '2026' };

    await controller.informeMensualPorSucursal(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Debe indicar sucursalId, anio y mes' });
  });

  test('informeMensualPorSucursal returns monthly summary', async () => {
    req.query = { sucursalId: '1', anio: '2026', mes: '4' };
    db.Pedido.findAll.mockResolvedValue([
      { total: 1000, sucursal: { id: 1, nombre: 'Centro' } },
      { total: 2000, sucursal: { id: 1, nombre: 'Centro' } }
    ]);

    await controller.informeMensualPorSucursal(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      anio: '2026',
      mes: '4',
      totalVentas: 3000,
      cantidadPedidos: 2
    }));
  });

  test('informeVentasGenerico returns 400 when params are missing', async () => {
    req.query = { sucursalId: '1', anio: '2026' };

    await controller.informeVentasGenerico(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Debe indicar sucursalId, anio y periodo' });
  });

  test('informeVentasGenerico returns 400 for invalid period', async () => {
    req.query = { sucursalId: '1', anio: '2026', periodo: 'invalid' };

    await controller.informeVentasGenerico(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Periodo no valido' });
  });

  test('informeVentasGenerico returns report for anual period', async () => {
    req.query = { sucursalId: 'todas', anio: '2026', periodo: 'anual' };
    db.Pedido.findAll.mockResolvedValue([
      {
        total: 4000,
        sucursal_retiro: '1',
        sucursal: { nombre: 'Centro' },
        pago: { metodo: 'webpay' },
        detalles: [
          { cantidad: 2, precio_unitario: 500, producto: { id: 1, nombre: 'Taladro' } }
        ]
      }
    ]);

    await controller.informeVentasGenerico(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      anio: '2026',
      periodo: 'anual',
      totalVentas: 4000,
      cantidadPedidos: 1
    }));
  });

  test('informeVentasGenerico returns report for semestre period with top sucursales', async () => {
    req.query = { sucursalId: 'todas', anio: '2026', periodo: 'semestre-1' };
    db.Pedido.findAll.mockResolvedValue([
      {
        total: 3000,
        sucursal_retiro: '1',
        sucursal: { id: 1, nombre: 'Centro' },
        pago: { metodo: 'webpay' },
        detalles: [
          { cantidad: 1, precio_unitario: 3000, producto: { id: 1, nombre: 'Taladro' } }
        ]
      },
      {
        total: 2000,
        sucursal_retiro: '2',
        direccion_envio: 'Av Siempre Viva 123',
        sucursal: null,
        pago: { metodo: 'transferencia' },
        detalles: [
          { cantidad: 2, precio_unitario: 1000, producto: null }
        ]
      }
    ]);

    await controller.informeVentasGenerico(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      periodo: 'semestre-1',
      cantidadPedidos: 2,
      totalVentas: 5000,
      metricas: expect.objectContaining({
        topSucursales: expect.any(Array),
        metodosPago: expect.objectContaining({
          webpay: expect.objectContaining({ cantidad: 1, total: 3000 }),
          transferencia: expect.objectContaining({ cantidad: 1, total: 2000 })
        })
      })
    }));
  });

  test('informeVentasGenerico returns report for mes period and specific sucursal', async () => {
    req.query = { sucursalId: '1', anio: '2026', periodo: 'mes-4' };
    db.Sucursal.findByPk.mockResolvedValue({ id: 1, nombre: 'Centro' });
    db.Pedido.findAll.mockResolvedValue([
      {
        total: 1500,
        sucursal_retiro: '1',
        sucursal: { id: 1, nombre: 'Centro' },
        pago: { metodo: 'webpay' },
        detalles: [
          { cantidad: 3, precio_unitario: 500, producto: { id: 3, nombre: 'Martillo' } }
        ]
      }
    ]);

    await controller.informeVentasGenerico(req, res, next);

    expect(db.Sucursal.findByPk).toHaveBeenCalledWith('1', { attributes: ['id', 'nombre'] });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      periodo: 'mes-4',
      sucursal: { id: 1, nombre: 'Centro' },
      totalVentas: 1500,
      cantidadPedidos: 1
    }));
  });

  test('informeVentasGenerico returns report for trimestre period with sucursal desconocida', async () => {
    req.query = { sucursalId: 'todas', anio: '2026', periodo: 'trimestre-2' };
    db.Pedido.findAll.mockResolvedValue([
      {
        total: 700,
        sucursal_retiro: 'despacho',
        sucursal: null,
        pago: null,
        direccion_envio: null,
        detalles: [
          { cantidad: 1, precio_unitario: 700, producto: null }
        ]
      }
    ]);

    await controller.informeVentasGenerico(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      periodo: 'trimestre-2',
      cantidadPedidos: 1,
      metricas: expect.objectContaining({
        topSucursales: expect.arrayContaining([
          expect.objectContaining({ nombre: 'Sucursal Desconocida' })
        ]),
        metodosPago: expect.objectContaining({
          Desconocido: expect.objectContaining({ cantidad: 1, total: 700 })
        })
      })
    }));
  });
});