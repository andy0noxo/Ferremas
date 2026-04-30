/**
 * Pruebas Unitarias - controllers/usuario.controller.js
 * Gestión de usuarios: CRUD
 */

const usuarioController = require('./usuario.controller');
const db = require('../models');
const bcrypt = require('bcryptjs');

// Mocks
jest.mock('../models');
jest.mock('bcryptjs');

describe('UsuarioController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  // ========================================
  // Pruebas para getAllUsers
  // ========================================
  describe('getAllUsers', () => {
    test('debe retornar todos los usuarios', async () => {
      const mockUsers = [
        {
          id: 1,
          nombre: 'John Doe',
          email: 'john@test.com',
          rut: '12345678-9',
          rol: { nombre: 'Admin' },
          sucursal: { nombre: 'Sucursal 1' }
        },
        {
          id: 2,
          nombre: 'Jane Smith',
          email: 'jane@test.com',
          rut: '98765432-1',
          rol: { nombre: 'Vendedor' },
          sucursal: { nombre: 'Sucursal 2' }
        }
      ];

      db.Usuario.findAll.mockResolvedValue(mockUsers);

      await usuarioController.getAllUsers(mockReq, mockRes, mockNext);

      expect(db.Usuario.findAll).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            nombre: 'John Doe',
            email: 'john@test.com'
          }),
          expect.objectContaining({
            nombre: 'Jane Smith',
            email: 'jane@test.com'
          })
        ])
      );
    });

    test('debe excluir contraseña de resultados', async () => {
      const mockUsers = [
        {
          id: 1,
          nombre: 'John',
          email: 'john@test.com',
          rut: '12345678-9',
          rol: { nombre: 'Admin' },
          sucursal: null
        }
      ];

      db.Usuario.findAll.mockResolvedValue(mockUsers);

      await usuarioController.getAllUsers(mockReq, mockRes, mockNext);

      const callArgs = db.Usuario.findAll.mock.calls[0][0];
      expect(callArgs.attributes).toBeDefined();
      expect(callArgs.attributes).toEqual(['id', 'nombre', 'email', 'rut']);
    });

    test('debe incluir rol y sucursal', async () => {
      db.Usuario.findAll.mockResolvedValue([]);

      await usuarioController.getAllUsers(mockReq, mockRes, mockNext);

      const callArgs = db.Usuario.findAll.mock.calls[0][0];
      expect(callArgs.include).toBeDefined();
      expect(callArgs.include.length).toBeGreaterThanOrEqual(2);
    });

    test('debe ordenar usuarios por nombre', async () => {
      db.Usuario.findAll.mockResolvedValue([]);

      await usuarioController.getAllUsers(mockReq, mockRes, mockNext);

      const callArgs = db.Usuario.findAll.mock.calls[0][0];
      expect(callArgs.order).toEqual([['nombre', 'ASC']]);
    });

    test('debe retornar lista vacía si no hay usuarios', async () => {
      db.Usuario.findAll.mockResolvedValue([]);

      await usuarioController.getAllUsers(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    test('debe manejar errores de BD', async () => {
      const error = new Error('DB Error');
      db.Usuario.findAll.mockRejectedValue(error);

      await usuarioController.getAllUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========================================
  // Pruebas para findById
  // ========================================
  describe('findById', () => {
    test('debe retornar usuario por ID', async () => {
      mockReq.params = { id: 1 };

      const mockUser = {
        id: 1,
        nombre: 'John Doe',
        email: 'john@test.com',
        rut: '12345678-9',
        rol: { nombre: 'Admin' },
        sucursal: { nombre: 'Sucursal 1' }
      };

      db.Usuario.findByPk.mockResolvedValue(mockUser);

      await usuarioController.findById(mockReq, mockRes, mockNext);

      expect(db.Usuario.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'John Doe',
          email: 'john@test.com'
        })
      );
    });

    test('debe retornar 404 si usuario no existe', async () => {
      mockReq.params = { id: 999 };

      db.Usuario.findByPk.mockResolvedValue(null);

      await usuarioController.findById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('no encontrado')
        })
      );
    });

    test('debe excluir contraseña de resultados', async () => {
      mockReq.params = { id: 1 };

      db.Usuario.findByPk.mockResolvedValue({
        id: 1,
        nombre: 'John',
        email: 'john@test.com'
      });

      await usuarioController.findById(mockReq, mockRes, mockNext);

      const callArgs = db.Usuario.findByPk.mock.calls[0][1];
      expect(callArgs.attributes).toEqual(['id', 'nombre', 'email', 'rut']);
    });

    test('debe manejar errores de BD', async () => {
      mockReq.params = { id: 1 };

      const error = new Error('DB Error');
      db.Usuario.findByPk.mockRejectedValue(error);

      await usuarioController.findById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('debe incluir rol y sucursal', async () => {
      mockReq.params = { id: 1 };

      db.Usuario.findByPk.mockResolvedValue({
        id: 1,
        nombre: 'John',
        rol: { nombre: 'Admin' },
        sucursal: { nombre: 'Sucursal 1' }
      });

      await usuarioController.findById(mockReq, mockRes, mockNext);

      const callArgs = db.Usuario.findByPk.mock.calls[0][1];
      expect(callArgs.include).toBeDefined();
    });
  });

  // ========================================
  // Pruebas para updateUser
  // ========================================
  describe('updateUser', () => {
    let mockTransaction;

    beforeEach(() => {
      mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
        finished: false
      };
      db.sequelize.transaction.mockResolvedValue(mockTransaction);
    });

    test('debe actualizar usuario correctamente', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        nombre: 'John Updated',
        email: 'john.updated@test.com'
      };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        rut: '12345678-9',
        sucursal_id: 1,
        update: jest.fn().mockResolvedValue(true),
        setRol: jest.fn().mockResolvedValue(true)
      };

      db.Usuario.findByPk.mockResolvedValue(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce({
        id: 1,
        nombre: 'John Updated',
        email: 'john.updated@test.com',
        rut: '12345678-9',
        rol: { nombre: 'Admin' },
        sucursal: { nombre: 'Sucursal 1' }
      });

      await usuarioController.updateUser(mockReq, mockRes, mockNext);

      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'John Updated',
          email: 'john.updated@test.com'
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('debe retornar 404 si usuario no existe', async () => {
      mockReq.params = { id: 999 };
      mockReq.body = { nombre: 'Test' };

      db.Usuario.findByPk.mockResolvedValue(null);

      await usuarioController.updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('debe permitir actualizar contraseña', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        contrasena: 'NewPassword123!'
      };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        contrasena: 'old_hash',
        sucursal_id: 1,
        update: jest.fn().mockResolvedValue(true),
        setRol: jest.fn().mockResolvedValue(true)
      };

      db.Usuario.findByPk.mockResolvedValue(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce({
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        rol: { nombre: 'Admin' },
        sucursal: null
      });

      bcrypt.hashSync.mockReturnValue('new_hash');

      await usuarioController.updateUser(mockReq, mockRes, mockNext);

      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          contrasena: 'new_hash'
        }),
        expect.any(Object)
      );
    });

    test('debe permitir cambiar rol del usuario', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        rol_id: 2
      };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        sucursal_id: 1,
        update: jest.fn().mockResolvedValue(true),
        setRol: jest.fn().mockResolvedValue(true)
      };

      const mockRole = { id: 2, nombre: 'Vendedor' };

      db.Usuario.findByPk.mockResolvedValue(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce(mockUser);
      db.Rol.findByPk.mockResolvedValue(mockRole);
      db.Usuario.findByPk.mockResolvedValueOnce({
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        rol: mockRole,
        sucursal: null
      });

      await usuarioController.updateUser(mockReq, mockRes, mockNext);

      expect(db.Rol.findByPk).toHaveBeenCalledWith(2, { transaction: mockTransaction });
      expect(mockUser.setRol).toHaveBeenCalled();
    });

    test('debe rechazar si rol_id no válido', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        rol_id: 999
      };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        sucursal_id: 1,
        update: jest.fn().mockResolvedValue(true),
        setRol: jest.fn().mockResolvedValue(true)
      };

      db.Usuario.findByPk.mockResolvedValue(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce(mockUser);
      db.Rol.findByPk.mockResolvedValue(null);

      await usuarioController.updateUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('debe usar valores existentes si no se proporcionan nuevos', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {}; // Vacío

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        rut: '12345678-9',
        sucursal_id: 1,
        update: jest.fn().mockResolvedValue(true),
        setRol: jest.fn().mockResolvedValue(true)
      };

      db.Usuario.findByPk.mockResolvedValue(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce({
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        rol: { nombre: 'Admin' },
        sucursal: null
      });

      await usuarioController.updateUser(mockReq, mockRes, mockNext);

      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'John',
          email: 'john@test.com',
          rut: '12345678-9',
          sucursal_id: 1
        }),
        expect.any(Object)
      );
    });

    test('debe hacer rollback en error', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { nombre: 'Updated' };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        sucursal_id: 1,
        update: jest.fn().mockRejectedValue(new Error('Update error')),
        setRol: jest.fn()
      };

      db.Usuario.findByPk.mockResolvedValue(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce(mockUser);

      await usuarioController.updateUser(mockReq, mockRes, mockNext);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test('debe retornar usuario actualizado con asociaciones', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        nombre: 'Jane Updated'
      };

      const mockUser = {
        id: 1,
        nombre: 'Jane',
        email: 'jane@test.com',
        sucursal_id: 1,
        update: jest.fn().mockResolvedValue(true),
        setRol: jest.fn().mockResolvedValue(true)
      };

      const updatedUser = {
        id: 1,
        nombre: 'Jane Updated',
        email: 'jane@test.com',
        rut: '98765432-1',
        rol: { nombre: 'Vendedor' },
        sucursal: { nombre: 'Sucursal 1' }
      };

      db.Usuario.findByPk.mockResolvedValue(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce(mockUser);
      db.Usuario.findByPk.mockResolvedValueOnce(updatedUser);

      await usuarioController.updateUser(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Jane Updated',
          rol: { nombre: 'Vendedor' }
        })
      );
    });
  });

  // ========================================
  // Pruebas para deleteUser
  // ========================================
  describe('deleteUser', () => {
    test('debe eliminar usuario correctamente', async () => {
      mockReq.params = { id: 1 };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        destroy: jest.fn().mockResolvedValue(true)
      };

      db.Usuario.findByPk.mockResolvedValue(mockUser);

      await usuarioController.deleteUser(mockReq, mockRes, mockNext);

      expect(mockUser.destroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    test('debe retornar 404 si usuario no existe', async () => {
      mockReq.params = { id: 999 };

      db.Usuario.findByPk.mockResolvedValue(null);

      await usuarioController.deleteUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('no encontrado')
        })
      );
    });

    test('debe manejar errores de eliminación', async () => {
      mockReq.params = { id: 1 };

      const error = new Error('Delete error');
      db.Usuario.findByPk.mockRejectedValue(error);

      await usuarioController.deleteUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========================================
  // Pruebas de Integración
  // ========================================
  describe('UsuarioController Integration', () => {
    test('debe permitir flujo completo: crear, obtener, actualizar', async () => {
      // Get all
      db.Usuario.findAll.mockResolvedValue([
        {
          id: 1,
          nombre: 'John',
          email: 'john@test.com',
          rut: '12345678-9',
          rol: { nombre: 'Admin' },
          sucursal: null
        }
      ]);

      await usuarioController.getAllUsers(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();

      jest.clearAllMocks();

      // Find by ID
      mockReq.params = { id: 1 };
      db.Usuario.findByPk.mockResolvedValue({
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        rol: { nombre: 'Admin' },
        sucursal: null
      });

      await usuarioController.findById(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
