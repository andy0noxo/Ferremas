const db = require('../models');
const ROLES = require('../config/roles.config');

exports.actualizarStock = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const stock = await db.Stock.findOne({
      where: {
        producto_id: req.body.producto_id,
        sucursal_id: req.body.sucursal_id
      },
      transaction: t
    });

    if (!stock) {
      await t.rollback();
      return res.status(404).json({ message: "Registro de stock no encontrado" });
    }

    await stock.update({ cantidad: req.body.cantidad }, { transaction: t });
    await t.commit();
    
    res.json({ message: "Stock actualizado exitosamente" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.obtenerStockSucursal = async (req, res) => {
  try {
    const stock = await db.Stock.findAll({
      where: { sucursal_id: req.params.sucursalId },
      include: [{
        model: db.Producto,
        include: [db.Marca, db.Categoria]
      }]
    });
    
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todo el stock general (para GET /api/stock)
exports.obtenerStockGeneral = async (req, res) => {
  try {
    const stock = await db.Stock.findAll({
      include: [
        { model: db.Producto, as: 'producto' },
        { model: db.Sucursal, as: 'sucursal' }
      ]
    });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};