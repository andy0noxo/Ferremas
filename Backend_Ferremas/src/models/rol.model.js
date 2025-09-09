module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isIn: [['Administrador', 'Vendedor', 'Bodeguero', 'Contador', 'Cliente']]
      }
    }
  }, {
    tableName: 'Rol',
    timestamps: false
  });

  Rol.associate = models => {
    Rol.hasMany(models.Usuario, {
      foreignKey: 'rol_id',
      as: 'usuarios'
    });
  };

  return Rol;
};