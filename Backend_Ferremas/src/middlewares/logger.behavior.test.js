jest.mock('morgan', () => jest.fn(() => 'morgan-middleware'));

describe('logger behavior', () => {
  let morgan;
  let consoleSpy;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    morgan = require('morgan');
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    delete process.env.NODE_ENV;
  });

  test('configura morgan y trimea el mensaje de stream', () => {
    process.env.NODE_ENV = 'development';

    require('./logger');

    expect(morgan).toHaveBeenCalledTimes(1);
    const [, options] = morgan.mock.calls[0];
    expect(options.skip()).toBe(false);
    options.stream.write('  hola mundo  \n');
    expect(console.log).toHaveBeenCalledWith('hola mundo');
  });

  test('skip devuelve true fuera de development', () => {
    process.env.NODE_ENV = 'production';

    require('./logger');

    const [, options] = morgan.mock.calls[0];
    expect(options.skip()).toBe(true);
  });

  test('usa development como valor por defecto cuando NODE_ENV no existe', () => {
    delete process.env.NODE_ENV;

    require('./logger');

    const [, options] = morgan.mock.calls[0];
    expect(options.skip()).toBe(false);
  });
});