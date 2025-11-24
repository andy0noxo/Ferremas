/**
 * Utilidades para manejo de fechas
 * Funciones reutilizables para formateo y manipulación de fechas
 */

const moment = require('moment');

// Configurar locale en español
moment.locale('es');

/**
 * Formatea fecha a formato legible en español
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado
 * @returns {string} Fecha formateada
 */
const formatDate = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return null;
  return moment(date).format(format);
};

/**
 * Formatea fecha para mostrar de forma relativa (ej: "hace 2 horas")
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha relativa
 */
const formatRelativeDate = (date) => {
  if (!date) return null;
  return moment(date).fromNow();
};

/**
 * Obtiene el inicio del día para una fecha
 * @param {Date|string} date - Fecha de referencia
 * @returns {Date} Fecha al inicio del día
 */
const startOfDay = (date = new Date()) => {
  return moment(date).startOf('day').toDate();
};

/**
 * Obtiene el fin del día para una fecha
 * @param {Date|string} date - Fecha de referencia
 * @returns {Date} Fecha al final del día
 */
const endOfDay = (date = new Date()) => {
  return moment(date).endOf('day').toDate();
};

/**
 * Obtiene el inicio del mes para una fecha
 * @param {Date|string} date - Fecha de referencia
 * @returns {Date} Fecha al inicio del mes
 */
const startOfMonth = (date = new Date()) => {
  return moment(date).startOf('month').toDate();
};

/**
 * Obtiene el fin del mes para una fecha
 * @param {Date|string} date - Fecha de referencia
 * @returns {Date} Fecha al final del mes
 */
const endOfMonth = (date = new Date()) => {
  return moment(date).endOf('month').toDate();
};

/**
 * Agrega tiempo a una fecha
 * @param {Date|string} date - Fecha base
 * @param {number} amount - Cantidad a agregar
 * @param {string} unit - Unidad de tiempo (days, hours, minutes, etc.)
 * @returns {Date} Nueva fecha
 */
const addTime = (date, amount, unit = 'days') => {
  return moment(date).add(amount, unit).toDate();
};

/**
 * Resta tiempo a una fecha
 * @param {Date|string} date - Fecha base
 * @param {number} amount - Cantidad a restar
 * @param {string} unit - Unidad de tiempo (days, hours, minutes, etc.)
 * @returns {Date} Nueva fecha
 */
const subtractTime = (date, amount, unit = 'days') => {
  return moment(date).subtract(amount, unit).toDate();
};

/**
 * Verifica si una fecha está entre dos fechas
 * @param {Date|string} date - Fecha a verificar
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {boolean} true si está en el rango
 */
const isBetween = (date, startDate, endDate) => {
  return moment(date).isBetween(startDate, endDate, null, '[]');
};

/**
 * Obtiene la diferencia en días entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
const daysDifference = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'days');
};

/**
 * Valida si una fecha es válida
 * @param {any} date - Fecha a validar
 * @returns {boolean} true si es válida
 */
const isValidDate = (date) => {
  return moment(date).isValid();
};

/**
 * Convierte fecha a timestamp Unix
 * @param {Date|string} date - Fecha a convertir
 * @returns {number} Timestamp Unix
 */
const toUnixTimestamp = (date = new Date()) => {
  return moment(date).unix();
};

/**
 * Convierte timestamp Unix a fecha
 * @param {number} timestamp - Timestamp Unix
 * @returns {Date} Fecha
 */
const fromUnixTimestamp = (timestamp) => {
  return moment.unix(timestamp).toDate();
};

module.exports = {
  formatDate,
  formatRelativeDate,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addTime,
  subtractTime,
  isBetween,
  daysDifference,
  isValidDate,
  toUnixTimestamp,
  fromUnixTimestamp
};