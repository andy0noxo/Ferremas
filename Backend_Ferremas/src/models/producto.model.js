module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100]
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 500]
      }
    },
    precio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    }
  }, {
    tableName: 'Producto',
    timestamps: false
  });

  Producto.associate = models => {
    Producto.belongsTo(models.Marca, {
      foreignKey: 'marca_id',
      as: 'marca'
    });
    Producto.belongsTo(models.Categoria, {
      foreignKey: 'categoria_id',
      as: 'categoria'
    });
    Producto.hasMany(models.Stock, {
      foreignKey: 'producto_id',
      as: 'stocks'
    });
    Producto.hasMany(models.DetallePedido, {
      foreignKey: 'producto_id',
      as: 'detalles_pedidos'
    });
  };

  return Producto;
};