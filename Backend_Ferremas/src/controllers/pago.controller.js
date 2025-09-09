const db = require('../models');
const TransbankService = require('../services/transbank.service');
const logger = require('../middlewares/logger');
const ROLES = require('../config/roles.config');

exports.procesarPago = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Validar y obtener el pedido
    const pedido = await db.Pedido.findByPk(req.body.pedido_id, {
      include: [
        { 
          model: db.DetallePedido,
          include: [db.Producto]
        },
        db.Usuario
      ],
      transaction
    });

    if (!pedido) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar permisos
    if (pedido.usuario_id !== req.user.id && req.user.rol !== ROLES.ADMIN) {
      await transaction.rollback();
      return res.status(403).json({ message: 'No autorizado para este pedido' });
    }

    // Calcular monto total
    const montoTotal = pedido.DetallePedidos.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.precio_unitario);
    }, 0);

    // Crear transacción en Transbank
    const transaccionTBK = await TransbankService.createTransaction({
      buy_order: pedido.id.toString(),
      session_id: pedido.usuario_id.toString(),
      amount: montoTotal,
      return_url: process.env.TRANSBANK_RETURN_URL
    });

    // Registrar pago en la base de datos
    const pago = await db.Pago.create({
      pedido_id: pedido.id,
      monto: montoTotal,
      metodo_pago: pedido.metodo_pago,
      estado: 'pendiente',
      transbank_token: transaccionTBK.token
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      url_pago: transaccionTBK.url,
      token: transaccionTBK.token,
      pago_id: pago.id
    });

  } catch (error) {
    await transaction.rollback();
    logger.error(`Error procesando pago: ${error.message}`);
    next(error);
  }
};

exports.confirmarPago = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Validar datos recibidos de Transbank
    const { token_ws } = req.body;
    if (!token_ws) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Token requerido' });
    }

    // Obtener y validar pago
    const pago = await db.Pago.findOne({
      where: { transbank_token: token_ws },
      include: [db.Pedido],
      transaction
    });

    if (!pago) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Confirmar transacción con Transbank
    const resultadoTBK = await TransbankService.commitTransaction(token_ws);
    
    // Actualizar estado del pago
    const nuevoEstado = resultadoTBK.status === 'AUTHORIZED' ? 'completado' : 'fallido';
    await pago.update({
      estado: nuevoEstado,
      respuesta_transbank: JSON.stringify(resultadoTBK),
      fecha_pago: new Date()
    }, { transaction });

    // Actualizar estado del pedido si es exitoso
    if (nuevoEstado === 'completado') {
      await db.Pedido.update(
        { estado: 'preparado' },
        { where: { id: pago.pedido_id }, transaction }
      );
    }

    await transaction.commit();

    res.json({
      estado: nuevoEstado,
      detalle: resultadoTBK,
      pedido_id: pago.pedido_id
    });

  } catch (error) {
    await transaction.rollback();
    logger.error(`Error confirmando pago: ${error.message}`);
    next(error);
  }
};

exports.obtenerEstadoPago = async (req, res, next) => {
  try {
    const pago = await db.Pago.findOne({
      where: { pedido_id: req.params.pedido_id },
      include: [{
        model: db.Pedido,
        include: [db.Usuario]
      }]
    });

    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Verificar permisos
    if (pago.Pedido.usuario_id !== req.user.id && req.user.rol !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json({
      estado: pago.estado,
      monto: pago.monto,
      fecha_pago: pago.fecha_pago,
      metodo_pago: pago.metodo_pago
    });

  } catch (error) {
    logger.error(`Error obteniendo estado de pago: ${error.message}`);
    next(error);
  }
};