module.exports = (sequelize, DataTypes) => {
  const Pago = sequelize.define('Pago', {
    monto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    metodo_pago: {
      type: DataTypes.ENUM('debito', 'credito', 'transferencia'),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'completado', 'fallido'),
      defaultValue: 'pendiente'
    },
    fecha_pago: DataTypes.DATE,
    transbank_token: {
      type: DataTypes.STRING(255),
      unique: true
    },
    respuesta_transbank: DataTypes.JSON
  }, {
    tableName: 'Pago',
    timestamps: false
  });

  Pago.associate = models => {
    Pago.belongsTo(models.Pedido, {
      foreignKey: 'pedido_id',
      as: 'pedido'
    });
  };

  return Pago;
};