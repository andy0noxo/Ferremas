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

exports.informeVentasGenerico = async (req, res, next) => {
  try {
    const { sucursalId, anio, periodo } = req.query;
    if (!sucursalId || !anio || !periodo) {
      return res.status(400).json({ message: 'Debe indicar sucursalId, anio y periodo' });
    }
    
    let inicio, fin;
    if (periodo === 'anual') {
      inicio = new Date(anio, 0, 1);
      fin = new Date(parseInt(anio) + 1, 0, 1);
    } else if (periodo.startsWith('semestre')) {
      const sem = parseInt(periodo.split('-')[1]);
      inicio = new Date(anio, (sem - 1) * 6, 1);
      fin = new Date(anio, sem * 6, 1);
    } else if (periodo.startsWith('trimestre')) {
      const trim = parseInt(periodo.split('-')[1]);
      inicio = new Date(anio, (trim - 1) * 3, 1);
      fin = new Date(anio, trim * 3, 1);
    } else if (periodo.startsWith('mes')) {
      const m = parseInt(periodo.split('-')[1]);
      inicio = new Date(anio, m - 1, 1);
      fin = new Date(anio, m, 1);
    } else {
      return res.status(400).json({ message: 'Periodo no valido' });
    }

    const whereClause = {
      fecha_pedido: { [db.Sequelize.Op.gte]: inicio, [db.Sequelize.Op.lt]: fin },
      estado: { [db.Sequelize.Op.not]: 'rechazado' }
    };

    if (sucursalId !== 'todas') {
      whereClause.sucursal_retiro = sucursalId;
    }

    const ventas = await db.Pedido.findAll({
      where: whereClause,
      include: [
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] },
        { model: db.Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] },
        { model: db.Pago, as: 'pago' }, // Incluir información de pago
        { 
          model: db.DetallePedido, 
          as: 'detalles',
          include: [{ model: db.Producto, as: 'producto' }] // Incluir producto en los detalles
        }
      ]
    });
    
    // Calcular métricas
    const totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
    
    // Top Sucursales (solo si se seleccionan todas)
    let topSucursales = [];
    if (sucursalId === 'todas') {
      const sucursalesMap = {};
      ventas.forEach(v => {
        const sid = v.sucursal_retiro || 'despacho';
        const snombre = v.sucursal ? v.sucursal.nombre : (v.direccion_envio ? 'Despacho a Domicilio' : 'Sucursal Desconocida');
        
        if (!sucursalesMap[sid]) {
          sucursalesMap[sid] = { nombre: snombre, cantidad: 0, total: 0 };
        }
        sucursalesMap[sid].cantidad++;
        sucursalesMap[sid].total += v.total;
      });
      
      topSucursales = Object.values(sucursalesMap)
        .sort((a, b) => b.total - a.total);
    }

    // Desglose de métodos de pago
    const metodosPago = {};
    ventas.forEach(v => {
      const metodo = v.pago ? v.pago.metodo : 'Desconocido';
      if (!metodosPago[metodo]) metodosPago[metodo] = { cantidad: 0, total: 0 };
      metodosPago[metodo].cantidad++;
      metodosPago[metodo].total += v.total;
    });

    // Productos más vendidos
    const productosVendidos = {};
    ventas.forEach(v => {
      if (v.detalles) {
        v.detalles.forEach(d => {
          const pid = d.producto ? d.producto.id : Math.random().toString(36).substr(2, 9); // Fallback ID
          const pnombre = d.producto ? d.producto.nombre : 'Producto Desconocido';
          
          if (!productosVendidos[pid]) {
            productosVendidos[pid] = { 
              nombre: pnombre, 
              cantidad: 0, 
              total: 0 
            };
          }
          productosVendidos[pid].cantidad += d.cantidad;
          productosVendidos[pid].total += (d.cantidad * d.precio_unitario);
        });
      }
    });
    
    // Convertir a array y ordenar
    const topProductos = Object.values(productosVendidos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Top 5


    // Get sucursal info even if empty
    let sucursalInfo;
    if (sucursalId === 'todas') {
      sucursalInfo = { id: 'todas', nombre: 'Todas las Sucursales' };
    } else {
      sucursalInfo = await db.Sucursal.findByPk(sucursalId, { attributes: ['id', 'nombre'] });
    }

    res.json({
      sucursal: sucursalInfo,
      anio,
      periodo,
      totalVentas,
      cantidadPedidos: ventas.length,
      pedidos: ventas,
      metricas: {
        metodosPago,
        topProductos,
        topSucursales
      }
    });
  } catch (error) {
    next(error);
  }
};
