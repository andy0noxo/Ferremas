const db = require('../models');

exports.findAll = async (req, res, next) => {
  try {
    const marcas = await db.Marca.findAll();
    res.json(marcas);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const marca = await db.Marca.findByPk(req.params.id);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    res.json(marca);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const marca = await db.Marca.create(req.body);
    res.status(201).json(marca);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const marca = await db.Marca.findByPk(req.params.id);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    await marca.update(req.body);
    res.json(marca);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const marca = await db.Marca.findByPk(req.params.id);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    await marca.destroy();
    res.json({ message: 'Marca eliminada' });
  } catch (error) {
    next(error);
  }
};
