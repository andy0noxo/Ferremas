jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: jest.fn()
  };
});

jest.mock('../models', () => ({
  Usuario: {
    findOne: jest.fn()
  },
  Marca: {
    findByPk: jest.fn()
  },
  Categoria: {
    findByPk: jest.fn()
  }
}));

const { validationResult } = require('express-validator');
const actualExpressValidator = jest.requireActual('express-validator');
const db = require('../models');
const {
  validateRequest,
  userValidations,
  productValidations,
  pedidoValidations,
  idParamValidation
} = require('./validators');

describe('Validators Behavior', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('validateRequest responde 400 cuando hay errores', () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Error de validación' }]
    });

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Error de validación' }] });
    expect(next).not.toHaveBeenCalled();
  });

  test('validateRequest llama next cuando no hay errores', () => {
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('userValidations rechaza email duplicado de otro usuario', async () => {
    req.body = {
      nombre: 'Juan Pérez',
      email: 'dup@test.com',
      rut: '12345678-9',
      contrasena: 'StrongPass1!'
    };
    db.Usuario.findOne.mockResolvedValue({ id: 2, email: 'dup@test.com' });

    await Promise.all(userValidations.map(v => v.run(req)));

    const errors = actualExpressValidator.validationResult(req).array();
    expect(errors.some(error => error.msg === 'Email ya registrado')).toBe(true);
  });

  test('userValidations permite el mismo email al editar el mismo usuario', async () => {
    req.params.id = '2';
    req.body = {
      nombre: 'Juan Pérez',
      email: 'dup@test.com',
      rut: '12345678-9',
      contrasena: 'StrongPass1!'
    };
    db.Usuario.findOne.mockResolvedValue({ id: 2, email: 'dup@test.com' });

    await Promise.all(userValidations.map(v => v.run(req)));

    const errors = actualExpressValidator.validationResult(req).array();
    expect(errors.some(error => error.msg === 'Email ya registrado')).toBe(false);
  });

  test('userValidations marca errores en campos básicos inválidos', async () => {
    req.body = {
      nombre: 'A',
      email: 'no-es-email',
      rut: 'mal-rut',
      contrasena: 'weak'
    };

    await Promise.all(userValidations.map(v => v.run(req)));

    const errors = actualExpressValidator.validationResult(req).array();
    expect(errors.some(error => String(error.msg).toLowerCase().includes('nombre'))).toBe(true);
    expect(errors.some(error => String(error.msg).toLowerCase().includes('email'))).toBe(true);
    expect(errors.some(error => String(error.msg).toLowerCase().includes('rut'))).toBe(true);
    expect(errors.some(error => String(error.msg).toLowerCase().includes('contraseña'))).toBe(true);
  });

  test('productValidations rechaza marca inexistente', async () => {
    req.body = {
      nombre: 'Taladro',
      precio: 1000,
      marca_id: 99,
      categoria_id: 1
    };
    db.Marca.findByPk.mockResolvedValue(null);
    db.Categoria.findByPk.mockResolvedValue({ id: 1 });

    await Promise.all(productValidations.map(v => v.run(req)));

    const errors = actualExpressValidator.validationResult(req).array();
    expect(errors.some(error => error.msg === 'Marca no existe')).toBe(true);
  });

  test('productValidations rechaza categoria inexistente', async () => {
    req.body = {
      nombre: 'Taladro',
      precio: 1000,
      marca_id: 1,
      categoria_id: 99
    };
    db.Marca.findByPk.mockResolvedValue({ id: 1 });
    db.Categoria.findByPk.mockResolvedValue(null);

    await Promise.all(productValidations.map(v => v.run(req)));

    const errors = actualExpressValidator.validationResult(req).array();
    expect(errors.some(error => error.msg === 'Categoría no existe')).toBe(true);
  });

  test('productValidations marca errores en nombre y precio inválidos', async () => {
    req.body = {
      nombre: 'Ta',
      precio: 0
    };

    await Promise.all(productValidations.map(v => v.run(req)));

    const errors = actualExpressValidator.validationResult(req).array();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('productValidations custom de marca puede lanzar error sin marca', async () => {
    const marcaCustom = productValidations[2].builder.stack[1].validator;

    await expect(marcaCustom(undefined, { req: { body: {} } })).rejects.toThrow(
      'Debe proporcionar marca_id o nueva_marca'
    );
  });

  test('productValidations custom de categoria puede lanzar error sin categoria', async () => {
    const categoriaCustom = productValidations[3].builder.stack[1].validator;

    await expect(categoriaCustom(undefined, { req: { body: {} } })).rejects.toThrow(
      'Debe proporcionar categoria_id o nueva_categoria'
    );
  });

  test('pedidoValidations detecta payload inválido y válido', async () => {
    req.body = { productos: [], sucursal_id: 'abc' };
    await Promise.all(pedidoValidations.map(v => v.run(req)));
    const invalidErrors = actualExpressValidator.validationResult(req).array();
    expect(invalidErrors.length).toBeGreaterThan(0);

    req = {
      body: {
        productos: [{ producto_id: 1, cantidad: 2 }],
        sucursal_id: 1
      },
      params: {},
      query: {}
    };
    await Promise.all(pedidoValidations.map(v => v.run(req)));
    const validErrors = actualExpressValidator.validationResult(req).array();
    expect(validErrors.length).toBe(0);
  });

  test('idParamValidation rechaza ids no numéricos', async () => {
    req.params.id = 'abc';

    await Promise.all(idParamValidation.map(v => v.run(req)));

    const errors = actualExpressValidator.validationResult(req).array();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('idParamValidation convierte el id a entero', async () => {
    req.params.id = '42';

    await Promise.all(idParamValidation.map(v => v.run(req)));

    expect(req.params.id).toBe(42);
  });
});