'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rol', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      }
    });

    // Agregar índice para optimizar búsquedas
    await queryInterface.addIndex('Rol', ['nombre']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rol');
  }
};