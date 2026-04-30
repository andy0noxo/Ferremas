jest.mock('../models', () => ({
  sequelize: {
    transaction: jest.fn()
  },
  Stock: {
    findOne: jest.fn(),
    findAll: jest.fn()
  },
  Producto: {},
  Marca: {},
  Categoria: {},
  Sucursal: {}
}));

const db = require('../models');
const controller = require('./stock.controller');

describe('stock.controller', () => {
  let req;
  let res;
  let transaction;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };
    db.sequelize.transaction.mockResolvedValue(transaction);
  });

  test('actualizarStock returns 404 when stock does not exist', async () => {
    req.body = { producto_id: 1, sucursal_id: 2, cantidad: 5 };
    db.Stock.findOne.mockResolvedValue(null);

    await controller.actualizarStock(req, res);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Registro de stock no encontrado' });
  });

  test('actualizarStock updates stock when found', async () => {
    const stock = { update: jest.fn().mockResolvedValue(undefined) };
    req.body = { producto_id: 1, sucursal_id: 2, cantidad: 5 };
    db.Stock.findOne.mockResolvedValue(stock);

    await controller.actualizarStock(req, res);

    expect(stock.update).toHaveBeenCalledWith({ cantidad: 5 }, { transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Stock actualizado exitosamente' });
  });

  test('actualizarStock rolls back on error', async () => {
    req.body = { producto_id: 1, sucursal_id: 2, cantidad: 5 };
    db.Stock.findOne.mockRejectedValue(new Error('boom'));

    await controller.actualizarStock(req, res);

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
  });

  test('obtenerStockSucursal returns stock by sucursal', async () => {
    const stock = [{ id: 1, cantidad: 10 }];
    req.params.sucursalId = '9';
    db.Stock.findAll.mockResolvedValue(stock);

    await controller.obtenerStockSucursal(req, res);

    expect(db.Stock.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { sucursal_id: '9' }
    }));
    expect(res.json).toHaveBeenCalledWith(stock);
  });

  test('obtenerStockGeneral returns stock with associations', async () => {
    const stock = [{ id: 1, cantidad: 10 }];
    db.Stock.findAll.mockResolvedValue(stock);

    await controller.obtenerStockGeneral(req, res);

    expect(db.Stock.findAll).toHaveBeenCalledWith(expect.objectContaining({
      include: [
        { model: db.Producto, as: 'producto' },
        { model: db.Sucursal, as: 'sucursal' }
      ]
    }));
    expect(res.json).toHaveBeenCalledWith(stock);
  });
});