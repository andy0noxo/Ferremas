const db = require('../models');
const TransbankService = require('../services/transbank.service');
const EmailService = require('../services/email.service');
const CartService = require('../services/cart.service');
const logger = require('../middlewares/logger');
const ExchangeRateHostService = require('../services/exchangeRateHost.service');

const processPayment = async (pedido, user) => {
  // Modo mock: si está activado, simula un pago exitoso
  if (process.env.MOCK_PAYMENT === 'true') {
    // Simula la respuesta de Transbank
    const mockToken = 'MOCK_TOKEN_' + pedido.id;
    await db.Pago.create({
      pedido_id: pedido.id,
      monto: pedido.total,
      metodo_pago: pedido.metodo_pago,
      transbank_token: mockToken,
      estado: 'completado',
      respuesta_transbank: JSON.stringify({ status: 'AUTHORIZED', mock: true }),
      fecha_pago: new Date()
    });
    return {
      token: mockToken,
      url: '/mock-pago-exitoso/' + pedido.id // Puedes ajustar la URL para el frontend
    };
  }

  const transactionData = {
    buy_order: pedido.id.toString(),
    session_id: user.id.toString(),
    amount: pedido.total,
    return_url: process.env.TRANSBANK_RETURN_URL
  };

  const transbankResponse = await TransbankService.createTransaction(transactionData);
  
  await db.Pago.create({
    pedido_id: pedido.id,
    monto: pedido.total,
    metodo_pago: pedido.metodo_pago,
    transbank_token: transbankResponse.token
  });

  return transbankResponse;
};

exports.createPedido = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Permitir sucursalId o sucursal_id según el body
    const sucursalId = req.body.sucursalId || req.body.sucursal_id;
    if (!sucursalId) throw new Error('Debe especificar sucursalId');
    const { items, total } = await CartService.calculateCartTotal(req.body.productos, sucursalId);

    if (!items.every(item => item.stockValido)) {
      throw new Error('Stock insuficiente para algunos productos');
    }

    // Obtener tasa de cambio CLP->USD
    let clpToUsdRate = 0;
    try {
      clpToUsdRate = await ExchangeRateHostService.getCurrentRate();
    } catch (e) {
      clpToUsdRate = 0;
    }

    const pedido = await db.Pedido.create({
      usuario_id: req.user.id,
      sucursal_retiro: sucursalId,
      direccion_envio: req.body.direccionEnvio || req.body.direccion_envio || null,
      metodo_pago: req.body.metodoPago || req.body.metodo_pago,
      total: total
    }, { transaction });

    const detalles = await db.DetallePedido.bulkCreate(
      items.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      })), { transaction }
    );

    const stockUpdates = items.map(item => 
      db.Stock.decrement('cantidad', {
        by: item.cantidad,
        where: { 
          producto_id: item.producto_id,
          sucursal_id: sucursalId
        },
        transaction
      })
    );

    await Promise.all(stockUpdates);
    await transaction.commit();

    let paymentResponse = null;
    try {
      paymentResponse = await processPayment(pedido, req.user);
      // Enviar email de confirmación en segundo plano
      EmailService.sendOrderConfirmation(req.user.email, pedido.id)
        .catch(e => logger.error('Error enviando email de confirmación (async):', e));
    } catch (pagoError) {
      // Si falla el pago, puedes revertir el pedido aquí si lo deseas
      return res.status(500).json({ message: 'Error al procesar el pago', detalle: pagoError.message });
    }

    res.status(201).json({
      pedido: {
        ...pedido.toJSON(),
        total_usd: clpToUsdRate ? (pedido.total * clpToUsdRate) : null
      },
      payment_url: paymentResponse.url,
      mock_payment: process.env.MOCK_PAYMENT === 'true' // Indica al frontend si es mock
    });

  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

