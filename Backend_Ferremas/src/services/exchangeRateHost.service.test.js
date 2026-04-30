jest.mock('axios', () => ({
  get: jest.fn()
}));

jest.mock('../middlewares/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const axios = require('axios');
const logger = require('../middlewares/logger');
const exchangeRateHostService = require('./exchangeRateHost.service');

describe('exchangeRateHost.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('clpToUsd returns converted amount', async () => {
    axios.get.mockResolvedValue({ data: { result: 12.5 } });

    const value = await exchangeRateHostService.clpToUsd(10000);

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('amount=10000'));
    expect(value).toBe(12.5);
  });

  test('usdToClp returns converted amount', async () => {
    axios.get.mockResolvedValue({ data: { result: 9500 } });

    const value = await exchangeRateHostService.usdToClp(10);

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('from=USD'));
    expect(value).toBe(9500);
  });

  test('getCurrentRate returns current CLP/USD rate', async () => {
    axios.get.mockResolvedValue({ data: { rates: { USD: 0.0011 } } });

    const value = await exchangeRateHostService.getCurrentRate();

    expect(value).toBe(0.0011);
  });

  test('throws when API response is invalid', async () => {
    axios.get.mockResolvedValue({ data: {} });

    await expect(exchangeRateHostService.getCurrentRate()).rejects.toThrow('Respuesta inválida de ExchangeRate.host');
    expect(logger.error).toHaveBeenCalled();
  });

  test('logs and rethrows network errors', async () => {
    axios.get.mockRejectedValue(new Error('network down'));

    await expect(exchangeRateHostService.clpToUsd(1000)).rejects.toThrow('network down');
    expect(logger.error).toHaveBeenCalledWith('Error convirtiendo CLP a USD:', 'network down');
  });
});