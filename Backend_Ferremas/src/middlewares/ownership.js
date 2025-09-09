const db = require('../models');
const ROLES = require('../config/roles.config');

const checkResourceOwnership = (modelName, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await db[modelName].findByPk(req.params[idParam], {
        include: [db.Usuario]
      });

      if (!resource) {
        return res.status(404).json({ message: 'Recurso no encontrado' });
      }

      // Permitir administradores
      if (req.user.rol === ROLES.ADMIN) return next();

      // Verificar propiedad
      if (resource.Usuario?.id !== req.user.id) {
        return res.status(403).json({ 
          message: 'No tienes permiso para este recurso' 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = checkResourceOwnership;