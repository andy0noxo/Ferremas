const nodemailer = require('nodemailer');
const server = require('../config/server.config');
const logger = require('../middlewares/logger');
const path = require('path');
const fs = require('fs').promises;
const db = require('../models');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: server.emailHost,
      port: server.emailPort,
      secure: true,
      auth: {
        user: server.emailUser,
        pass: server.emailPassword
      }
    });
  }

  async loadTemplate(templateName, replacements) {
    try {
      const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
      let html = await fs.readFile(templatePath, 'utf8');
      
      Object.entries(replacements).forEach(([key, value]) => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      
      return html;
    } catch (error) {
      logger.error(`Error cargando plantilla ${templateName}:`, error);
      throw new Error('Error al cargar plantilla de email');
    }
  }

  async sendOrderConfirmation(email, pedidoId) {
    try {
      // Fetch order, details, and product info
      const pedido = await db.Pedido.findByPk(pedidoId, {
        include: [
          { model: db.DetallePedido, as: 'detalles', include: [{ model: db.Producto, as: 'producto' }] }
        ]
      });
      if (!pedido) throw new Error('Pedido no encontrado');
      // Build product rows HTML and calculate total
      let totalPedido = 0;
      let productosHtml = '';
      pedido.detalles.forEach(det => {
        const nombre = det.producto ? det.producto.nombre : 'Producto';
        const cantidad = det.cantidad;
        const precio = det.precio_unitario;
        const total = cantidad * precio;
        totalPedido += total;
        productosHtml += `<tr>` +
          `<td>${nombre}</td>` +
          `<td>${cantidad}</td>` +
          `<td>$${precio}</td>` +
          `<td>$${total}</td>` +
        `</tr>`;
      });
      // Load template (ruta corregida)
      const templatePath = path.resolve(__dirname, '../../templates/email', 'order-confirmation.html');
      let html = await fs.readFile(templatePath, 'utf8');
      // Replace block {{#productos}}...{{/productos}}
      html = html.replace(/{{#productos}}([\s\S]*?){{\/productos}}/, productosHtml);
      // Replace other variables
      const replacements = {
        pedidoId,
        fecha: new Date().toLocaleDateString('es-CL'),
        totalPedido,
        anio: new Date().getFullYear()
      };
      Object.entries(replacements).forEach(([key, value]) => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      await this.transporter.sendMail({
        from: `"${server.emailFromName}" <${server.emailFromAddress}>`,
        to: email,
        subject: `Confirmación de Pedido #${pedidoId}`,
        html
      });
      logger.info(`Email de confirmación enviado a ${email}`);
    } catch (error) {
      logger.error('Error enviando email de confirmación:', error);
      throw error;
    }
  }

  async sendPasswordReset(email, resetToken) {
    try {
      const html = await this.loadTemplate('password-reset', {
        resetLink: `${server.frontendUrl}/reset-password?token=${resetToken}`
      });

      await this.transporter.sendMail({
        from: `"${server.emailFromName}" <${server.emailFromAddress}>`,
        to: email,
        subject: 'Restablecer contraseña - Ferremas',
        html
      });
      
      logger.info(`Email de restablecimiento enviado a ${email}`);
    } catch (error) {
      logger.error('Error enviando email de restablecimiento:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, nombre) {
    // Deshabilitado temporalmente para pruebas
    logger.info(`[TEST] Email de bienvenida simulado para ${email}`);
    return true;
  }
}

module.exports = new EmailService();