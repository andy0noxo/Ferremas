const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/auth.config');
const ROLES = require('../config/roles.config');
const EmailService = require('../services/email.service');

const handleAuthResponse = (user, res) => {
  // Soporta tanto user.rol como user.Rol (por compatibilidad)
  const rol = user.rol?.nombre || user.Rol?.nombre || null;
  const sucursal = user.sucursal || user.Sucursal || null;
  const token = jwt.sign(
    { id: user.id, rol },
    jwtConfig.secret,
    { algorithm: jwtConfig.algorithm, expiresIn: jwtConfig.expiration }
  );

  return res.json({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol,
    sucursal,
    token
  });
};

exports.login = async (req, res, next) => {
  console.log('POST /api/auth/login llamada', { body: req.body }); // <-- LOG
  try {
    const user = await db.Usuario.findOne({
      where: { email: req.body.email },
      include: [
        { model: db.Rol, as: 'rol', attributes: ['nombre'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] }
      ]
    });

    if (!user || !bcrypt.compareSync(req.body.contrasena, user.contrasena)) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    handleAuthResponse(user, res);
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  console.log('POST /api/auth/registro llamada', { body: req.body }); // <-- LOG
  const transaction = await db.sequelize.transaction();
  try {
    // Determinar el nombre del rol
    let rolNombre = req.body.rol ? req.body.rol : ROLES.CLIENTE;
    // Buscar el rol por nombre exacto
    const rol = await db.Rol.findOne({ where: { nombre: rolNombre } });
    if (!rol) {
      throw new Error('Rol especificado no existe. Usa uno de: Administrador, Vendedor, Bodeguero, Contador, Cliente');
    }

    const user = await db.Usuario.create({
      nombre: req.body.nombre,
      email: req.body.email,
      contrasena: req.body.contrasena, // El modelo hashea
      rut: req.body.rut,
      rol_id: rol.id
    }, { transaction });

    await EmailService.sendWelcomeEmail(user.email, user.nombre);
    await transaction.commit();

    // Recargar el usuario con las asociaciones necesarias para el token y la respuesta
    const userWithAssociations = await db.Usuario.findByPk(user.id, {
      include: [
        { model: db.Rol, as: 'rol', attributes: ['nombre'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] }
      ]
    });
    handleAuthResponse(userWithAssociations, res);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    next(error);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await db.Usuario.findByPk(req.user.id, {
      attributes: ['id', 'nombre', 'email', 'rut'],
      include: [
        { model: db.Rol, attributes: ['nombre'] },
        { model: db.Sucursal, attributes: ['id', 'nombre'] }
      ]
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Dummy endpoint para GET /api/auth/registro
exports.registroDummy = (req, res) => {
  res.json({
    message: 'Endpoint dummy para registro. Usa POST para registrar usuarios.'
  });
};