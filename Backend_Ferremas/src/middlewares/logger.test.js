jest.mock('morgan', () => jest.fn(() => 'morgan-middleware'));

describe('logger', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.resetModules();
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      info: jest.spyOn(console, 'info').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    delete process.env.NODE_ENV;
  });

  test('logger methods proxy to console methods', () => {
    const logger = require('./logger');

    logger.http('http message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');
    logger.debug('debug message');

    expect(console.log).toHaveBeenCalledWith('http message');
    expect(console.info).toHaveBeenCalledWith('info message');
    expect(console.warn).toHaveBeenCalledWith('warn message');
    expect(console.error).toHaveBeenCalledWith('error message');
    expect(console.debug).toHaveBeenCalledWith('debug message');
  });

  test('module loads morgan middleware without throwing', () => {
    expect(() => require('./logger')).not.toThrow();
  });
});