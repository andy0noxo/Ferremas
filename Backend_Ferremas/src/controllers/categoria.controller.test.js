jest.mock('../models', () => ({
  Categoria: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

const db = require('../models');
const controller = require('./categoria.controller');

describe('categoria.controller', () => {
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

  test('findAll returns categories', async () => {
    const categorias = [{ id: 1, nombre: 'Herramientas' }];
    db.Categoria.findAll.mockResolvedValue(categorias);

    await controller.findAll(req, res, next);

    expect(db.Categoria.findAll).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(categorias);
    expect(next).not.toHaveBeenCalled();
  });

  test('findAll forwards errors', async () => {
    const error = new Error('db error');
    db.Categoria.findAll.mockRejectedValue(error);

    await controller.findAll(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('findById returns category when found', async () => {
    const categoria = { id: 1, nombre: 'Herramientas' };
    req.params.id = '1';
    db.Categoria.findByPk.mockResolvedValue(categoria);

    await controller.findById(req, res, next);

    expect(db.Categoria.findByPk).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith(categoria);
  });

  test('findById returns 404 when category is missing', async () => {
    req.params.id = '99';
    db.Categoria.findByPk.mockResolvedValue(null);

    await controller.findById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Categoría no encontrada' });
  });

  test('create returns created category', async () => {
    const categoria = { id: 2, nombre: 'Pinturas' };
    req.body = { nombre: 'Pinturas' };
    db.Categoria.create.mockResolvedValue(categoria);

    await controller.create(req, res, next);

    expect(db.Categoria.create).toHaveBeenCalledWith({ nombre: 'Pinturas' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(categoria);
  });

  test('update returns 404 when category does not exist', async () => {
    req.params.id = '5';
    req.body = { nombre: 'Nuevo nombre' };
    db.Categoria.findByPk.mockResolvedValue(null);

    await controller.update(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Categoría no encontrada' });
  });

  test('update saves changes when category exists', async () => {
    const categoria = { update: jest.fn().mockResolvedValue(undefined) };
    req.params.id = '5';
    req.body = { nombre: 'Nuevo nombre' };
    db.Categoria.findByPk.mockResolvedValue(categoria);

    await controller.update(req, res, next);

    expect(categoria.update).toHaveBeenCalledWith({ nombre: 'Nuevo nombre' });
    expect(res.json).toHaveBeenCalledWith(categoria);
  });

  test('delete removes category when found', async () => {
    const categoria = { destroy: jest.fn().mockResolvedValue(undefined) };
    req.params.id = '5';
    db.Categoria.findByPk.mockResolvedValue(categoria);

    await controller.delete(req, res, next);

    expect(categoria.destroy).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Categoría eliminada' });
  });

  test('delete returns 404 when category is missing', async () => {
    req.params.id = '5';
    db.Categoria.findByPk.mockResolvedValue(null);

    await controller.delete(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Categoría no encontrada' });
  });
});