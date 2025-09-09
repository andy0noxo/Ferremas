const db = require('../models');
const ROLES = require('../config/roles.config');

exports.findAll = async (req, res, next) => {
  try {
    const roles = await db.Rol.findAll();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const rol = await db.Rol.findByPk(req.params.id);
    if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json(rol);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.user || req.user.rol !== ROLES.ADMIN) return res.status(403).json({ message: 'Solo admin puede crear roles' });
    const rol = await db.Rol.create(req.body);
    res.status(201).json(rol);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!req.user || req.user.rol !== ROLES.ADMIN) return res.status(403).json({ message: 'Solo admin puede editar roles' });
    const rol = await db.Rol.findByPk(req.params.id);
    if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
    await rol.update(req.body);
    res.json(rol);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    if (!req.user || req.user.rol !== ROLES.ADMIN) return res.status(403).json({ message: 'Solo admin puede eliminar roles' });
    const rol = await db.Rol.findByPk(req.params.id);
    if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
    await rol.destroy();
    res.json({ message: 'Rol eliminado' });
  } catch (error) {
    next(error);
  }
};
