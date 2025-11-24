/**
 * Índice de utilidades
 * Exporta todas las utilidades de la aplicación desde un punto centralizado
 */

const validators = require('./validators');
const responses = require('./responses');
const dateHelpers = require('./dateHelpers');

module.exports = {
  validators,
  responses,
  dateHelpers
};

// Exportaciones individuales para facilidad de uso
module.exports.isValidRUT = validators.isValidRUT;
module.exports.validatePasswordStrength = validators.validatePasswordStrength;
module.exports.successResponse = responses.successResponse;
module.exports.errorResponse = responses.errorResponse;
module.exports.formatDate = dateHelpers.formatDate;