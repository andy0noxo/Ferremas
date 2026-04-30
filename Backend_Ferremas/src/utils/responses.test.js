/**
 * Pruebas Unitarias - utils/responses.js
 * Generación de respuestas HTTP estándar
 */

const { successResponse, errorResponse } = require('./responses');
const { HTTP_STATUS } = require('../constants');

describe('Response Utils', () => {
  let mockRes;

  beforeEach(() => {
    // Setup de mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  // ========================================
  // Pruebas para successResponse
  // ========================================
  describe('successResponse', () => {
    test('debe generar respuesta exitosa con datos', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Operación exitosa';

      successResponse(mockRes, data, message, HTTP_STATUS.OK);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message,
          data,
          timestamp: expect.any(String)
        })
      );
    });

    test('debe usar código 200 por defecto', () => {
      successResponse(mockRes, { id: 1 });

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    test('debe usar mensaje por defecto', () => {
      successResponse(mockRes, { id: 1 });

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Operación exitosa'
        })
      );
    });

    test('debe excluir propiedad data cuando es null', () => {
      successResponse(mockRes, null, 'Deletado exitosamente');

      const callArg = mockRes.json.mock.calls[0][0];
      expect(callArg).not.toHaveProperty('data');
      expect(callArg.success).toBe(true);
    });

    test('debe incluir timestamp en respuesta', () => {
      successResponse(mockRes, { id: 1 });

      const callArg = mockRes.json.mock.calls[0][0];
      expect(callArg.timestamp).toBeDefined();
      expect(new Date(callArg.timestamp)).toBeInstanceOf(Date);
    });

    test('debe usar código 201 para creación', () => {
      successResponse(mockRes, { id: 1 }, 'Creado', HTTP_STATUS.CREATED);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    });

    test('debe retornar el objeto response', () => {
      const result = successResponse(mockRes, { id: 1 });

      expect(result).toBe(mockRes);
    });

    test('debe manejar datos complejos', () => {
      const complexData = {
        id: 1,
        user: { name: 'John', role: 'admin' },
        items: [1, 2, 3],
        nested: { deep: { value: 'test' } }
      };

      successResponse(mockRes, complexData);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: complexData
        })
      );
    });
  });

  // ========================================
  // Pruebas para errorResponse
  // ========================================
  describe('errorResponse', () => {
    test('debe generar respuesta de error con mensaje', () => {
      const message = 'Error al procesar';
      const statusCode = HTTP_STATUS.BAD_REQUEST;

      errorResponse(mockRes, message, statusCode);

      expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message,
          timestamp: expect.any(String)
        })
      );
    });

    test('debe usar código 500 por defecto', () => {
      errorResponse(mockRes, 'Error interno');

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    test('debe usar mensaje por defecto', () => {
      errorResponse(mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error interno del servidor'
        })
      );
    });

    test('debe incluir errores detallados cuando se proporcionan', () => {
      const errors = ['Campo email requerido', 'Campo password inválido'];

      errorResponse(mockRes, 'Validación fallida', HTTP_STATUS.BAD_REQUEST, errors);

      const callArg = mockRes.json.mock.calls[0][0];
      expect(callArg.errors).toEqual(errors);
    });

    test('debe excluir propiedad errors cuando es null', () => {
      errorResponse(mockRes, 'Error', HTTP_STATUS.BAD_REQUEST, null);

      const callArg = mockRes.json.mock.calls[0][0];
      expect(callArg).not.toHaveProperty('errors');
    });

    test('debe incluir timestamp en respuesta de error', () => {
      errorResponse(mockRes, 'Error');

      const callArg = mockRes.json.mock.calls[0][0];
      expect(callArg.timestamp).toBeDefined();
      expect(new Date(callArg.timestamp)).toBeInstanceOf(Date);
    });

    test('debe manejar objeto de errores complejos', () => {
      const errors = {
        email: 'Formato inválido',
        password: 'Muy corta',
        rut: 'RUT duplicado'
      };

      errorResponse(mockRes, 'Errores de validación', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);

      const callArg = mockRes.json.mock.calls[0][0];
      expect(callArg.errors).toEqual(errors);
    });

    test('debe retornar el objeto response', () => {
      const result = errorResponse(mockRes, 'Error');

      expect(result).toBe(mockRes);
    });

    test('debe manejar código 401 para no autorizado', () => {
      errorResponse(mockRes, 'Token inválido', HTTP_STATUS.UNAUTHORIZED);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    });

    test('debe manejar código 403 para acceso denegado', () => {
      errorResponse(mockRes, 'Acceso denegado', HTTP_STATUS.FORBIDDEN);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
    });

    test('debe manejar código 404 para no encontrado', () => {
      errorResponse(mockRes, 'Recurso no encontrado', HTTP_STATUS.NOT_FOUND);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });
  });

  // ========================================
  // Pruebas de Integración de Respuestas
  // ========================================
  describe('Response Integration', () => {
    test('debe mantener consistencia en estructura de éxito', () => {
      successResponse(mockRes, { id: 1 }, 'Test');

      const response = mockRes.json.mock.calls[0][0];
      expect(Object.keys(response).sort()).toEqual(
        ['data', 'message', 'success', 'timestamp'].sort()
      );
    });

    test('debe mantener consistencia en estructura de error', () => {
      errorResponse(mockRes, 'Test');

      const response = mockRes.json.mock.calls[0][0];
      expect(Object.keys(response).sort()).toEqual(
        ['message', 'success', 'timestamp'].sort()
      );
    });

    test('debe permitir encadenamiento de métodos', () => {
      const chain = successResponse(mockRes, { id: 1 });
      expect(chain.status).toBeDefined();
      expect(chain.json).toBeDefined();
    });
  });
});
