const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validators');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.jwt');

const router = express.Router();

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('contrasena').isLength({ min: 8 }),
    validateRequest
  ],
  authController.login
);

router.post('/registro',
  [
    body('nombre').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('rut').matches(/^[0-9]{7,8}-[0-9kK]$/),
    body('contrasena').isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }),
    validateRequest
  ],
  authController.register
);

router.get('/perfil',
  verifyToken,
  authController.profile
);

module.exports = router;