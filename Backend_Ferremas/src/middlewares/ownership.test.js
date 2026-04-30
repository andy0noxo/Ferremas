jest.mock('../models', () => ({
  Usuario: {},
  Pedido: {},
  Producto: {}
}));

jest.mock('../config/roles.config', () => ({
  ADMIN: 'admin'
}));

const db = require('../models');
const ROLES = require('../config/roles.config');
const checkResourceOwnership = require('./ownership');

describe('ownership middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: { id: '10' }, user: { id: 1, rol: 'cliente' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('returns 404 when resource is missing', async () => {
    db.Pedido.findByPk = jest.fn().mockResolvedValue(null);
    const middleware = checkResourceOwnership('Pedido');

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Recurso no encontrado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('allows admin users to pass through', async () => {
    db.Pedido.findByPk = jest.fn().mockResolvedValue({ Usuario: { id: 99 } });
    req.user.rol = ROLES.ADMIN;
    const middleware = checkResourceOwnership('Pedido');

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('allows owner users to pass through', async () => {
    db.Pedido.findByPk = jest.fn().mockResolvedValue({ Usuario: { id: 1 } });
    const middleware = checkResourceOwnership('Pedido');

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 403 when user is not owner', async () => {
    db.Pedido.findByPk = jest.fn().mockResolvedValue({ Usuario: { id: 8 } });
    const middleware = checkResourceOwnership('Pedido');

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'No tienes permiso para este recurso' });
    expect(next).not.toHaveBeenCalled();
  });

  test('passes database errors to next', async () => {
    db.Pedido.findByPk = jest.fn().mockRejectedValue(new Error('db error'));
    const middleware = checkResourceOwnership('Pedido');

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});