const db = require('../models');
const DollarService = require('../services/dollar.service');
const ExchangeRateHostService = require('../services/exchangeRateHost.service');
const Producto = db.Producto;

const includeOptions = [
  { model: db.Marca, as: 'marca', attributes: ['id', 'nombre'] },
  { model: db.Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
  { 
    model: db.Stock,
    as: 'stocks',
    attributes: ['sucursal_id', 'cantidad'],
    include: { model: db.Sucursal, as: 'sucursal', attributes: ['nombre'] }
  }
];

exports.findAll = async (req, res, next) => {
  try {
    // Filtros desde query params
    const { search, categoria_id, sucursal_id } = req.query;
    // Construir condiciones de filtrado
    const where = {};
    if (search) {
      where[db.Sequelize.Op.or] = [
        { nombre: { [db.Sequelize.Op.like]: `%${search}%` } },
        { descripcion: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    if (categoria_id) {
      where.categoria_id = categoria_id;
    }
    // Consulta base
    let productos = await db.Producto.findAll({
      where,
      include: includeOptions,
      order: [['nombre', 'ASC']]
    });
    // Filtrar por sucursal si corresponde
    if (sucursal_id) {
      productos = productos.filter(p =>
        p.stocks.some(s => s.sucursal_id == sucursal_id && s.cantidad > 0)
      );
    }
    // Conversión CLP/USD
    let clpToUsdRate = 0;
    try {
      clpToUsdRate = await ExchangeRateHostService.getCurrentRate();
    } catch (e) {
      clpToUsdRate = await DollarService.getCurrentDollar();
    }
    const productsWithDollar = productos.map(producto => ({
      ...producto.toJSON(),
      precio_clp: producto.precio,
      precio_usd: clpToUsdRate ? (producto.precio / clpToUsdRate) : null
    }));
    res.json(productsWithDollar);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const producto = await db.Producto.create(req.body, { transaction });
    
    // Crear stock inicial en todas las sucursales
    const sucursales = await db.Sucursal.findAll();
    const stockPromises = sucursales.map(sucursal => 
      db.Stock.create({
        producto_id: producto.id,
        sucursal_id: sucursal.id,
        cantidad: 0
      }, { transaction })
    );

    await Promise.all(stockPromises);
    await transaction.commit();

    const createdProduct = await db.Producto.findByPk(producto.id, { include: includeOptions });
    res.status(201).json(createdProduct);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const stock = await db.Stock.findOne({
      where: {
        producto_id: req.params.productoId,
        sucursal_id: req.params.sucursalId
      },
      transaction
    });

    if (!stock) throw new Error('Registro de stock no encontrado');

    await stock.update({ cantidad: req.body.cantidad }, { transaction });
    await transaction.commit();

    const updatedStock = await db.Stock.findByPk(stock.id, {
      include: [
        { model: db.Producto, attributes: ['id', 'nombre'] },
        { model: db.Sucursal, attributes: ['id', 'nombre'] }
      ]
    });

    res.json(updatedStock);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.getStock = async (req, res, next) => {
  try {
    const stock = await db.Stock.findAll({
      where: { producto_id: req.params.id },
      include: [db.Sucursal]
    });
    res.json(stock);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const producto = await db.Producto.findByPk(req.params.id, {
      include: includeOptions
    });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    let clpToUsdRate = 0;
    try {
      clpToUsdRate = await ExchangeRateHostService.getCurrentRate();
    } catch (e) {
      clpToUsdRate = await DollarService.getCurrentDollar();
    }
    const productoWithDollar = {
      ...producto.toJSON(),
      precio_clp: producto.precio,
      precio_usd: clpToUsdRate ? (producto.precio / clpToUsdRate) : null
    };
    res.json(productoWithDollar);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const producto = await db.Producto.findByPk(req.params.id, { transaction });
    if (!producto) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    await producto.update({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      marca_id: req.body.marca_id,
      categoria_id: req.body.categoria_id
    }, { transaction });
    await transaction.commit();
    const updatedProduct = await db.Producto.findByPk(producto.id, { include: includeOptions });
    res.json(updatedProduct);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const producto = await db.Producto.findByPk(req.params.id, { transaction });
    if (!producto) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    // Eliminar primero los registros de stock asociados a este producto
    await db.Stock.destroy({ where: { producto_id: producto.id }, transaction });
    await producto.destroy({ transaction });
    await transaction.commit();
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};