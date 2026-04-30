/**
 * Pruebas Unitarias - services/cart.service.js
 * Servicios de carrito de compras
 */

const cartServiceModule = require('./cart.service');

// Mock de logger
jest.mock('../middlewares/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

// Mock de models
jest.mock('../models', () => ({
  sequelize: {
    transaction: jest.fn()
  },
  Stock: {
    findOne: jest.fn(),
    decrement: jest.fn()
  },
  Producto: {
    findAll: jest.fn()
  }
}));

const db = require('../models');
const logger = require('../middlewares/logger');

describe('CartService', () => {
  let cartService;
  let mockTransaction;

  beforeEach(() => {
    // use exported instance
    cartService = cartServiceModule;

    // Setup transaction mock
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };

    db.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // ========================================
  // Pruebas para validateStock
  // ========================================
  describe('validateStock', () => {
    test('debe validar stock disponible correctamente', async () => {
      const items = [
        { producto_id: 1, cantidad: 5 },
        { producto_id: 2, cantidad: 3 }
      ];
      const sucursalId = 10;

      db.Stock.findOne.mockResolvedValueOnce({ cantidad: 10 }); // Stock suficiente
      db.Stock.findOne.mockResolvedValueOnce({ cantidad: 5 }); // Stock suficiente

      const result = await cartService.validateStock(items, sucursalId);

      expect(result.allValid).toBe(true);
      expect(result.stockInfo).toHaveLength(2);
      expect(result.stockInfo[0].valido).toBe(true);
    });

    test('debe rechazar si stock es insuficiente', async () => {
      const items = [
        { producto_id: 1, cantidad: 10 }
      ];
      const sucursalId = 10;

      db.Stock.findOne.mockResolvedValueOnce({ cantidad: 5 }); // Stock insuficiente

      const result = await cartService.validateStock(items, sucursalId);

      expect(result.allValid).toBe(false);
      expect(result.stockInfo[0].valido).toBe(false);
      expect(result.stockInfo[0].cantidad_solicitada).toBe(10);
      expect(result.stockInfo[0].stock_disponible).toBe(5);
    });

    test('debe manejar producto sin stock', async () => {
      const items = [
        { producto_id: 1, cantidad: 1 }
      ];
      const sucursalId = 10;

      db.Stock.findOne.mockResolvedValueOnce(null); // Sin stock

      const result = await cartService.validateStock(items, sucursalId);

      expect(result.allValid).toBe(false);
      expect(result.stockInfo[0].stock_disponible).toBe(0);
      expect(result.stockInfo[0].valido).toBe(false);
    });

    test('debe validar múltiples productos', async () => {
      const items = [
        { producto_id: 1, cantidad: 5 },
        { producto_id: 2, cantidad: 3 },
        { producto_id: 3, cantidad: 2 }
      ];
      const sucursalId = 10;

      db.Stock.findOne
        .mockResolvedValueOnce({ cantidad: 10 })
        .mockResolvedValueOnce({ cantidad: 3 })
        .mockResolvedValueOnce({ cantidad: 1 }); // Stock insuficiente

      const result = await cartService.validateStock(items, sucursalId);

      expect(result.stockInfo).toHaveLength(3);
      expect(result.allValid).toBe(false); // Al menos uno inválido
      expect(result.stockInfo[2].valido).toBe(false);
    });

    test('debe crear transacción para validación', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];

      db.Stock.findOne.mockResolvedValueOnce({ cantidad: 10 });

      await cartService.validateStock(items, 10);

      expect(db.sequelize.transaction).toHaveBeenCalled();
    });

    test('debe hacer commit de transacción si es exitosa', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];

      db.Stock.findOne.mockResolvedValueOnce({ cantidad: 10 });

      await cartService.validateStock(items, 10);

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('debe hacer rollback si hay error', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];

      db.Stock.findOne.mockRejectedValueOnce(new Error('DB Error'));

      await expect(cartService.validateStock(items, 10))
        .rejects
        .toThrow('DB Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('debe pasar transaction a findOne', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];

      db.Stock.findOne.mockResolvedValueOnce({ cantidad: 10 });

      await cartService.validateStock(items, 10);

      expect(db.Stock.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
    });

    test('debe loguear errores', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];
      const error = new Error('Stock error');

      db.Stock.findOne.mockRejectedValueOnce(error);

      try {
        await cartService.validateStock(items, 10);
      } catch (e) {
        // Esperado
      }

      expect(logger.error).toHaveBeenCalledWith(
        'Error validando stock:',
        expect.any(Error)
      );
    });
  });

  // ========================================
  // Pruebas para calculateTotal
  // ========================================
  describe('calculateTotal', () => {
    test('debe calcular total correctamente', async () => {
      const items = [
        { producto_id: 1, cantidad: 2 },
        { producto_id: 2, cantidad: 3 }
      ];

      db.Producto.findAll.mockResolvedValueOnce([
        { id: 1, precio: 100 },
        { id: 2, precio: 50 }
      ]);

      const total = await cartService.calculateTotal(items);

      expect(total).toBe(350); // (2 * 100) + (3 * 50)
    });

    test('debe manejar un solo producto', async () => {
      const items = [
        { producto_id: 1, cantidad: 5 }
      ];

      db.Producto.findAll.mockResolvedValueOnce([
        { id: 1, precio: 99.99 }
      ]);

      const total = await cartService.calculateTotal(items);

      expect(total).toBeCloseTo(499.95, 2);
    });

    test('debe manejar múltiples cantidades del mismo producto', async () => {
      const items = [
        { producto_id: 1, cantidad: 10 },
        { producto_id: 2, cantidad: 5 },
        { producto_id: 3, cantidad: 2 }
      ];

      db.Producto.findAll.mockResolvedValueOnce([
        { id: 1, precio: 10 },
        { id: 2, precio: 20 },
        { id: 3, precio: 15 }
      ]);

      const total = await cartService.calculateTotal(items);

      expect(total).toBe(230); // (10*10) + (5*20) + (2*15)
    });

    test('debe retornar 0 para carrito vacío', async () => {
      const items = [];

      db.Producto.findAll.mockResolvedValueOnce([]);

      const total = await cartService.calculateTotal(items);

      expect(total).toBe(0);
    });

    test('debe consultar todos los productos', async () => {
      const items = [
        { producto_id: 1, cantidad: 1 },
        { producto_id: 2, cantidad: 1 }
      ];

      db.Producto.findAll.mockResolvedValueOnce([]);

      await cartService.calculateTotal(items);

      expect(db.Producto.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: [1, 2] }
        })
      );
    });

    test('debe manejar precios decimales', async () => {
      const items = [
        { producto_id: 1, cantidad: 3 }
      ];

      db.Producto.findAll.mockResolvedValueOnce([
        { id: 1, precio: 19.99 }
      ]);

      const total = await cartService.calculateTotal(items);

      expect(total).toBeCloseTo(59.97, 2);
    });

    test('debe loguear errores', async () => {
      const items = [{ producto_id: 1, cantidad: 1 }];
      const error = new Error('DB Error');

      db.Producto.findAll.mockRejectedValueOnce(error);

      await expect(cartService.calculateTotal(items))
        .rejects
        .toThrow('DB Error');

      expect(logger.error).toHaveBeenCalledWith(
        'Error calculando total del carrito:',
        expect.any(Error)
      );
    });
  });

  // ========================================
  // Pruebas para reserveStock
  // ========================================
  describe('reserveStock', () => {
    test('debe decrementar stock correctamente', async () => {
      const items = [
        { producto_id: 1, cantidad: 5 },
        { producto_id: 2, cantidad: 3 }
      ];
      const sucursalId = 10;

      db.Stock.decrement.mockResolvedValue([1]);

      await cartService.reserveStock(items, sucursalId);

      expect(db.Stock.decrement).toHaveBeenCalledTimes(2);
    });

    test('debe pasar cantidad correcta a decrement', async () => {
      const items = [
        { producto_id: 1, cantidad: 5 }
      ];

      db.Stock.decrement.mockResolvedValue([1]);

      await cartService.reserveStock(items, 10);

      expect(db.Stock.decrement).toHaveBeenCalledWith(
        'cantidad',
        expect.objectContaining({
          by: 5
        })
      );
    });

    test('debe usar transacción para reserva', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];

      db.Stock.decrement.mockResolvedValue([1]);

      await cartService.reserveStock(items, 10);

      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(db.Stock.decrement).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
    });

    test('debe hacer commit si reserva es exitosa', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];

      db.Stock.decrement.mockResolvedValue([1]);

      await cartService.reserveStock(items, 10);

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('debe hacer rollback si hay error en reserva', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];

      db.Stock.decrement.mockRejectedValueOnce(new Error('Decrement error'));

      await expect(cartService.reserveStock(items, 10))
        .rejects
        .toThrow('Decrement error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('debe loguear éxito de reserva', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];

      db.Stock.decrement.mockResolvedValue([1]);

      await cartService.reserveStock(items, 10);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Stock reservado')
      );
    });

    test('debe loguear errores en reserva', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];
      const error = new Error('Reserve error');

      db.Stock.decrement.mockRejectedValueOnce(error);

      try {
        await cartService.reserveStock(items, 10);
      } catch (e) {
        // Esperado
      }

      expect(logger.error).toHaveBeenCalledWith(
        'Error reservando stock:',
        expect.any(Error)
      );
    });

    test('debe manejar múltiples productos', async () => {
      const items = [
        { producto_id: 1, cantidad: 5 },
        { producto_id: 2, cantidad: 3 },
        { producto_id: 3, cantidad: 2 }
      ];

      db.Stock.decrement.mockResolvedValue([1]);

      await cartService.reserveStock(items, 10);

      expect(db.Stock.decrement).toHaveBeenCalledTimes(3);
    });

    test('debe pasar sucursalId correcta', async () => {
      const items = [{ producto_id: 1, cantidad: 5 }];
      const sucursalId = 25;

      db.Stock.decrement.mockResolvedValue([1]);

      await cartService.reserveStock(items, sucursalId);

      expect(db.Stock.decrement).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          where: expect.objectContaining({
            sucursal_id: sucursalId
          })
        })
      );
    });
  });
});
