jest.mock('../models', () => ({
  Rol: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('../config/roles.config', () => ({
  ADMIN: 'admin'
}));

const db = require('../models');
const controller = require('./rol.controller');

describe('rol.controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {}, user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('findAll returns roles', async () => {
    const roles = [{ id: 1, nombre: 'admin' }];
    db.Rol.findAll.mockResolvedValue(roles);

    await controller.findAll(req, res, next);

    expect(res.json).toHaveBeenCalledWith(roles);
  });

  test('findById returns 404 when role is missing', async () => {
    req.params.id = '2';
    db.Rol.findByPk.mockResolvedValue(null);

    await controller.findById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rol no encontrado' });
  });

  test('findById returns role when found', async () => {
    const rol = { id: 2, nombre: 'cliente' };
    req.params.id = '2';
    db.Rol.findByPk.mockResolvedValue(rol);

    await controller.findById(req, res, next);

    expect(res.json).toHaveBeenCalledWith(rol);
  });

  test('create rejects non admin users', async () => {
    req.user = { rol: 'cliente' };

    await controller.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Solo admin puede crear roles' });
    expect(db.Rol.create).not.toHaveBeenCalled();
  });

  test('create allows admin users', async () => {
    req.user = { rol: 'admin' };
    req.body = { nombre: 'nuevo' };
    const rol = { id: 3, nombre: 'nuevo' };
    db.Rol.create.mockResolvedValue(rol);

    await controller.create(req, res, next);

    expect(db.Rol.create).toHaveBeenCalledWith({ nombre: 'nuevo' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(rol);
  });

  test('update rejects non admin users', async () => {
    req.user = { rol: 'cliente' };

    await controller.update(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Solo admin puede editar roles' });
  });

  test('update returns 404 when role is missing', async () => {
    req.user = { rol: 'admin' };
    req.params.id = '7';
    db.Rol.findByPk.mockResolvedValue(null);

    await controller.update(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rol no encontrado' });
  });

  test('update applies changes when role exists', async () => {
    req.user = { rol: 'admin' };
    req.params.id = '7';
    req.body = { nombre: 'modificado' };
    const rol = { update: jest.fn().mockResolvedValue(undefined) };
    db.Rol.findByPk.mockResolvedValue(rol);

    await controller.update(req, res, next);

    expect(rol.update).toHaveBeenCalledWith({ nombre: 'modificado' });
    expect(res.json).toHaveBeenCalledWith(rol);
  });

  test('delete rejects non admin users', async () => {
    req.user = { rol: 'cliente' };

    await controller.delete(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Solo admin puede eliminar roles' });
  });

  test('delete removes role when found', async () => {
    req.user = { rol: 'admin' };
    req.params.id = '7';
    const rol = { destroy: jest.fn().mockResolvedValue(undefined) };
    db.Rol.findByPk.mockResolvedValue(rol);

    await controller.delete(req, res, next);

    expect(rol.destroy).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Rol eliminado' });
  });
});