#!/usr/bin/env node

/**
 * Setup Fixtures for JMeter Load Testing
 * 
 * This script:
 * 1. Connects to MySQL database
 * 2. Clears existing test data (users, products)
 * 3. Creates fresh test data reproducibly
 * 4. Exports data to CSV files for JMeter
 * 
 * Usage: node setup-fixtures.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env' });

// Configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'ferremas',
  password: process.env.DB_PASSWORD || 'ferremas123',
  database: process.env.DB_NAME || 'ferremas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const DATA_DIR = path.join(__dirname, '..', 'data');
const USUARIOS_CSV = path.join(DATA_DIR, 'usuarios.csv');
const PRODUCTOS_CSV = path.join(DATA_DIR, 'productos.csv');

console.log('📋 JMeter Test Fixtures Setup');
console.log('=' .repeat(50));
console.log(`Database: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
console.log(`Data Output: ${DATA_DIR}`);
console.log('=' .repeat(50));

async function setupFixtures() {
  let connection;

  try {
    // 1. Connect to database
    console.log('\n🔌 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ Connected successfully');

    // 2. Clear existing test data
    console.log('\n🗑️  Clearing existing test data...');
    await connection.execute('DELETE FROM ordenes WHERE id > 0');
    await connection.execute('DELETE FROM carrito WHERE id > 0');
    await connection.execute('DELETE FROM productos WHERE id > 0');
    await connection.execute('DELETE FROM usuarios WHERE id > 0');
    await connection.commit();
    console.log('✓ Data cleared');

    // 3. Create test users
    console.log('\n👥 Creating test users...');
    const bcryptjs = require('bcryptjs');
    const testUsers = [
      { email: 'admin@ferremas.cl', password: 'Admin123!', nombre: 'Admin User', rol: 'admin' },
      { email: 'user1@ferremas.cl', password: 'User1234!', nombre: 'Test User One', rol: 'cliente' },
      { email: 'user2@ferremas.cl', password: 'User2234!', nombre: 'Test User Two', rol: 'cliente' },
      { email: 'user3@ferremas.cl', password: 'User3234!', nombre: 'Test User Three', rol: 'cliente' },
      { email: 'user4@ferremas.cl', password: 'User4234!', nombre: 'Test User Four', rol: 'cliente' },
      { email: 'user5@ferremas.cl', password: 'User5234!', nombre: 'Test User Five', rol: 'cliente' },
      { email: 'user6@ferremas.cl', password: 'User6234!', nombre: 'Test User Six', rol: 'cliente' },
      { email: 'user7@ferremas.cl', password: 'User7234!', nombre: 'Test User Seven', rol: 'cliente' },
      { email: 'user8@ferremas.cl', password: 'User8234!', nombre: 'Test User Eight', rol: 'cliente' },
      { email: 'user9@ferremas.cl', password: 'User9234!', nombre: 'Test User Nine', rol: 'cliente' },
      { email: 'user10@ferremas.cl', password: 'User0234!', nombre: 'Test User Ten', rol: 'cliente' },
      { email: 'vendedor@ferremas.cl', password: 'Vendedor123!', nombre: 'Vendedor Test', rol: 'vendedor' },
    ];

    const usuariosData = [];
    for (const user of testUsers) {
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      const result = await connection.execute(
        'INSERT INTO usuarios (email, password, nombre, rol, fecha_creacion) VALUES (?, ?, ?, ?, NOW())',
        [user.email, hashedPassword, user.nombre, user.rol]
      );
      usuariosData.push({
        email: user.email,
        password: user.password,
        nombre: user.nombre,
        id: result[0].insertId,
      });
      console.log(`  ✓ ${user.email}`);
    }
    await connection.commit();
    console.log(`✓ ${testUsers.length} users created`);

    // 4. Create test products
    console.log('\n📦 Creating test products...');
    const testProducts = [
      { nombre: 'Martillo de Goma', categoria: 'Herramientas', precio: 15000, stock: 50, sku: 'MART001' },
      { nombre: 'Destornillador Set', categoria: 'Herramientas', precio: 25000, stock: 30, sku: 'DEST001' },
      { nombre: 'Taladro Eléctrico', categoria: 'Máquinas', precio: 85000, stock: 10, sku: 'TAL001' },
      { nombre: 'Sierra Circular', categoria: 'Máquinas', precio: 120000, stock: 8, sku: 'SIE001' },
      { nombre: 'Tenazas', categoria: 'Herramientas', precio: 12000, stock: 100, sku: 'TEN001' },
      { nombre: 'Tuercas Acero', categoria: 'Tornillería', precio: 5000, stock: 500, sku: 'TU001' },
      { nombre: 'Tornillos (100)', categoria: 'Tornillería', precio: 8000, stock: 200, sku: 'TO001' },
      { nombre: 'Escalera Aluminio 3m', categoria: 'Escaleras', precio: 65000, stock: 15, sku: 'ESC001' },
      { nombre: 'Masilla Rápida', categoria: 'Adhesivos', precio: 3500, stock: 150, sku: 'MAS001' },
      { nombre: 'Pintura Acrílica 1L', categoria: 'Pinturas', precio: 18000, stock: 80, sku: 'PIN001' },
      { nombre: 'Brocha Plana 4', categoria: 'Pinceles', precio: 6000, stock: 120, sku: 'BRO001' },
      { nombre: 'Lija Grano 120', categoria: 'Abrasivos', precio: 2000, stock: 300, sku: 'LIJ001' },
      { nombre: 'Guantes de Trabajo', categoria: 'EPP', precio: 7000, stock: 250, sku: 'GUA001' },
      { nombre: 'Casco de Seguridad', categoria: 'EPP', precio: 12000, stock: 100, sku: 'CAS001' },
      { nombre: 'Lentes de Seguridad', categoria: 'EPP', precio: 4500, stock: 200, sku: 'LEN001' },
      { nombre: 'Nivel Láser', categoria: 'Medición', precio: 45000, stock: 20, sku: 'NIV001' },
      { nombre: 'Cinta Métrica 5m', categoria: 'Medición', precio: 8000, stock: 100, sku: 'CIN001' },
      { nombre: 'Flexómetro 10m', categoria: 'Medición', precio: 12000, stock: 80, sku: 'FLE001' },
      { nombre: 'Linterna LED', categoria: 'Iluminación', precio: 15000, stock: 60, sku: 'LIN001' },
      { nombre: 'Batería AA (4 unidades)', categoria: 'Energía', precio: 6000, stock: 200, sku: 'BAT001' },
    ];

    const productosData = [];
    for (const product of testProducts) {
      const result = await connection.execute(
        'INSERT INTO productos (nombre, categoria, precio, stock, sku, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW())',
        [product.nombre, product.categoria, product.precio, product.stock, product.sku]
      );
      productosData.push({
        ...product,
        id: result[0].insertId,
      });
      console.log(`  ✓ ${product.nombre} (${product.sku})`);
    }
    await connection.commit();
    console.log(`✓ ${testProducts.length} products created`);

    // 5. Export data to CSV files
    console.log('\n💾 Exporting data to CSV files...');

    // Export usuarios.csv
    let usuariosCSV = 'email,password,nombre\n';
    usuariosData.forEach(user => {
      usuariosCSV += `${user.email},${user.password},${user.nombre}\n`;
    });
    fs.writeFileSync(USUARIOS_CSV, usuariosCSV);
    console.log(`✓ Exported ${usuariosData.length} users to usuarios.csv`);

    // Export productos.csv
    let productosCSV = 'id,nombre,categoria,precio,stock,sku\n';
    productosData.forEach(product => {
      productosCSV += `${product.id},${product.nombre},${product.categoria},${product.precio},${product.stock},${product.sku}\n`;
    });
    fs.writeFileSync(PRODUCTOS_CSV, productosCSV);
    console.log(`✓ Exported ${productosData.length} products to productos.csv`);

    console.log('\n✅ Setup completed successfully!');
    console.log('=' .repeat(50));
    console.log('Ready to run JMeter tests.');
    console.log('Command: npm run jmeter:local:smoke');

    return true;
  } catch (error) {
    console.error('\n❌ Error during setup:');
    console.error(error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupFixtures().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
