/**
 * Índice de constantes
 * Exporta todas las constantes de la aplicación desde un punto centralizado
 */

const HTTP_STATUS = require('./httpStatus');
const MESSAGES = require('./messages');
const BUSINESS = require('./business');

module.exports = {
  HTTP_STATUS,
  MESSAGES,
  BUSINESS
};

// Exportaciones individuales para facilidad de uso
module.exports.httpStatus = HTTP_STATUS;
module.exports.messages = MESSAGES;
module.exports.business = BUSINESS;