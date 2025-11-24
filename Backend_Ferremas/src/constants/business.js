/**
 * Constantes de lógica de negocio
 * Define valores y límites utilizados en las reglas de negocio
 */

module.exports = {
  // Límites de paginación
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1
  },

  // Límites de archivos
  FILE_LIMITS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword']
  },

  // Estados de pedidos
  ORDER_STATUS: {
    PENDING: 'pendiente',
    APPROVED: 'aprobado',
    REJECTED: 'rechazado',
    PREPARED: 'preparado',
    SHIPPED: 'despachado',
    DELIVERED: 'entregado',
    CANCELLED: 'cancelado'
  },

  // Estados de pagos
  PAYMENT_STATUS: {
    PENDING: 'pendiente',
    COMPLETED: 'completado',
    FAILED: 'fallido',
    REFUNDED: 'reembolsado'
  },

  // Métodos de pago
  PAYMENT_METHODS: {
    DEBIT: 'debito',
    CREDIT: 'credito',
    TRANSFER: 'transferencia',
    CASH: 'efectivo'
  },

  // Límites de stock
  STOCK: {
    MIN_STOCK_ALERT: 5,
    MAX_STOCK_LIMIT: 10000,
    DEFAULT_STOCK: 0
  },

  // Configuración de precios
  PRICING: {
    MIN_PRICE: 1,
    MAX_PRICE: 9999999, // 99,999.99 en centavos
    CURRENCY: 'CLP'
  },

  // Límites de texto
  TEXT_LIMITS: {
    SHORT_TEXT: 100,
    MEDIUM_TEXT: 255,
    LONG_TEXT: 1000,
    DESCRIPTION: 2000
  },

  // Configuración de sesiones
  SESSION: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
    SESSION_DURATION: 8 * 60 * 60 * 1000 // 8 horas
  }
};