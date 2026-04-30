/**
 * Pruebas Unitarias - controllers/producto.controller.js
 * Gestión de productos: CRUD y búsqueda
 */

const productoController = require('./producto.controller');
const db = require('../models');
const DollarService = require('../services/dollar.service');
const ExchangeRateHostService = require('../services/exchangeRateHost.service');

// Mocks
jest.mock('../models');
jest.mock('../services/dollar.service');
jest.mock('../services/exchangeRateHost.service');

describe('ProductoController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      query: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Mock de Sequelize
    db.Sequelize = {
      Op: {
        or: Symbol('or'),
        like: Symbol('like')
      }
    };
    // Mock transaction used in create/update/delete flows
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      finished: false
    };
    db.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // ========================================
  // Pruebas para findAll
  // ========================================
  describe('findAll', () => {
    test('debe retornar todos los productos', async () => {
      const mockProductos = [
        {
          id: 1,
          nombre: 'Martillo',
          precio: 10000,
          stocks: [
            { sucursal_id: 1, cantidad: 50, sucursal: { nombre: 'Sucursal 1' } }
          ],
          marca: { id: 1, nombre: 'DeWalt' },
          categoria: { id: 1, nombre: 'Herramientas' },
          toJSON: function() { return this; }
        }
      ];

      db.Producto.findAll.mockResolvedValue(mockProductos);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('No service'));
      DollarService.getCurrentDollar.mockRejectedValue(new Error('No service'));

      await productoController.findAll(mockReq, mockRes, mockNext);

      expect(db.Producto.findAll).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            nombre: 'Martillo',
            precio_clp: 10000
          })
        ])
      );
    });

    test('debe filtrar por búsqueda de nombre', async () => {
      mockReq.query = { search: 'Martillo' };

      const mockProductos = [
        {
          id: 1,
          nombre: 'Martillo',
          precio: 10000,
          stocks: [],
          marca: { nombre: 'DeWalt' },
          categoria: { nombre: 'Herramientas' },
          toJSON: function() { return this; }
        }
      ];

      db.Producto.findAll.mockResolvedValue(mockProductos);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('No service'));
      DollarService.getCurrentDollar.mockRejectedValue(new Error('No service'));

      await productoController.findAll(mockReq, mockRes, mockNext);

      const callArgs = db.Producto.findAll.mock.calls[0][0];
      expect(callArgs.where).toBeDefined();
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('debe filtrar por categoría', async () => {
      mockReq.query = { categoria_id: 1 };

      const mockProductos = [];
      db.Producto.findAll.mockResolvedValue(mockProductos);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('No service'));
      DollarService.getCurrentDollar.mockRejectedValue(new Error('No service'));

      await productoController.findAll(mockReq, mockRes, mockNext);

      const callArgs = db.Producto.findAll.mock.calls[0][0];
      expect(callArgs.where.categoria_id).toBe(1);
    });

    test('debe filtrar por sucursal con stock disponible', async () => {
      mockReq.query = { sucursal_id: 1 };

      const mockProductos = [
        {
          id: 1,
          nombre: 'Producto 1',
          precio: 5000,
          stocks: [
            { sucursal_id: 1, cantidad: 50, sucursal: { nombre: 'Sucursal 1' } },
            { sucursal_id: 2, cantidad: 0, sucursal: { nombre: 'Sucursal 2' } }
          ],
          marca: { nombre: 'Marca 1' },
          categoria: { nombre: 'Cat 1' },
          toJSON: function() { return this; }
        }
      ];

      db.Producto.findAll.mockResolvedValue(mockProductos);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('No service'));
      DollarService.getCurrentDollar.mockRejectedValue(new Error('No service'));

      await productoController.findAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            nombre: 'Producto 1'
          })
        ])
      );
    });

    test('debe convertir precio CLP a USD usando ExchangeRateHost', async () => {
      const mockProducto = {
        id: 1,
        nombre: 'Producto',
        precio: 1000,
        stocks: [],
        marca: { nombre: 'Marca' },
        categoria: { nombre: 'Cat' },
        toJSON: function() { return this; }
      };

      db.Producto.findAll.mockResolvedValue([mockProducto]);
      ExchangeRateHostService.getCurrentRate.mockResolvedValue(0.001); // USD per CLP

      await productoController.findAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            precio_usd: 1 // 1000 * 0.001
          })
        ])
      );
    });

    test('debe convertir precio CLP a USD usando DollarService como fallback', async () => {
      const mockProducto = {
        id: 1,
        nombre: 'Producto',
        precio: 950,
        stocks: [],
        marca: { nombre: 'Marca' },
        categoria: { nombre: 'Cat' },
        toJSON: function() { return this; }
      };

      db.Producto.findAll.mockResolvedValue([mockProducto]);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('No service'));
      DollarService.getCurrentDollar.mockResolvedValue(950); // CLP per USD

      await productoController.findAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            precio_usd: 1 // 950 / 950
          })
        ])
      );
    });

    test('debe retornar precio_usd null si no hay tasa de cambio', async () => {
      const mockProducto = {
        id: 1,
        nombre: 'Producto',
        precio: 1000,
        stocks: [],
        marca: { nombre: 'Marca' },
        categoria: { nombre: 'Cat' },
        toJSON: function() { return this; }
      };

      db.Producto.findAll.mockResolvedValue([mockProducto]);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('Error'));
      DollarService.getCurrentDollar.mockRejectedValue(new Error('Error'));

      await productoController.findAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            precio_usd: null
          })
        ])
      );
    });

    test('debe incluir opciones de include correctas', async () => {
      db.Producto.findAll.mockResolvedValue([]);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('No service'));
      DollarService.getCurrentDollar.mockRejectedValue(new Error('No service'));

      await productoController.findAll(mockReq, mockRes, mockNext);

      const callArgs = db.Producto.findAll.mock.calls[0][0];
      expect(callArgs.include).toBeDefined();
      expect(callArgs.include.length).toBeGreaterThan(0);
    });

    test('debe ordenar productos por nombre', async () => {
      db.Producto.findAll.mockResolvedValue([]);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('No service'));
      DollarService.getCurrentDollar.mockRejectedValue(new Error('No service'));

      await productoController.findAll(mockReq, mockRes, mockNext);

      const callArgs = db.Producto.findAll.mock.calls[0][0];
      expect(callArgs.order).toEqual([['nombre', 'ASC']]);
    });

    test('debe manejar errores', async () => {
      const error = new Error('DB Error');
      db.Producto.findAll.mockRejectedValue(error);

      await productoController.findAll(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('debe aplicar múltiples filtros simultáneamente', async () => {
      mockReq.query = {
        search: 'Martillo',
        categoria_id: 1,
        sucursal_id: 1
      };

      const mockProducto = {
        id: 1,
        nombre: 'Martillo Especial',
        precio: 15000,
        stocks: [
          { sucursal_id: 1, cantidad: 100, sucursal: { nombre: 'Sucursal 1' } }
        ],
        marca: { nombre: 'DeWalt' },
        categoria: { id: 1, nombre: 'Herramientas' },
        toJSON: function() { return this; }
      };

      db.Producto.findAll.mockResolvedValue([mockProducto]);
      ExchangeRateHostService.getCurrentRate.mockRejectedValue(new Error('No service'));
      DollarService.getCurrentDollar.mockRejectedValue(new Error('No service'));

      await productoController.findAll(mockReq, mockRes, mockNext);

      const callArgs = db.Producto.findAll.mock.calls[0][0];
      expect(callArgs.where).toBeDefined();
      expect(callArgs.where.categoria_id).toBe(1);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  // ========================================
  // Pruebas para findById
  // ========================================
  describe('findById', () => {
    test('debe retornar producto por ID', async () => {
      mockReq.params = { id: 1 };

      const mockProducto = {
        id: 1,
        nombre: 'Martillo',
        precio: 10000,
        marca: { id: 1, nombre: 'DeWalt' },
        categoria: { id: 1, nombre: 'Herramientas' }
      };
      mockProducto.toJSON = function() { return this; };

      db.Producto.findByPk.mockResolvedValue(mockProducto);

      // Asegurar que el servicio de tasa no lance por ser undefined
      ExchangeRateHostService.getCurrentRate.mockResolvedValue(1);

      await productoController.findById(mockReq, mockRes, mockNext);

      expect(db.Producto.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Martillo'
        })
      );
    });

    test('debe retornar 404 si producto no existe', async () => {
      mockReq.params = { id: 999 };

      db.Producto.findByPk.mockResolvedValue(null);

      await productoController.findById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('no encontrado')
        })
      );
    });

    test('debe manejar errores', async () => {
      mockReq.params = { id: 1 };

      const error = new Error('DB Error');
      db.Producto.findByPk.mockRejectedValue(error);

      await productoController.findById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('debe incluir asociaciones: marca, categoría y stock', async () => {
      mockReq.params = { id: 1 };

      const mockProducto = {
        id: 1,
        nombre: 'Producto',
        marca: { nombre: 'Marca' },
        categoria: { nombre: 'Categoria' },
        stocks: [{ sucursal_id: 1, cantidad: 10 }]
      };
      mockProducto.toJSON = function() { return this; };

      db.Producto.findByPk.mockResolvedValue(mockProducto);

      await productoController.findById(mockReq, mockRes, mockNext);

      const callArgs = db.Producto.findByPk.mock.calls[0][1];
      expect(callArgs.include).toBeDefined();
    });
  });

  // ========================================
  // Pruebas para updateStock / getStock
  // ========================================
  describe('updateStock y getStock', () => {
    test('debe actualizar stock de un producto correctamente', async () => {
      mockReq.params = { productoId: 1, sucursalId: 2 };
      mockReq.body = { cantidad: 15 };

      const mockStock = {
        id: 10,
        update: jest.fn().mockResolvedValue(undefined)
      };
      const updatedStock = {
        id: 10,
        cantidad: 15
      };

      db.Stock.findOne.mockResolvedValue(mockStock);
      db.Stock.findByPk.mockResolvedValue(updatedStock);

      await productoController.updateStock(mockReq, mockRes, mockNext);

      expect(db.Stock.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { producto_id: 1, sucursal_id: 2 }
      }));
      expect(mockStock.update).toHaveBeenCalledWith({ cantidad: 15 }, expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith(updatedStock);
    });

    test('debe manejar error cuando stock no existe en updateStock', async () => {
      mockReq.params = { productoId: 1, sucursalId: 2 };
      mockReq.body = { cantidad: 15 };

      db.Stock.findOne.mockResolvedValue(null);

      await productoController.updateStock(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test('debe retornar stock por producto', async () => {
      mockReq.params = { id: 1 };
      const mockStock = [{ id: 1, cantidad: 10 }];
      db.Stock.findAll.mockResolvedValue(mockStock);

      await productoController.getStock(mockReq, mockRes, mockNext);

      expect(db.Stock.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { producto_id: 1 }
      }));
      expect(mockRes.json).toHaveBeenCalledWith(mockStock);
    });
  });

  // ========================================
  // Pruebas para create
  // ========================================
  describe('create', () => {
    test('debe crear producto correctamente', async () => {
      mockReq.body = {
        nombre: 'Nuevo Producto',
        precio: 25000,
        descripcion: 'Descripción',
        marca_id: 1,
        categoria_id: 1
      };

      const mockProducto = {
        id: 1,
        ...mockReq.body,
        marca: { id: 1, nombre: 'Marca' },
        categoria: { id: 1, nombre: 'Categoria' }
      };

      db.Producto.create.mockResolvedValue(mockProducto);
      db.Producto.findByPk.mockResolvedValue(mockProducto);

      await productoController.create(mockReq, mockRes, mockNext);

      expect(db.Producto.create).toHaveBeenCalledWith(mockReq.body, expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('debe validar campos requeridos', async () => {
      mockReq.body = {
        nombre: 'Producto'
        // Falta precio
      };

      const error = new Error('Precio requerido');
      db.Producto.create.mockRejectedValue(error);

      await productoController.create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test('debe manejar errores de creación', async () => {
      mockReq.body = {
        nombre: 'Producto',
        precio: 10000
      };

      const error = new Error('Create error');
      db.Producto.create.mockRejectedValue(error);

      await productoController.create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========================================
  // Pruebas para update
  // ========================================
  describe('update', () => {
    test('debe actualizar producto correctamente', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        nombre: 'Producto Actualizado',
        precio: 30000
      };

      const mockProducto = {
        id: 1,
        nombre: 'Producto Original',
        precio: 25000,
        update: jest.fn().mockResolvedValue({
          id: 1,
          ...mockReq.body
        })
      };

      db.Producto.findByPk.mockResolvedValue(mockProducto);

      await productoController.update(mockReq, mockRes, mockNext);

      expect(mockProducto.update).toHaveBeenCalledWith(mockReq.body, expect.any(Object));
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('debe retornar 404 si producto no existe', async () => {
      mockReq.params = { id: 999 };
      mockReq.body = { nombre: 'Test' };

      db.Producto.findByPk.mockResolvedValue(null);

      await productoController.update(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('debe manejar errores de actualización', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { nombre: 'Test' };

      const error = new Error('Update error');
      db.Producto.findByPk.mockRejectedValue(error);

      await productoController.update(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========================================
  // Pruebas para delete
  // ========================================
  describe('delete', () => {
    test('debe eliminar producto correctamente', async () => {
      mockReq.params = { id: 1 };

      const mockProducto = {
        id: 1,
        nombre: 'Producto',
        destroy: jest.fn().mockResolvedValue(true)
      };

      db.Producto.findByPk.mockResolvedValue(mockProducto);

      await productoController.delete(mockReq, mockRes, mockNext);

      expect(mockProducto.destroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    test('debe retornar 404 si producto no existe', async () => {
      mockReq.params = { id: 999 };

      db.Producto.findByPk.mockResolvedValue(null);

      await productoController.delete(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('debe manejar errores de eliminación', async () => {
      mockReq.params = { id: 1 };

      const error = new Error('Delete error');
      db.Producto.findByPk.mockRejectedValue(error);

      await productoController.delete(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
