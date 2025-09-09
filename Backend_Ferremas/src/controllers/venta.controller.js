const db = require('../models');

exports.findAll = async (req, res, next) => {
  try {
    const ventas = await db.Pedido.findAll({
      include: [
        { model: db.Usuario, as: 'usuario' },
        { model: db.DetallePedido, as: 'detalles' },
        { model: db.Pago, as: 'pago' }
      ]
    });
    res.json(ventas);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const venta = await db.Pedido.findByPk(req.params.id, {
      include: [
        { model: db.Usuario, as: 'usuario' },
        { model: db.DetallePedido, as: 'detalles' },
        { model: db.Pago, as: 'pago' }
      ]
    });
    if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const venta = await db.Pedido.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });
    await venta.destroy();
    res.json({ message: 'Venta eliminada' });
  } catch (error) {
    next(error);
  }
};

// Informe de ventas mensual por sucursal
exports.informeMensualPorSucursal = async (req, res, next) => {
  console.log('===> [LOG] Entrando a /api/ventas/informe-mensual');
  try {
    const { sucursalId, anio, mes } = req.query;
    console.log('===> [LOG] Query params:', { sucursalId, anio, mes });
    console.log('===> [LOG] Usuario autenticado:', req.user ? req.user.rol : 'NO USER');
    if (!sucursalId || !anio || !mes) {
      console.log('===> [LOG] Faltan parámetros');
      return res.status(400).json({ message: 'Debe indicar sucursalId, anio y mes' });
    }
    const inicio = new Date(anio, mes - 1, 1);
    const fin = new Date(anio, mes, 1);
    const ventas = await db.Pedido.findAll({
      where: {
        sucursal_retiro: sucursalId,
        fecha_pedido: { [db.Sequelize.Op.gte]: inicio, [db.Sequelize.Op.lt]: fin },
        estado: { [db.Sequelize.Op.not]: 'rechazado' }
      },
      include: [
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
        { model: db.Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
      ]
    });
    // Sumar totales
    const totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
    console.log('===> [LOG] Ventas encontradas:', ventas.length);
    res.json({
      sucursal: ventas[0]?.sucursal || null,
      anio,
      mes,
      totalVentas,
      cantidadPedidos: ventas.length,
      pedidos: ventas
    });
  } catch (error) {
    console.log('===> [LOG] Error en informeMensualPorSucursal:', error);
    next(error);
  }
};
