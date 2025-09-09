const express = require('express');
const router = express.Router();

// Dummy endpoint para logout (solo frontend borra el token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso (frontend debe borrar el token JWT)' });
});

// Dummy endpoint para inicio/info general
router.get('/inicio', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Ferremas',
    version: '1.0.0',
    fecha: new Date().toISOString()
  });
});

module.exports = router;
