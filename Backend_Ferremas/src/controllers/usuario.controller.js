const db = require('../models');
const bcrypt = require('bcryptjs');
const ROLES = require('../config/roles.config');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await db.Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rut'],
      include: [
        { model: db.Rol, as: 'rol', attributes: ['nombre'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['nombre'] }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const user = await db.Usuario.findByPk(req.params.id, {
      attributes: ['id', 'nombre', 'email', 'rut'],
      include: [
        { model: db.Rol, as: 'rol', attributes: ['nombre'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['nombre'] }
      ]
    });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await db.Usuario.findByPk(req.params.id, { transaction });
    
    if (!user) throw new Error('Usuario no encontrado');
    
    const updates = {
      nombre: req.body.nombre || user.nombre,
      email: req.body.email || user.email,
      sucursal_id: req.body.sucursal_id || user.sucursal_id,
      rut: req.body.rut || user.rut
    };

    if (req.body.contrasena) {
      updates.contrasena = bcrypt.hashSync(req.body.contrasena, 8);
    }

    await user.update(updates, { transaction });
    
    if (req.body.rol_id) {
      const newRole = await db.Rol.findByPk(req.body.rol_id, { transaction });
      if (!newRole) throw new Error('Rol no válido');
      await user.setRol(newRole, { transaction });
    }

    await transaction.commit();

    const updatedUser = await db.Usuario.findByPk(user.id, {
      attributes: ['id', 'nombre', 'email', 'rut'],
      include: [
        { model: db.Rol, as: 'rol', attributes: ['nombre'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['nombre'] }
      ]
    });

    res.json(updatedUser);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

exports.getUserSales = async (req, res, next) => {
  try {
    const sales = await db.Pedido.findAll({
      where: { usuario_id: req.params.id },
      include: [
        {
          model: db.DetallePedido,
          as: 'detalles', // Usa el alias correcto definido en el modelo Pedido
          include: [{ model: db.Producto, as: 'producto', include: [{ model: db.Marca, as: 'marca' }] }]
        }
      ]
    });

    res.json(sales);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await db.Usuario.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};