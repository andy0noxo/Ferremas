/**
 * Pruebas Unitarias - controllers/auth.controller.js
 * Autenticación: Login y Registro
 */

const jwtConfig = { secret: 'test-secret', algorithm: 'HS256', expiration: '8h' };

const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mocks
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models');
jest.mock('../services/email.service');
jest.mock('../config/auth.config', () => ({
  jwt: jwtConfig
}));
jest.mock('../config/roles.config', () => ({
  CLIENTE: 'Cliente'
}));

const EmailService = require('../services/email.service');
const authController = require('./auth.controller');

describe('AuthController', () => {
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
  // Pruebas para login
  // ========================================
  describe('login', () => {
    test('debe loguear usuario con credenciales válidas', async () => {
      mockReq.body = {
        email: 'user@test.com',
        contrasena: 'password123'
      };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'user@test.com',
        contrasena: 'hashed_password',
        rol: { nombre: 'Cliente' },
        Rol: null,
        sucursal: { id: 1, nombre: 'Sucursal 1' }
      };

      db.Usuario.findOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('token123');

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          nombre: 'John',
          email: 'user@test.com',
          rol: 'Cliente',
          token: 'token123'
        })
      );
    });

    test('debe rechazar credenciales inválidas', async () => {
      mockReq.body = {
        email: 'user@test.com',
        contrasena: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        email: 'user@test.com',
        contrasena: 'hashed_password',
        rol: { nombre: 'Cliente' }
      };

      db.Usuario.findOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(false);

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('inválidas')
        })
      );
    });

    test('debe rechazar usuario no encontrado', async () => {
      mockReq.body = {
        email: 'noexiste@test.com',
        contrasena: 'password'
      };

      db.Usuario.findOne.mockResolvedValue(null);

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('debe generar JWT correctamente', async () => {
      mockReq.body = {
        email: 'user@test.com',
        contrasena: 'password123'
      };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'user@test.com',
        contrasena: 'hashed_password',
        rol: { nombre: 'Admin' },
        sucursal: { id: 1 }
      };

      db.Usuario.findOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('token123');

      await authController.login(mockReq, mockRes, mockNext);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          rol: 'Admin'
        }),
        jwtConfig.secret,
        expect.any(Object)
      );
    });

    test('debe llamar next con error en excepción', async () => {
      mockReq.body = {
        email: 'user@test.com',
        contrasena: 'password'
      };

      const error = new Error('DB Error');
      db.Usuario.findOne.mockRejectedValue(error);

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('debe soportar tanto rol como Rol en user', async () => {
      mockReq.body = {
        email: 'user@test.com',
        contrasena: 'password123'
      };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'user@test.com',
        contrasena: 'hashed_password',
        rol: null,
        Rol: { nombre: 'Vendedor' },
        sucursal: { id: 1 }
      };

      db.Usuario.findOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('token123');

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          rol: 'Vendedor'
        })
      );
    });

    test('debe incluir sucursal en respuesta', async () => {
      mockReq.body = {
        email: 'user@test.com',
        contrasena: 'password123'
      };

      const mockUser = {
        id: 1,
        nombre: 'John',
        email: 'user@test.com',
        contrasena: 'hashed_password',
        rol: { nombre: 'Cliente' },
        sucursal: { id: 5, nombre: 'Sucursal Centro' }
      };

      db.Usuario.findOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('token123');

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucursal: { id: 5, nombre: 'Sucursal Centro' }
        })
      );
    });
  });

  // ========================================
  // Pruebas para register
  // ========================================
  describe('register', () => {
    let mockTransaction;

    beforeEach(() => {
      mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
        finished: false
      };
      db.sequelize.transaction.mockResolvedValue(mockTransaction);
    });

    test('debe registrar usuario nuevo exitosamente', async () => {
      mockReq.body = {
        nombre: 'John Doe',
        email: 'john@test.com',
        contrasena: 'SecurePass123!',
        rut: '12345678-9',
        rol: 'Cliente'
      };

      const mockRol = { id: 1, nombre: 'Cliente' };
      const mockNewUser = {
        id: 1,
        nombre: 'John Doe',
        email: 'john@test.com',
        rut: '12345678-9',
        rol_id: 1
      };

      db.Rol.findOne.mockResolvedValue(mockRol);
      db.Usuario.create.mockResolvedValue(mockNewUser);
      db.Usuario.findByPk.mockResolvedValue({
        ...mockNewUser,
        rol: mockRol,
        sucursal: { id: 1 }
      });

      jwt.sign.mockReturnValue('token123');
      EmailService.sendWelcomeEmail.mockResolvedValue(true);

      await authController.register(mockReq, mockRes, mockNext);

      expect(db.Usuario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'John Doe',
          email: 'john@test.com',
          rut: '12345678-9'
        }),
        { transaction: mockTransaction }
      );

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('debe enviar email de bienvenida', async () => {
      mockReq.body = {
        nombre: 'John',
        email: 'john@test.com',
        contrasena: 'SecurePass123!',
        rut: '12345678-9'
      };

      const mockRol = { id: 1, nombre: 'Cliente' };
      const mockNewUser = {
        id: 1,
        nombre: 'John',
        email: 'john@test.com',
        rol_id: 1
      };

      db.Rol.findOne.mockResolvedValue(mockRol);
      db.Usuario.create.mockResolvedValue(mockNewUser);
      db.Usuario.findByPk.mockResolvedValue({
        ...mockNewUser,
        rol: mockRol,
        sucursal: null
      });

      jwt.sign.mockReturnValue('token123');
      EmailService.sendWelcomeEmail.mockResolvedValue(true);

      await authController.register(mockReq, mockRes, mockNext);

      expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'john@test.com',
        'John'
      );
    });

    test('debe rechazar si rol no existe', async () => {
      mockReq.body = {
        nombre: 'John',
        email: 'john@test.com',
        contrasena: 'SecurePass123!',
        rut: '12345678-9',
        rol: 'RolInvalido'
      };

      db.Rol.findOne.mockResolvedValue(null);

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('debe usar rol por defecto si no se proporciona', async () => {
      mockReq.body = {
        nombre: 'John',
        email: 'john@test.com',
        contrasena: 'SecurePass123!',
        rut: '12345678-9'
      };

      const mockRol = { id: 1, nombre: 'Cliente' };
      const mockNewUser = { id: 1, email: 'john@test.com', rol_id: 1 };

      db.Rol.findOne.mockResolvedValue(mockRol);
      db.Usuario.create.mockResolvedValue(mockNewUser);
      db.Usuario.findByPk.mockResolvedValue({
        ...mockNewUser,
        rol: mockRol,
        sucursal: null
      });

      jwt.sign.mockReturnValue('token123');
      EmailService.sendWelcomeEmail.mockResolvedValue(true);

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('debe hacer rollback en error', async () => {
      mockReq.body = {
        nombre: 'John',
        email: 'john@test.com',
        contrasena: 'SecurePass123!',
        rut: '12345678-9'
      };

      const error = new Error('Create error');
      db.Rol.findOne.mockResolvedValue({ id: 1, nombre: 'Cliente' });
      db.Usuario.create.mockRejectedValue(error);

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('debe retornar usuario con token tras registro exitoso', async () => {
      mockReq.body = {
        nombre: 'Jane Doe',
        email: 'jane@test.com',
        contrasena: 'SecurePass123!',
        rut: '98765432-1'
      };

      const mockRol = { id: 2, nombre: 'Cliente' };
      const mockNewUser = {
        id: 2,
        nombre: 'Jane Doe',
        email: 'jane@test.com',
        rol_id: 2
      };

      db.Rol.findOne.mockResolvedValue(mockRol);
      db.Usuario.create.mockResolvedValue(mockNewUser);
      db.Usuario.findByPk.mockResolvedValue({
        id: 2,
        nombre: 'Jane Doe',
        email: 'jane@test.com',
        rol: mockRol,
        sucursal: { id: 1 }
      });

      jwt.sign.mockReturnValue('newtoken123');
      EmailService.sendWelcomeEmail.mockResolvedValue(true);

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          nombre: 'Jane Doe',
          email: 'jane@test.com',
          token: 'newtoken123'
        })
      );
    });
  });

  // ========================================
  // Pruebas de Integración
  // ========================================
  describe('AuthController Integration', () => {
    test('debe permitir flujo completo: registrar y luego loguear', async () => {
      // Setup registro
      mockReq.body = {
        nombre: 'Test User',
        email: 'test@test.com',
        contrasena: 'SecurePass123!',
        rut: '11111111-1'
      };

      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
        finished: false
      };

      db.sequelize.transaction.mockResolvedValue(mockTransaction);
      db.Rol.findOne.mockResolvedValue({ id: 1, nombre: 'Cliente' });
      db.Usuario.create.mockResolvedValue({
        id: 1,
        nombre: 'Test User',
        email: 'test@test.com'
      });

      db.Usuario.findByPk.mockResolvedValue({
        id: 1,
        nombre: 'Test User',
        email: 'test@test.com',
        rol: { nombre: 'Cliente' },
        sucursal: null
      });

      jwt.sign.mockReturnValue('token123');
      EmailService.sendWelcomeEmail.mockResolvedValue(true);

      // Registro
      await authController.register(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();

      jest.clearAllMocks();

      // Setup login
      mockReq.body = {
        email: 'test@test.com',
        contrasena: 'SecurePass123!'
      };

      db.Usuario.findOne.mockResolvedValue({
        id: 1,
        nombre: 'Test User',
        email: 'test@test.com',
        contrasena: 'hashed_password',
        rol: { nombre: 'Cliente' },
        sucursal: null
      });

      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('token123');

      // Login
      await authController.login(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@test.com',
          token: 'token123'
        })
      );
    });
  });

  describe('profile y registroDummy', () => {
    test('debe retornar 404 cuando el perfil no existe', async () => {
      mockReq.user = { id: 99 };
      db.Usuario.findByPk.mockResolvedValue(null);

      await authController.profile(mockReq, mockRes, mockNext);

      expect(db.Usuario.findByPk).toHaveBeenCalledWith(
        99,
        expect.objectContaining({
          attributes: ['id', 'nombre', 'email', 'rut']
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    test('debe retornar el perfil del usuario cuando existe', async () => {
      mockReq.user = { id: 7 };
      const user = {
        id: 7,
        nombre: 'Ana',
        email: 'ana@test.com',
        rut: '11111111-1'
      };
      db.Usuario.findByPk.mockResolvedValue(user);

      await authController.profile(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(user);
    });

    test('debe exponer el endpoint dummy de registro', () => {
      authController.registroDummy(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Endpoint dummy para registro. Usa POST para registrar usuarios.'
      });
    });
  });
});
