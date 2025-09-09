const logger = require('./logger');
const { ValidationError } = require('sequelize');
const httpStatus = require('http-status-codes');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Manejo de errores específicos
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Error de validación: ' + err.errors.map(e => e.message).join(', ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token JWT inválido';
  }

  // Loggear errores críticos
  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.url}] ${err.stack}`);
  } else {
    logger.warn(`[${req.method} ${req.url}] ${message}`);
  }

  // Respuesta al cliente
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;