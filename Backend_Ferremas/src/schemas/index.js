/**
 * Índice de schemas de validación
 * Exporta todos los schemas de validación desde un punto centralizado
 */

const authSchemas = require('./auth.schema');
const productSchemas = require('./product.schema');
const userSchemas = require('./user.schema');

module.exports = {
  auth: authSchemas,
  product: productSchemas,
  user: userSchemas
};

// Exportaciones directas para facilidad de uso
module.exports.loginSchema = authSchemas.loginSchema;
module.exports.registerSchema = authSchemas.registerSchema;
module.exports.createProductSchema = productSchemas.createProductSchema;
module.exports.updateProductSchema = productSchemas.updateProductSchema;
module.exports.createUserSchema = userSchemas.createUserSchema;
module.exports.updateUserSchema = userSchemas.updateUserSchema;