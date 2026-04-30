jest.mock('./logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}));

jest.mock('sequelize', () => ({
  ValidationError: class ValidationError extends Error {}
}));

const { ValidationError } = require('sequelize');
const logger = require('./logger');
const errorHandler = require('./errorHandler');

describe('errorHandler', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { method: 'GET', url: '/test' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('uses err statusCode and logs warning for client errors', () => {
    const err = new Error('Solicitud inválida');
    err.statusCode = 400;

    errorHandler(err, req, res, jest.fn());

    expect(logger.warn).toHaveBeenCalledWith('[GET /test] Solicitud inválida');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Solicitud inválida'
    });
  });

  test('formats sequelize validation errors as 400', () => {
    const err = new ValidationError('validation failed');
    err.errors = [{ message: 'Nombre requerido' }, { message: 'Email inválido' }];

    errorHandler(err, req, res, jest.fn());

    expect(logger.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error de validación: Nombre requerido, Email inválido'
    });
  });

  test('maps JsonWebTokenError to 401', () => {
    const err = new Error('bad token');
    err.name = 'JsonWebTokenError';

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token JWT inválido'
    });
  });

  test('logs stack as error for server failures and includes stack in development', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('boom');

    errorHandler(err, req, res, jest.fn());

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('[GET /test] Error: boom'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'boom',
      stack: expect.any(String)
    }));
    delete process.env.NODE_ENV;
  });
});