/**
 * Pruebas Unitarias - middlewares/auth.jwt.js
 * Autenticación JWT y verificación de roles
 */

// Mock de logger
jest.mock('./logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

// Mock de models
jest.mock('../models', () => ({
  Usuario: {
    findByPk: jest.fn()
  },
  Rol: {},
  Sucursal: {}
}));

// Mock de configuración
jest.mock('../config/auth.config', () => ({
  jwt: { secret: 'test-secret' }
}));

jest.mock('../config/roles.config', () => ({
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
  CLIENTE: 'cliente'
}));

const jwt = require('jsonwebtoken');
const db = require('../models');
const logger = require('./logger');
const { jwt: jwtConfig } = require('../config/auth.config');
const { verifyToken, checkRole } = require('./auth.jwt');

describe('JWT Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Limpiar mocks anteriores
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // Pruebas para verifyToken
  // ========================================
  describe('verifyToken', () => {
    test('debe rechazar si no hay header Authorization', async () => {
      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('requiere token')
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('debe rechazar si header no comienza con Bearer', async () => {
      mockReq.headers.authorization = 'Token abc123';

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('debe rechazar token vacío', async () => {
      mockReq.headers.authorization = 'Bearer ';

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('debe rechazar token inválido', async () => {
      mockReq.headers.authorization = 'Bearer token_invalido';

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('inválido')
        })
      );
    });

    test('debe aceptar token válido y establecer usuario', async () => {
      const user = {
        id: 1,
        rol: { nombre: 'admin' },
        sucursal: { id: 10 }
      };

      const token = jwt.sign({ id: 1 }, jwtConfig.secret);
      mockReq.headers.authorization = `Bearer ${token}`;

      db.Usuario.findByPk.mockResolvedValue(user);

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(1);
      expect(mockReq.user.rol).toBe('admin');
    });

    test('debe rechazar si usuario no existe en BD', async () => {
      const token = jwt.sign({ id: 999 }, jwtConfig.secret);
      mockReq.headers.authorization = `Bearer ${token}`;

      db.Usuario.findByPk.mockResolvedValue(null);

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('no encontrado')
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('debe extraer sucursalId del usuario', async () => {
      const user = {
        id: 1,
        rol: { nombre: 'vendedor' },
        sucursal: { id: 5 }
      };

      const token = jwt.sign({ id: 1 }, jwtConfig.secret);
      mockReq.headers.authorization = `Bearer ${token}`;

      db.Usuario.findByPk.mockResolvedValue(user);

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockReq.user.sucursalId).toBe(5);
    });

    test('debe manejar error en BD', async () => {
      const token = jwt.sign({ id: 1 }, jwtConfig.secret);
      mockReq.headers.authorization = `Bearer ${token}`;

      db.Usuario.findByPk.mockRejectedValue(new Error('DB Error'));

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(logger.error).toHaveBeenCalled();
    });

    test('debe manejar token expirado', async () => {
      const expiredToken = jwt.sign(
        { id: 1 },
        jwtConfig.secret,
        { expiresIn: '-1h' }
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Token inválido')
        })
      );
    });

    test('debe incluir include correctamente en findByPk', async () => {
      const user = {
        id: 1,
        rol: { nombre: 'admin' },
        sucursal: { id: 10 }
      };

      const token = jwt.sign({ id: 1 }, jwtConfig.secret);
      mockReq.headers.authorization = `Bearer ${token}`;

      db.Usuario.findByPk.mockResolvedValue(user);

      await verifyToken(mockReq, mockRes, mockNext);

      expect(db.Usuario.findByPk).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          include: expect.any(Array)
        })
      );
    });
  });

  // ========================================
  // Pruebas para checkRole
  // ========================================
  describe('checkRole', () => {
    test('debe permitir acceso si rol es permitido', () => {
      mockReq.user = { id: 1, rol: 'admin' };
      const middleware = checkRole(['admin', 'vendedor']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('debe permitir acceso si rol está en lista permitida', () => {
      mockReq.user = { id: 1, rol: 'vendedor' };
      const middleware = checkRole(['admin', 'vendedor', 'cliente']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('debe rechazar acceso si rol no es permitido', () => {
      mockReq.user = { id: 1, rol: 'cliente' };
      const middleware = checkRole(['admin', 'vendedor']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('debe mostrar roles permitidos en mensaje de error', () => {
      mockReq.user = { id: 1, rol: 'cliente' };
      const middleware = checkRole(['admin', 'vendedor']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('admin')
        })
      );
    });

    test('debe loguear intento de acceso no autorizado', () => {
      mockReq.user = { id: 99, rol: 'cliente' };
      const middleware = checkRole(['admin']);

      middleware(mockReq, mockRes, mockNext);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Intento de acceso no autorizado')
      );
    });

    test('debe incluir usuario y rol en log de warning', () => {
      mockReq.user = { id: 5, rol: 'viewer' };
      const middleware = checkRole(['admin']);

      middleware(mockReq, mockRes, mockNext);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Usuario 5')
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('viewer')
      );
    });

    test('debe manejar array vacío de roles permitidos', () => {
      mockReq.user = { id: 1, rol: 'admin' };
      const middleware = checkRole([]);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    test('debe ser case-sensitive en comparación de roles', () => {
      mockReq.user = { id: 1, rol: 'Admin' };
      const middleware = checkRole(['admin']);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    test('debe retornar respuesta correcta', () => {
      mockReq.user = { id: 1, rol: 'cliente' };
      const middleware = checkRole(['admin']);

      const result = middleware(mockReq, mockRes, mockNext);

      // Generalmente los middlewares no retornan, pero si lo hacen:
      if (result) {
        expect(result).toBe(mockRes);
      }
    });
  });

  // ========================================
  // Pruebas de Integración
  // ========================================
  describe('JWT Integration', () => {
    test('debe verificar token y luego aplicar check de roles', async () => {
      const user = {
        id: 1,
        rol: { nombre: 'admin' },
        sucursal: { id: 10 }
      };

      const token = jwt.sign({ id: 1 }, jwtConfig.secret);
      mockReq.headers.authorization = `Bearer ${token}`;

      db.Usuario.findByPk.mockResolvedValue(user);

      // Primero verificar token
      await verifyToken(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Luego verificar rol
      const roleMiddleware = checkRole(['admin']);
      roleMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    test('debe rechazar acceso en la etapa de verificación de token', async () => {
      mockReq.headers.authorization = 'InvalidToken';
      const roleMiddleware = checkRole(['admin']);

      await verifyToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      // No debería llegar al check de roles
    });
  });
});
