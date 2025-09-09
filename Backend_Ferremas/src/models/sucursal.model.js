module.exports = (sequelize, DataTypes) => {
  const Sucursal = sequelize.define('Sucursal', {
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'Sucursal',
    timestamps: false
  });

  Sucursal.associate = models => {
    Sucursal.hasMany(models.Usuario, {
      foreignKey: 'sucursal_id',
      as: 'usuarios'
    });
    Sucursal.hasMany(models.Stock, {
      foreignKey: 'sucursal_id',
      as: 'stocks'
    });
    Sucursal.hasMany(models.Pedido, {
      foreignKey: 'sucursal_retiro',
      as: 'pedidos'
    });
  };

  return Sucursal;
};