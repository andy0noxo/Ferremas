module.exports = (sequelize, DataTypes) => {
  const Stock = sequelize.define('Stock', {
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'Stock',
    timestamps: false,
    indexes: [{
      unique: true,
      fields: ['producto_id', 'sucursal_id']
    }]
  });

  Stock.associate = models => {
    Stock.belongsTo(models.Producto, {
      foreignKey: 'producto_id',
      as: 'producto'
    });
    Stock.belongsTo(models.Sucursal, {
      foreignKey: 'sucursal_id',
      as: 'sucursal'
    });
  };

  return Stock;
};