exports.updateEstado = async (req, res, next) => {
  try {
    const pedido = await db.Pedido.findByPk(req.params.id, {
      include: [{ model: db.Usuario, as: 'usuario', attributes: ['email', 'id'] }]
    });

    if (!pedido) throw new Error('Pedido no encontrado');

    const userRole = req.user.rol;
    
    // Si es Cliente, validar que sea su pedido y solo pueda cancelar (estado 'rechazado')
    if (userRole === 'Cliente') {
      if (pedido.usuario_id !== req.user.id) {
        return res.status(403).json({ message: 'No autorizado para modificar este pedido.' });
      }
      if (req.body.estado !== 'rechazado') {
        return res.status(400).json({ message: 'Clientes solo pueden cancelar pedidos.' });
      }
      if (pedido.estado !== 'pendiente') {
         return res.status(400).json({ message: 'Solo se pueden cancelar pedidos pendientes.' });
      }
    }

    await pedido.update({ estado: req.body.estado });
    
    if (req.body.estado === 'preparado' && pedido.usuario) {
      await EmailService.sendReadyForPickup(pedido.usuario.email, pedido.id);
    }

    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los pedidos (GET /api/pedidos)
exports.obtenerPedidos = async (req, res, next) => {
  console.log('GET /api/pedidos llamada', {
    userId: req.user?.id,
    rol: req.user?.rol
  });
  try {
    const pedidos = await db.Pedido.findAll({
      include: [
        { model: db.Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
        { model: db.DetallePedido, as: 'detalles' },
        { model: db.Pago, as: 'pago' }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

// Obtener pedidos del usuario autenticado (GET /api/pedidos/usuario)
exports.obtenerPedidosUsuario = async (req, res, next) => {
  console.log('GET /api/pedidos/usuario llamada', {
    userId: req.user?.id,
    rol: req.user?.rol
  });
  try {
    const pedidos = await db.Pedido.findAll({
      where: { usuario_id: req.user.id },
      include: [
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
        { model: db.DetallePedido, as: 'detalles' },
        { model: db.Pago, as: 'pago' }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

// Obtener pedido por ID (GET /api/pedidos/:id)
exports.obtenerPedidoPorId = async (req, res, next) => {
  try {
    const pedido = await db.Pedido.findByPk(req.params.id, {
      include: [
        { model: db.Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
        { model: db.DetallePedido, as: 'detalles', include: [{ model: db.Producto, as: 'producto' }] },
        { model: db.Pago, as: 'pago' }
      ]
    });
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Enriquecer con Stock de Bodega
    const pedidoJSON = pedido.toJSON();
    if (pedido.sucursal_retiro && pedidoJSON.detalles) {
      for (const detalle of pedidoJSON.detalles) {
        const stock = await db.Stock.findOne({
          where: {
            producto_id: detalle.producto_id,
            sucursal_id: pedido.sucursal_retiro
          }
        });
        detalle.stock_bodega = stock ? stock.cantidad : 0;
      }
    }

    // Conversión CLP/USD
    let clpToUsdRate = 0;
    try {
      clpToUsdRate = await ExchangeRateHostService.getCurrentRate();
    } catch (e) {
      clpToUsdRate = 0;
    }

    if (pedidoJSON.detalles) {
      pedidoJSON.detalles = pedidoJSON.detalles.map(detalle => {
        // Asegúrate de que los valores sean números antes de multiplicar
        const precioUnitario = parseFloat(detalle.precio_unitario) || 0;
        const cantidad = parseInt(detalle.cantidad) || 0;
        const subtotal = precioUnitario * cantidad;
        
        return {
          ...detalle,
          subtotal: subtotal,
          precio_unitario_usd: clpToUsdRate ? (precioUnitario * clpToUsdRate) : null,
          subtotal_usd: clpToUsdRate ? (subtotal * clpToUsdRate) : null
          
        };
      });
    }

    // Devolvemos el objeto enriquecido (pedidoJSON)
    const totalPedido = parseFloat(pedido.total) || 0;
    
    const response = {
      ...pedidoJSON,
      total_usd: clpToUsdRate ? (totalPedido * clpToUsdRate) : null,
      clp_to_usd_rate: clpToUsdRate
    };
    
    if (pedido.direccion_envio) {
      const costoEnvio = 5000;
      response.costo_envio = costoEnvio;
      response.costo_envio_usd = clpToUsdRate ? (costoEnvio * clpToUsdRate) : null;
      
      const subtotalProductos = totalPedido - costoEnvio;
      response.subtotal_productos = subtotalProductos;
      response.subtotal_productos_usd = clpToUsdRate ? (subtotalProductos * clpToUsdRate) : null;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};