jest.mock('axios', () => ({
  get: jest.fn()
}));

jest.mock('../models', () => ({
  ValorDolar: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('../middlewares/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

jest.mock('../config/api.config', () => ({
  dolar: {
    url: 'https://example.com/dolar',
    updateInterval: 60000
  }
}));

const axios = require('axios');
const db = require('../models');
const logger = require('../middlewares/logger');
const dollarService = require('./dollar.service');

describe('dollar.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dollarService.cache = { valor: null, lastUpdate: null };
  });

  test('isCacheValid returns false when cache is empty', () => {
    expect(dollarService.isCacheValid()).toBeFalsy();
  });

  test('updateCache stores value and timestamp', () => {
    dollarService.updateCache(900);

    expect(dollarService.cache.valor).toBe(900);
    expect(dollarService.cache.lastUpdate).toEqual(expect.any(Number));
  });

  test('getCurrentDollar returns cached value when cache is valid', async () => {
    dollarService.cache = { valor: 850, lastUpdate: Date.now() };

    const value = await dollarService.getCurrentDollar();

    expect(value).toBe(850);
    expect(axios.get).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  test('getCurrentDollar fetches, caches and persists value', async () => {
    axios.get.mockResolvedValue({ data: { serie: [{ valor: 920 }] } });
    db.ValorDolar.create.mockResolvedValue({ id: 1 });

    const value = await dollarService.getCurrentDollar();

    expect(axios.get).toHaveBeenCalledWith('https://example.com/dolar');
    expect(db.ValorDolar.create).toHaveBeenCalledWith(expect.objectContaining({ valor: 920 }));
    expect(value).toBe(920);
  });

  test('getCurrentDollar falls back to last saved value on error', async () => {
    axios.get.mockRejectedValue(new Error('network error'));
    db.ValorDolar.findOne.mockResolvedValue({ valor: 875 });

    const value = await dollarService.getCurrentDollar();

    expect(logger.error).toHaveBeenCalled();
    expect(db.ValorDolar.findOne).toHaveBeenCalledWith({ order: [['fecha', 'DESC']] });
    expect(value).toBe(875);
  });

  test('getLastSavedValue returns default when there is no record', async () => {
    db.ValorDolar.findOne.mockResolvedValue(null);

    const value = await dollarService.getLastSavedValue();

    expect(value).toBe(800);
  });

  test('saveToDatabase logs errors without throwing', async () => {
    db.ValorDolar.create.mockRejectedValue(new Error('db error'));

    await expect(dollarService.saveToDatabase(900)).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalled();
  });
});