// Servicio para conversión de CLP <-> USD usando ExchangeRate.host
const axios = require('axios');
const logger = require('../middlewares/logger');

const ACCESS_KEY = 'ee28012de953fc3e8f3268056c35fadb';
const BASE_URL = 'https://api.exchangerate.host';

class ExchangeRateHostService {
  async clpToUsd(montoClp) {
    try {
      const url = `${BASE_URL}/convert?from=CLP&to=USD&amount=${montoClp}&api_key=${ACCESS_KEY}`;
      const response = await axios.get(url);
      if (response.data && response.data.result) {
        return response.data.result;
      }
      throw new Error('Respuesta inválida de ExchangeRate.host');
    } catch (error) {
      logger.error('Error convirtiendo CLP a USD:', error.message);
      throw error;
    }
  }

  async usdToClp(montoUsd) {
    try {
      const url = `${BASE_URL}/convert?from=USD&to=CLP&amount=${montoUsd}&api_key=${ACCESS_KEY}`;
      const response = await axios.get(url);
      if (response.data && response.data.result) {
        return response.data.result;
      }
      throw new Error('Respuesta inválida de ExchangeRate.host');
    } catch (error) {
      logger.error('Error convirtiendo USD a CLP:', error.message);
      throw error;
    }
  }

  async getCurrentRate() {
    try {
      const url = `${BASE_URL}/latest?base=CLP&symbols=USD&api_key=${ACCESS_KEY}`;
      const response = await axios.get(url);
      if (response.data && response.data.rates && response.data.rates.USD) {
        return response.data.rates.USD;
      }
      throw new Error('Respuesta inválida de ExchangeRate.host');
    } catch (error) {
      logger.error('Error obteniendo tasa CLP/USD:', error.message);
      throw error;
    }
  }
}

module.exports = new ExchangeRateHostService();
