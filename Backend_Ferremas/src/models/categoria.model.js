module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    }
  }, {
    tableName: 'Categoria',
    timestamps: false
  });

  Categoria.associate = models => {
    Categoria.hasMany(models.Producto, {
      foreignKey: 'categoria_id',
      as: 'productos'
    });
  };

  return Categoria;
};