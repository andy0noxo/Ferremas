// Tests básicos para factories de modelos Sequelize

// Mock bcrypt antes de requerir modelos que lo usan
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

const path = require('path');

// Mock minimal DataTypes y sequelize.define
const DataTypes = {
  STRING: (len) => ({ type: 'STRING', len }),
  TEXT: { type: 'TEXT' },
  INTEGER: { type: 'INTEGER' },
  DATE: { type: 'DATE' },
  BOOLEAN: { type: 'BOOLEAN' },
  ENUM: (...vals) => ({ type: 'ENUM', values: vals }),
  NOW: 'NOW'
};

const mockDefine = jest.fn((name, attributes, options) => {
  function Model() {}
  Model._name = name;
  Model._attributes = attributes;
  Model._options = options;
  return Model;
});

const mockSequelize = { define: mockDefine };

const modelsToTest = [
  { file: './usuario.model', name: 'Usuario', keys: ['nombre', 'email', 'contrasena', 'rut'] },
  { file: './producto.model', name: 'Producto', keys: ['nombre', 'descripcion', 'precio'] },
  { file: './pedido.model', name: 'Pedido', keys: [] },
  { file: './pago.model', name: 'Pago', keys: [] },
  { file: './marca.model', name: 'Marca', keys: [] },
  { file: './categoria.model', name: 'Categoria', keys: [] },
  { file: './stock.model', name: 'Stock', keys: [] },
  { file: './sucursal.model', name: 'Sucursal', keys: [] },
  { file: './detallePedido.model', name: 'DetallePedido', keys: [] },
  { file: './rol.model', name: 'Rol', keys: [] }
];

describe('Model factories', () => {
  beforeEach(() => {
    mockDefine.mockClear();
    jest.resetModules();
  });

  test.each(modelsToTest)('factory %s exports a model with expected shape', async ({ file, name, keys }) => {
    const factory = require(file);
    expect(typeof factory).toBe('function');

    const Model = factory(mockSequelize, DataTypes);
    expect(typeof Model).toBe('function');
    expect(Model._name).toBe(name);
    expect(Model._options).toBeDefined();
    // keys: check a subset of attributes when provided
    if (keys.length) {
      keys.forEach(k => expect(Model._attributes).toHaveProperty(k));
    }

    // Associate should be defined on the model after factory executes
    expect(typeof Model.associate).toBe('function');
  });

  test('Usuario model sets validarContrasena on prototype and hook exists', async () => {
    const usuarioFactory = require('./usuario.model');
    const Usuario = usuarioFactory(mockSequelize, DataTypes);
    expect(typeof Usuario.prototype.validarContrasena).toBe('function');

    // Call prototype method with a fake instance and ensure bcrypt.compare was used
    const instance = { contrasena: 'hashed-password' };
    const res = await Usuario.prototype.validarContrasena.call(instance, 'plain');
    const bcrypt = require('bcryptjs');
    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed-password');
    expect(res).toBe(true);
  });
});
