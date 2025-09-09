module.exports = (sequelize, DataTypes) => {
  const Marca = sequelize.define('Marca', {
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    }
  }, {
    tableName: 'Marca',
    timestamps: false
  });

  Marca.associate = models => {
    Marca.hasMany(models.Producto, {
      foreignKey: 'marca_id',
      as: 'productos'
    });
  };

  return Marca;
};