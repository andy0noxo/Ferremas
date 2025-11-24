/**
 * Mensajes de respuesta estándar
 * Centraliza todos los mensajes utilizados en la aplicación
 */

module.exports = {
  // Autenticación
  AUTH: {
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGIN_FAILED: 'Credenciales inválidas',
    REGISTER_SUCCESS: 'Usuario registrado exitosamente',
    REGISTER_FAILED: 'Error al registrar usuario',
    TOKEN_INVALID: 'Token inválido o expirado',
    TOKEN_REQUIRED: 'Token de autorización requerido',
    ACCESS_DENIED: 'Acceso denegado'
  },

  // Validación
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo es requerido',
    INVALID_EMAIL: 'Formato de email inválido',
    INVALID_RUT: 'Formato de RUT inválido',
    PASSWORD_WEAK: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos',
    EMAIL_EXISTS: 'Este email ya está registrado',
    RUT_EXISTS: 'Este RUT ya está registrado'
  },

  // CRUD Operaciones
  CRUD: {
    CREATE_SUCCESS: 'Recurso creado exitosamente',
    CREATE_ERROR: 'Error al crear el recurso',
    UPDATE_SUCCESS: 'Recurso actualizado exitosamente',
    UPDATE_ERROR: 'Error al actualizar el recurso',
    DELETE_SUCCESS: 'Recurso eliminado exitosamente',
    DELETE_ERROR: 'Error al eliminar el recurso',
    NOT_FOUND: 'Recurso no encontrado',
    FETCH_SUCCESS: 'Datos obtenidos exitosamente',
    FETCH_ERROR: 'Error al obtener los datos'
  },

  // Específicos del dominio
  PRODUCTS: {
    OUT_OF_STOCK: 'Producto sin stock disponible',
    INSUFFICIENT_STOCK: 'Stock insuficiente para la cantidad solicitada',
    STOCK_UPDATED: 'Stock actualizado correctamente'
  },

  ORDERS: {
    ORDER_PLACED: 'Pedido realizado exitosamente',
    ORDER_CANCELLED: 'Pedido cancelado',
    ORDER_CONFIRMED: 'Pedido confirmado',
    PAYMENT_REQUIRED: 'Pago requerido para procesar el pedido'
  },

  // Sistema
  SYSTEM: {
    SERVER_ERROR: 'Error interno del servidor',
    DATABASE_ERROR: 'Error de conexión a la base de datos',
    SERVICE_UNAVAILABLE: 'Servicio temporalmente no disponible'
  }
};