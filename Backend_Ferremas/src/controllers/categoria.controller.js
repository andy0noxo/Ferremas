const db = require('../models');

exports.findAll = async (req, res, next) => {
  try {
    const categorias = await db.Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const categoria = await db.Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const categoria = await db.Categoria.create(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const categoria = await db.Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
    await categoria.update(req.body);
    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const categoria = await db.Categoria.findByPk(req.params.id);
    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
    await categoria.destroy();
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    next(error);
  }
};
