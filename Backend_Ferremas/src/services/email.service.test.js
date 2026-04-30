/**
 * Pruebas Unitarias - services/email.service.js
 * Servicio de envío de correos electrónicos
 */

const path = require('path');

// Mock de nodemailer
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

// Mock de logger
jest.mock('../middlewares/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

// Mock de models
jest.mock('../models', () => ({
  Pedido: {
    findByPk: jest.fn()
  }
}));

// Mock de fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

const fs = require('fs');

// Mock de server config
jest.mock('../config/server.config', () => ({
  emailHost: 'smtp.test.com',
  emailPort: 587,
  emailUser: 'test@test.com',
  emailPassword: 'password',
  emailFromName: 'Ferremas',
  emailFromAddress: 'noreply@ferremas.com',
  frontendUrl: 'http://localhost:3000'
}));

const db = require('../models');
const logger = require('../middlewares/logger');
const server = require('../config/server.config');

const emailService = require('./email.service');

describe('EmailService', () => {
  let emailServiceInstance;
  let mockSendMail;
  let mockTransporter;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
    mockTransporter = {
      sendMail: mockSendMail
    };

    nodemailer.createTransport.mockReturnValue(mockTransporter);
    // use exported instance and set its transporter for isolation
    emailServiceInstance = emailService;
    emailServiceInstance.transporter = mockTransporter;
  });

  // ========================================
  // Pruebas para constructor
  // ========================================
  describe('Constructor', () => {
    test('debe crear transporter con configuración correcta', () => {
      // re-require module in isolation to capture constructor behavior
      jest.resetModules();
      const isolatedNodemailer = require('nodemailer');
      isolatedNodemailer.createTransport.mockReturnValue(mockTransporter);
      const isolatedService = require('./email.service');

      expect(isolatedNodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: server.emailHost,
          port: server.emailPort,
          secure: true,
          auth: {
            user: server.emailUser,
            pass: server.emailPassword
          }
        })
      );
      // restore module for following tests
      jest.resetModules();
    });

    test('debe guardar transporter', () => {
      expect(emailServiceInstance.transporter).toBe(mockTransporter);
    });
  });

  // ========================================
  // Pruebas para loadTemplate
  // ========================================
  describe('loadTemplate', () => {
    test('debe cargar plantilla correctamente', async () => {
      const templateHtml = '<h1>{{title}}</h1><p>{{content}}</p>';
      fs.promises.readFile.mockResolvedValue(templateHtml);

      const replacements = {
        title: 'Test Title',
        content: 'Test Content'
      };

      const result = await emailService.loadTemplate('test-template', replacements);

      expect(result).toContain('Test Title');
      expect(result).toContain('Test Content');
    });

    test('debe reemplazar todos los placeholders', async () => {
      const templateHtml = '{{user}} - {{action}} - {{date}}';
      fs.promises.readFile.mockResolvedValue(templateHtml);

      const replacements = {
        user: 'Juan',
        action: 'Registrado',
        date: '2024-01-01'
      };

      const result = await emailService.loadTemplate('template', replacements);

      expect(result).toBe('Juan - Registrado - 2024-01-01');
    });

    test('debe manejar placeholders no reemplazados', async () => {
      const templateHtml = '{{replaced}} y {{notReplaced}}';
      fs.promises.readFile.mockResolvedValue(templateHtml);

      const replacements = { replaced: 'REEMPLAZADO' };

      const result = await emailService.loadTemplate('template', replacements);

      expect(result).toContain('REEMPLAZADO');
      expect(result).toContain('{{notReplaced}}');
    });

    test('debe construir ruta de plantilla correctamente', async () => {
      fs.promises.readFile.mockResolvedValue('<html></html>');

      await emailService.loadTemplate('password-reset', {});

      const callArgs = fs.promises.readFile.mock.calls[0][0];
      expect(callArgs).toContain('password-reset');
      expect(callArgs).toContain('templates');
      expect(callArgs).toContain('email');
    });

    test('debe rechazar si plantilla no existe', async () => {
      const error = new Error('ENOENT: no such file or directory');
      fs.promises.readFile.mockRejectedValue(error);

      await expect(
        emailService.loadTemplate('no-existe', {})
      ).rejects.toThrow('Error al cargar plantilla de email');

      expect(logger.error).toHaveBeenCalled();
    });

    test('debe manejar errores de lectura de archivo', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('Read error'));

      await expect(
        emailService.loadTemplate('template', {})
      ).rejects.toThrow();
    });

    test('debe ser case-sensitive en reemplazos', async () => {
      const templateHtml = '{{Variable}} vs {{variable}}';
      fs.promises.readFile.mockResolvedValue(templateHtml);

      const result = await emailService.loadTemplate('template', {
        Variable: 'MAYÚS',
        variable: 'minús'
      });

      expect(result).toBe('MAYÚS vs minús');
    });
  });

  // ========================================
  // Pruebas para sendOrderConfirmation
  // ========================================
  describe('sendOrderConfirmation', () => {
    test('debe enviar email de confirmación de pedido', async () => {
      const pedido = {
        id: 1,
        detalles: [
          {
            cantidad: 2,
            precio_unitario: 100,
            producto: { nombre: 'Martillo' }
          }
        ]
      };

      db.Pedido.findByPk.mockResolvedValue(pedido);
      fs.promises.readFile.mockResolvedValue('<html>{{pedidoId}}</html>');

      await emailService.sendOrderConfirmation('user@test.com', 1);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Confirmación de Pedido #1')
        })
      );
    });

    test('debe calcular total del pedido correctamente', async () => {
      const pedido = {
        id: 1,
        detalles: [
          { cantidad: 2, precio_unitario: 100, producto: { nombre: 'Item 1' } },
          { cantidad: 3, precio_unitario: 50, producto: { nombre: 'Item 2' } }
        ]
      };

      db.Pedido.findByPk.mockResolvedValue(pedido);
      fs.promises.readFile.mockResolvedValue('Total: {{totalPedido}}');

      await emailService.sendOrderConfirmation('test@test.com', 1);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('350') // (2*100) + (3*50)
        })
      );
    });

    test('debe incluir detalles del producto en email', async () => {
      const pedido = {
        id: 1,
        detalles: [
          { cantidad: 1, precio_unitario: 99.99, producto: { nombre: 'Taladro' } }
        ]
      };

      db.Pedido.findByPk.mockResolvedValue(pedido);
      fs.promises.readFile.mockResolvedValue('<table>{{#productos}}{{/productos}}</table>');

      await emailService.sendOrderConfirmation('test@test.com', 1);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Taladro')
        })
      );
    });

    test('debe manejar pedido no encontrado', async () => {
      db.Pedido.findByPk.mockResolvedValue(null);

      await expect(
        emailService.sendOrderConfirmation('test@test.com', 999)
      ).rejects.toThrow('Pedido no encontrado');
    });

    test('debe incluir información del remitente', async () => {
      const pedido = {
        id: 1,
        detalles: [{ cantidad: 1, precio_unitario: 100, producto: { nombre: 'Item' } }]
      };

      db.Pedido.findByPk.mockResolvedValue(pedido);
      fs.promises.readFile.mockResolvedValue('<html></html>');

      await emailService.sendOrderConfirmation('test@test.com', 1);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `"${server.emailFromName}" <${server.emailFromAddress}>`
        })
      );
    });

    test('debe loguear envío exitoso', async () => {
      const pedido = {
        id: 1,
        detalles: [{ cantidad: 1, precio_unitario: 100, producto: { nombre: 'Item' } }]
      };

      db.Pedido.findByPk.mockResolvedValue(pedido);
      fs.promises.readFile.mockResolvedValue('<html></html>');

      await emailService.sendOrderConfirmation('user@test.com', 1);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('user@test.com')
      );
    });

    test('debe loguear errores', async () => {
      db.Pedido.findByPk.mockRejectedValue(new Error('DB Error'));

      await expect(
        emailService.sendOrderConfirmation('test@test.com', 1)
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });

    test('debe manejar producto sin información', async () => {
      const pedido = {
        id: 1,
        detalles: [
          { cantidad: 1, precio_unitario: 100, producto: null }
        ]
      };

      db.Pedido.findByPk.mockResolvedValue(pedido);
      fs.promises.readFile.mockResolvedValue('<html>{{#productos}}{{/productos}}</html>');

      await emailService.sendOrderConfirmation('test@test.com', 1);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Producto')
        })
      );
    });
  });

  // ========================================
  // Pruebas para sendPasswordReset
  // ========================================
  describe('sendPasswordReset', () => {
    test('debe enviar email de reset de contraseña', async () => {
      const resetToken = 'token123456';
      const templateHtml = '<a href="{{resetLink}}">Reset</a>';

      fs.promises.readFile.mockResolvedValue(templateHtml);

      await emailService.sendPasswordReset('user@test.com', resetToken);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Restablecer contraseña')
        })
      );
    });

    test('debe incluir link de reset correcto', async () => {
      const resetToken = 'abc123xyz';
      const templateHtml = '{{resetLink}}';

      fs.promises.readFile.mockResolvedValue(templateHtml);

      await emailService.sendPasswordReset('test@test.com', resetToken);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(resetToken)
        })
      );
    });

    test('debe usar plantilla password-reset', async () => {
      fs.promises.readFile.mockResolvedValue('<html></html>');

      await emailService.sendPasswordReset('test@test.com', 'token');

      expect(fs.promises.readFile).toHaveBeenCalledWith(
        expect.stringContaining('password-reset'),
        expect.anything()
      );
    });

    test('debe incluir información del remitente', async () => {
      fs.promises.readFile.mockResolvedValue('<html></html>');

      await emailService.sendPasswordReset('test@test.com', 'token');

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `"${server.emailFromName}" <${server.emailFromAddress}>`
        })
      );
    });
  });

  // ========================================
  // Pruebas de Integración
  // ========================================
  describe('Email Service Integration', () => {
    test('debe manejar múltiples envíos consecutivos', async () => {
      fs.promises.readFile.mockResolvedValue('<html></html>');

      await emailService.sendPasswordReset('user1@test.com', 'token1');
      await emailService.sendPasswordReset('user2@test.com', 'token2');

      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    test('debe mantener transporter entre envíos', async () => {
      const initialTransporter = emailService.transporter;

      fs.promises.readFile.mockResolvedValue('<html></html>');
      await emailService.sendPasswordReset('test@test.com', 'token');

      expect(emailService.transporter).toBe(initialTransporter);
    });
  });
});
