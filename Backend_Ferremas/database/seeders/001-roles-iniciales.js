'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      { nombre: 'Administrador' },
      { nombre: 'Vendedor' },
      { nombre: 'Bodeguero' },
      { nombre: 'Contador' },
      { nombre: 'Cliente' }
    ];

    await queryInterface.bulkInsert('Rol', roles, {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rol', null, {});
  }
};