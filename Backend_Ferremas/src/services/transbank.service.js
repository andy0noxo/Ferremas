const axios = require('axios');
const { transbank } = require('../config/api.config');
const logger = require('../middlewares/logger');
const db = require('../models');

class TransbankService {
  constructor() {
    this.api = axios.create({
      baseURL: transbank.url,
      headers: {
        'Tbk-Api-Key-Id': transbank.commerceCode,
        'Tbk-Api-Key-Secret': transbank.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async createTransaction(transactionData) {
    try {
      const response = await this.api.post('/rswebpaytransaction/api/webpay/v1.2/transactions', {
        buy_order: transactionData.buy_order,
        session_id: transactionData.session_id,
        amount: transactionData.amount,
        return_url: transactionData.return_url
      });

      logger.info(`Transacción creada: ${transactionData.buy_order}`);
      return response.data;
    } catch (error) {
      logger.error('Error Transbank - Crear Transacción:', error.response?.data || error.message);
      throw new Error('Error al iniciar transacción con Webpay');
    }
  }

  async commitTransaction(token) {
    try {
      const response = await this.api.put(`/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`);
      logger.info(`Transacción confirmada: ${token}`);
      return response.data;
    } catch (error) {
      logger.error('Error Transbank - Confirmar Transacción:', error.response?.data || error.message);
      throw new Error('Error al confirmar transacción con Webpay');
    }
  }

  async handleWebhook(webhookData) {
    const transaction = await db.sequelize.transaction();
    try {
      const pago = await db.Pago.findOne({
        where: { transbank_token: webhookData.token },
        transaction
      });

      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      const resultado = await this.commitTransaction(webhookData.token);
      await pago.update({
        estado: resultado.status === 'AUTHORIZED' ? 'completado' : 'fallido',
        respuesta_transbank: resultado,
        fecha_pago: new Date()
      }, { transaction });

      await transaction.commit();
      return pago;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error procesando webhook: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new TransbankService();