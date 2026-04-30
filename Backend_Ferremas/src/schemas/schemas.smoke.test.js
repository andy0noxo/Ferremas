const schemas = require('./index');
const authSchemas = require('./auth.schema');
const productSchemas = require('./product.schema');
const userSchemas = require('./user.schema');

describe('Schemas smoke test', () => {
  test('exporta las schemas principales', () => {
    expect(schemas).toBeDefined();
    expect(schemas.loginSchema).toBeDefined();
    expect(schemas.registerSchema).toBeDefined();
    expect(schemas.createProductSchema).toBeDefined();
    expect(schemas.updateProductSchema).toBeDefined();
    expect(schemas.createUserSchema).toBeDefined();
    expect(schemas.updateUserSchema).toBeDefined();
  });

  test('auth schema expone esquemas de login y registro', () => {
    expect(authSchemas.loginSchema).toBeDefined();
    expect(authSchemas.registerSchema).toBeDefined();
  });

  test('product schema expone esquemas de creación y actualización', () => {
    expect(productSchemas.createProductSchema).toBeDefined();
    expect(productSchemas.updateProductSchema).toBeDefined();
  });

  test('user schema expone esquemas de creación y actualización', () => {
    expect(userSchemas.createUserSchema).toBeDefined();
    expect(userSchemas.updateUserSchema).toBeDefined();
  });
});