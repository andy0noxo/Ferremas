jest.mock('axios', () => ({
  create: jest.fn()
}));

jest.mock('../models', () => ({
  sequelize: {
    transaction: jest.fn()
  },
  Pago: {
    findOne: jest.fn()
  }
}));

jest.mock('../middlewares/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

jest.mock('../config/api.config', () => ({
  transbank: {
    url: 'https://tbk.test',
    commerceCode: '123',
    apiKey: 'abc'
  }
}));

const axios = require('axios');
const db = require('../models');
const logger = require('../middlewares/logger');

const api = {
  post: jest.fn(),
  put: jest.fn()
};

axios.create.mockReturnValue(api);

const transbankService = require('./transbank.service');

describe('transbank.service', () => {
  let transaction;

  beforeEach(() => {
    axios.create.mockReturnValue(api);
    transaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };
    api.post.mockReset();
    api.put.mockReset();
    db.sequelize.transaction.mockResolvedValue(transaction);
    db.Pago.findOne.mockReset();
    db.Pago.findOne.mockResolvedValue(undefined);
    logger.error.mockReset();
    logger.info.mockReset();
    logger.warn.mockReset();
    logger.debug.mockReset();
  });

  test('creates axios instance with expected config', () => {
    jest.resetModules();

    const isolatedAxios = require('axios');
    const isolatedApi = {
      post: jest.fn(),
      put: jest.fn()
    };
    isolatedAxios.create.mockReturnValue(isolatedApi);

    require('./transbank.service');

    expect(isolatedAxios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://tbk.test',
      headers: expect.objectContaining({
        'Tbk-Api-Key-Id': '123',
        'Tbk-Api-Key-Secret': 'abc',
        'Content-Type': 'application/json'
      })
    }));
  });

  test('createTransaction returns data from API', async () => {
    api.post.mockResolvedValue({ data: { token: 'TK1', url: 'https://tbk' } });

    const result = await transbankService.createTransaction({
      buy_order: '1',
      session_id: '2',
      amount: 3000,
      return_url: 'https://return'
    });

    expect(api.post).toHaveBeenCalledWith(
      '/rswebpaytransaction/api/webpay/v1.2/transactions',
      {
        buy_order: '1',
        session_id: '2',
        amount: 3000,
        return_url: 'https://return'
      }
    );
    expect(result).toEqual({ token: 'TK1', url: 'https://tbk' });
  });

  test('createTransaction wraps API failures', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'bad request' } } });

    await expect(transbankService.createTransaction({
      buy_order: '1',
      session_id: '2',
      amount: 3000,
      return_url: 'https://return'
    })).rejects.toThrow('Error al iniciar transacción con Webpay');

    expect(logger.error).toHaveBeenCalled();
  });

  test('commitTransaction returns data from API', async () => {
    api.put.mockResolvedValue({ data: { status: 'AUTHORIZED' } });

    const result = await transbankService.commitTransaction('TK1');

    expect(api.put).toHaveBeenCalledWith('/rswebpaytransaction/api/webpay/v1.2/transactions/TK1');
    expect(result).toEqual({ status: 'AUTHORIZED' });
  });

  test('handleWebhook updates payment and commits transaction', async () => {
    const pago = { update: jest.fn().mockResolvedValue(undefined) };
    db.Pago.findOne.mockResolvedValue(pago);
    api.put.mockResolvedValue({ data: { status: 'AUTHORIZED' } });

    const result = await transbankService.handleWebhook({ token: 'TK1' });

    expect(db.Pago.findOne).toHaveBeenCalledWith({ where: { transbank_token: 'TK1' }, transaction });
    expect(pago.update).toHaveBeenCalledWith(expect.objectContaining({
      estado: 'completado'
    }), { transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(result).toBe(pago);
  });

  test('handleWebhook rolls back when payment is missing', async () => {
    db.Pago.findOne.mockResolvedValue(null);

    await expect(transbankService.handleWebhook({ token: 'TK1' })).rejects.toThrow('Pago no encontrado');

    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });
});