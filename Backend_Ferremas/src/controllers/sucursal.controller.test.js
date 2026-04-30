jest.mock('../models', () => ({
  Sucursal: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  Stock: {
    findAll: jest.fn()
  },
  Producto: {}
}));

const db = require('../models');
const controller = require('./sucursal.controller');

describe('sucursal.controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('findAll returns sucursales', async () => {
    const sucursales = [{ id: 1, nombre: 'Centro' }];
    db.Sucursal.findAll.mockResolvedValue(sucursales);

    await controller.findAll(req, res);

    expect(res.json).toHaveBeenCalledWith(sucursales);
  });

  test('findById returns 404 when sucursal is missing', async () => {
    req.params.id = '3';
    db.Sucursal.findByPk.mockResolvedValue(null);

    await controller.findById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sucursal no encontrada' });
  });

  test('findById returns sucursal when found', async () => {
    const sucursal = { id: 3, nombre: 'Centro' };
    req.params.id = '3';
    db.Sucursal.findByPk.mockResolvedValue(sucursal);

    await controller.findById(req, res);

    expect(res.json).toHaveBeenCalledWith(sucursal);
  });

  test('create returns created sucursal', async () => {
    const sucursal = { id: 4, nombre: 'Norte' };
    req.body = { nombre: 'Norte' };
    db.Sucursal.create.mockResolvedValue(sucursal);

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(sucursal);
  });

  test('getStockSucursal returns stock list', async () => {
    const stock = [{ id: 1, cantidad: 10 }];
    req.params.id = '4';
    db.Stock.findAll.mockResolvedValue(stock);

    await controller.getStockSucursal(req, res);

    expect(db.Stock.findAll).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(stock);
  });
});