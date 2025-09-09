const axios = require('axios');
const { dolar } = require('../config/api.config');
const logger = require('../middlewares/logger');
const db = require('../models');

class DollarService {
  constructor() {
    this.cache = {
      valor: null,
      lastUpdate: null
    };
  }

  async getCurrentDollar() {
    try {
      if (this.isCacheValid()) {
        logger.debug('Usando valor cacheado del dólar');
        return this.cache.valor;
      }

      const response = await axios.get(dolar.url);
      const valor = response.data.serie[0].valor;
      
      this.updateCache(valor);
      await this.saveToDatabase(valor);
      
      logger.info(`Valor actualizado del dólar: $${valor}`);
      return valor;
    } catch (error) {
      logger.error('Error obteniendo valor del dólar:', error.message);
      return this.getLastSavedValue();
    }
  }

  async getLastSavedValue() {
    try {
      const registro = await db.ValorDolar.findOne({
        order: [['fecha', 'DESC']]
      });
      
      if (registro) {
        this.updateCache(registro.valor);
        return registro.valor;
      }
      return this.cache.valor || 800; // Valor por defecto
    } catch (error) {
      logger.error('Error obteniendo último valor guardado:', error.message);
      return 800;
    }
  }

  async saveToDatabase(valor) {
    try {
      await db.ValorDolar.create({
        valor,
        fecha: new Date()
      });
    } catch (error) {
      logger.error('Error guardando valor del dólar:', error.message);
    }
  }

  isCacheValid() {
    return this.cache.lastUpdate && 
      (Date.now() - this.cache.lastUpdate) < dolar.updateInterval;
  }

  updateCache(valor) {
    this.cache = {
      valor,
      lastUpdate: Date.now()
    };
  }
}

module.exports = new DollarService();