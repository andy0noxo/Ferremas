const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    define: dbConfig.define,
    logging: dbConfig.logging
  }
);

const db = {
  Sequelize,
  sequelize,
  Rol: require('./rol.model')(sequelize, Sequelize),
  Sucursal: require('./sucursal.model')(sequelize, Sequelize),
  Usuario: require('./usuario.model')(sequelize, Sequelize),
  Marca: require('./marca.model')(sequelize, Sequelize),
  Categoria: require('./categoria.model')(sequelize, Sequelize),
  Producto: require('./producto.model')(sequelize, Sequelize),
  Stock: require('./stock.model')(sequelize, Sequelize),
  Pedido: require('./pedido.model')(sequelize, Sequelize),
  DetallePedido: require('./detallePedido.model')(sequelize, Sequelize),
  Pago: require('./pago.model')(sequelize, Sequelize)
};

Object.values(db).forEach(model => {
  if (model?.associate) {
    model.associate(db);
  }
});

module.exports = db;