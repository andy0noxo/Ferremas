const db = require('../models');

// Controlador básico para sucursales

exports.findAll = async (req, res, next) => {
  try {
    const sucursales = await db.Sucursal.findAll();
    res.json(sucursales);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const sucursal = await db.Sucursal.findByPk(req.params.id);
    if (!sucursal) return res.status(404).json({ message: 'Sucursal no encontrada' });
    res.json(sucursal);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const sucursal = await db.Sucursal.create(req.body);
    res.status(201).json(sucursal);
  } catch (error) {
    next(error);
  }
};

exports.getStockSucursal = async (req, res, next) => {
  try {
    const stock = await db.Stock.findAll({
      where: { sucursal_id: req.params.id },
      include: [db.Producto]
    });
    res.json(stock);
  } catch (error) {
    next(error);
  }
};
