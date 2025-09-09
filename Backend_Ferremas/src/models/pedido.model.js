module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    fecha_pedido: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.ENUM(
        'pendiente',
        'aprobado',
        'rechazado',
        'preparado',
        'despachado',
        'entregado'
      ),
      defaultValue: 'pendiente'
    },
    metodo_pago: {
      type: DataTypes.ENUM('debito', 'credito', 'transferencia')
    },
    direccion_envio: DataTypes.TEXT,
    total: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Pedido',
    timestamps: false
  });

  Pedido.associate = models => {
    Pedido.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
    Pedido.belongsTo(models.Sucursal, {
      foreignKey: 'sucursal_retiro',
      as: 'sucursal'
    });
    Pedido.hasMany(models.DetallePedido, {
      foreignKey: 'pedido_id',
      as: 'detalles'
    });
    Pedido.hasOne(models.Pago, {
      foreignKey: 'pedido_id',
      as: 'pago'
    });
  };

  return Pedido;
};