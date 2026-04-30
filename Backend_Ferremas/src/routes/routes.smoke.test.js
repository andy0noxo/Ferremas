const createControllerMock = () => new Proxy({}, {
  get: () => jest.fn()
});

jest.mock('../controllers/auth.controller', () => createControllerMock());
jest.mock('../controllers/categoria.controller', () => createControllerMock());
jest.mock('../controllers/marca.controller', () => createControllerMock());
jest.mock('../controllers/pago.controller', () => createControllerMock());
jest.mock('../controllers/pedido.controller', () => createControllerMock());
jest.mock('../controllers/producto.controller', () => createControllerMock());
jest.mock('../controllers/rol.controller', () => createControllerMock());
jest.mock('../controllers/stock.controller', () => createControllerMock());
jest.mock('../controllers/sucursal.controller', () => createControllerMock());
jest.mock('../controllers/usuario.controller', () => createControllerMock());
jest.mock('../controllers/venta.controller', () => createControllerMock());

jest.mock('../middlewares/auth.jwt', () => ({
  verifyToken: jest.fn(() => (req, res, next) => next()),
  checkRole: jest.fn(() => (req, res, next) => next())
}));

jest.mock('../middlewares/validators', () => ({
  validateRequest: jest.fn(() => (req, res, next) => next()),
  userValidations: [],
  productValidations: [],
  pedidoValidations: [],
  idParamValidation: []
}));

describe('Route modules smoke test', () => {
  const routeModules = [
    './auth.routes',
    './categoria.routes',
    './marca.routes',
    './pago.routes',
    './pedido.routes',
    './producto.routes',
    './rol.routes',
    './stock.routes',
    './sucursal.routes',
    './usuario.routes',
    './venta.routes'
  ];

  beforeEach(() => {
    jest.resetModules();
  });

  test('cada router se puede cargar sin errores', () => {
    routeModules.forEach(routePath => {
      const router = require(routePath);
      expect(router).toBeDefined();
    });
  });
});