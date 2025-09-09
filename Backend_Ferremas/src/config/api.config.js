module.exports = {
  transbank: {
    url: process.env.TRANSBANK_URL || 'https://webpay3gint.transbank.cl',
    apiKey: process.env.TRANSBANK_API_KEY,
    commerceCode: process.env.TRANSBANK_COMMERCE_CODE,
    returnUrl: process.env.TRANSBANK_RETURN_URL,
    environment: process.env.TRANSBANK_ENVIRONMENT || 'TEST'
  },
  dolar: {
    url: process.env.DOLAR_API_URL || 'https://mindicador.cl/api/dolar',
    updateInterval: process.env.DOLAR_UPDATE_INTERVAL || 3600000, // 1 hora
    maxRetries: 3
  }
};