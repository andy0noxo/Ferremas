'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash de la contraseña Admin.123456789
    const hashedPassword = await bcrypt.hash('Admin.123456789', 8);

    const usuarios = [
      {
        nombre: 'Administrador Sistema',
        email: 'admin@ferremas.cl',
        contrasena: hashedPassword,
        rut: '12345678-9',
        rol_id: 1, // Administrador
        sucursal_id: 1, // Santiago Centro
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Andrés Salcedo',
        email: 'an.salcedo@duocuc.cl',
        contrasena: hashedPassword,
        rut: '19134035-3',
        rol_id: 1, // Administrador
        sucursal_id: 1, // Santiago Centro
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Usuario', usuarios, {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuario', {
      email: ['admin@ferremas.cl', 'an.salcedo@duocuc.cl']
    });
  }
};