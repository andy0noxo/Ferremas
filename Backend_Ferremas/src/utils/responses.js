/**
 * Utilidades para respuestas HTTP
 * Funciones estandarizadas para generar respuestas consistentes
 */

const { HTTP_STATUS } = require('../constants');

/**
 * Genera respuesta de éxito estándar
 * @param {object} res - Objeto response de Express
 * @param {any} data - Datos a enviar
 * @param {string} message - Mensaje de éxito
 * @param {number} statusCode - Código de estado HTTP
 * @returns {object} Respuesta JSON
 */
const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  // No incluir data si es null para respuestas más limpias
  if (data === null) {
    delete response.data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Genera respuesta de error estándar
 * @param {object} res - Objeto response de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {any} errors - Errores detallados (opcional)
 * @returns {object} Respuesta JSON
 */
const errorResponse = (res, message = 'Error interno del servidor', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  // Incluir errores detallados solo si se proporcionan
  if (errors) {
    response.errors = errors;
  }
  
  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development' && errors instanceof Error) {
    response.stack = errors.stack;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Genera respuesta de validación fallida
 * @param {object} res - Objeto response de Express
 * @param {array} validationErrors - Array de errores de validación
 * @returns {object} Respuesta JSON
 */
const validationErrorResponse = (res, validationErrors) => {
  return errorResponse(res, 'Errores de validación', HTTP_STATUS.UNPROCESSABLE_ENTITY, validationErrors);
};

/**
 * Genera respuesta de recurso no encontrado
 * @param {object} res - Objeto response de Express
 * @param {string} resource - Nombre del recurso no encontrado
 * @returns {object} Respuesta JSON
 */
const notFoundResponse = (res, resource = 'Recurso') => {
  return errorResponse(res, `${resource} no encontrado`, HTTP_STATUS.NOT_FOUND);
};

/**
 * Genera respuesta de no autorizado
 * @param {object} res - Objeto response de Express
 * @param {string} message - Mensaje personalizado
 * @returns {object} Respuesta JSON
 */
const unauthorizedResponse = (res, message = 'No autorizado') => {
  return errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Genera respuesta de prohibido
 * @param {object} res - Objeto response de Express
 * @param {string} message - Mensaje personalizado
 * @returns {object} Respuesta JSON
 */
const forbiddenResponse = (res, message = 'Acceso prohibido') => {
  return errorResponse(res, message, HTTP_STATUS.FORBIDDEN);
};

/**
 * Genera respuesta paginada
 * @param {object} res - Objeto response de Express
 * @param {array} data - Datos paginados
 * @param {object} pagination - Información de paginación
 * @param {string} message - Mensaje de éxito
 * @returns {object} Respuesta JSON
 */
const paginatedResponse = (res, data, pagination, message = 'Datos obtenidos exitosamente') => {
  return successResponse(res, {
    items: data,
    pagination: {
      currentPage: pagination.page,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      totalItems: pagination.total,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1
    }
  }, message);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  paginatedResponse
};