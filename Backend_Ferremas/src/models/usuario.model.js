const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    contrasena: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[0-9]{7,8}-[0-9kK]$/
      }
    }
  }, {
    tableName: 'Usuario',
    timestamps: false,
    hooks: {
      beforeCreate: async usuario => {
        if (usuario.contrasena) {
          const salt = await bcrypt.genSalt(8);
          usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
        }
      }
    }
  });

  Usuario.associate = models => {
    Usuario.belongsTo(models.Rol, {
      foreignKey: 'rol_id',
      as: 'rol'
    });
    Usuario.belongsTo(models.Sucursal, {
      foreignKey: 'sucursal_id',
      as: 'sucursal'
    });
    Usuario.hasMany(models.Pedido, {
      foreignKey: 'usuario_id',
      as: 'pedidos'
    });
  };

  Usuario.prototype.validarContrasena = async function (contrasena) {
    return await bcrypt.compare(contrasena, this.contrasena);
  };

  return Usuario;
};