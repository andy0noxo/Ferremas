const jwt = require('jsonwebtoken');
const db = require('../models');
const { jwt: jwtConfig } = require('../config/auth.config');
const ROLES = require('../config/roles.config');
const logger = require('./logger');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Se requiere token de autenticación' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    const user = await db.Usuario.findByPk(decoded.id, {
      include: [
        { model: db.Rol, as: 'rol', attributes: ['nombre'] },
    { model: db.Sucursal, as: 'sucursal', attributes: ['id'] }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = {
      id: user.id,
      rol: user.rol?.nombre,
      sucursalId: user.sucursal?.id
    };

    next();
  } catch (error) {
    logger.error(`Error de autenticación: ${error.message}`);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.rol)) {
      logger.warn(`Intento de acceso no autorizado: Usuario ${req.user.id} - Rol ${req.user.rol}`);
      return res.status(403).json({
        message: `Requiere uno de estos roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
};