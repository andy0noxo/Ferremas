jest.mock('../models', () => ({
  Marca: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

const db = require('../models');
const controller = require('./marca.controller');

describe('marca.controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('findAll returns brands', async () => {
    const marcas = [{ id: 1, nombre: 'Truper' }];
    db.Marca.findAll.mockResolvedValue(marcas);

    await controller.findAll(req, res, next);

    expect(res.json).toHaveBeenCalledWith(marcas);
  });

  test('findById returns 404 when brand is missing', async () => {
    req.params.id = '8';
    db.Marca.findByPk.mockResolvedValue(null);

    await controller.findById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Marca no encontrada' });
  });

  test('findById returns brand when found', async () => {
    const marca = { id: 1, nombre: 'Truper' };
    req.params.id = '1';
    db.Marca.findByPk.mockResolvedValue(marca);

    await controller.findById(req, res, next);

    expect(res.json).toHaveBeenCalledWith(marca);
  });

  test('create returns created brand', async () => {
    const marca = { id: 2, nombre: 'Bosch' };
    req.body = { nombre: 'Bosch' };
    db.Marca.create.mockResolvedValue(marca);

    await controller.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(marca);
  });

  test('update returns 404 when brand is missing', async () => {
    req.params.id = '9';
    req.body = { nombre: 'Nuevo' };
    db.Marca.findByPk.mockResolvedValue(null);

    await controller.update(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Marca no encontrada' });
  });

  test('update applies changes when brand exists', async () => {
    const marca = { update: jest.fn().mockResolvedValue(undefined) };
    req.params.id = '9';
    req.body = { nombre: 'Nuevo' };
    db.Marca.findByPk.mockResolvedValue(marca);

    await controller.update(req, res, next);

    expect(marca.update).toHaveBeenCalledWith({ nombre: 'Nuevo' });
    expect(res.json).toHaveBeenCalledWith(marca);
  });

  test('delete returns 404 when brand does not exist', async () => {
    req.params.id = '9';
    db.Marca.findByPk.mockResolvedValue(null);

    await controller.delete(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('delete removes brand when found', async () => {
    const marca = { destroy: jest.fn().mockResolvedValue(undefined) };
    req.params.id = '9';
    db.Marca.findByPk.mockResolvedValue(marca);

    await controller.delete(req, res, next);

    expect(marca.destroy).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Marca eliminada' });
  });
});