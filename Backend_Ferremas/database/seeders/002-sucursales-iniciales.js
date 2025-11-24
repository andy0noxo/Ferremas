'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sucursales = [
      {
        nombre: 'Sucursal Santiago Centro',
        direccion: 'Av. Libertador 1000, Santiago',
        telefono: '+56 2 2234 5678',
        email: 'santiago.centro@ferremas.cl',
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Sucursal Las Condes',
        direccion: 'Av. Apoquindo 3000, Las Condes',
        telefono: '+56 2 2345 6789',
        email: 'las.condes@ferremas.cl',
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Sucursal Maipú',
        direccion: 'Av. Pajaritos 1500, Maipú',
        telefono: '+56 2 2456 7890',
        email: 'maipu@ferremas.cl',
        activa: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Sucursal', sucursales, {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Sucursal', null, {});
  }
};