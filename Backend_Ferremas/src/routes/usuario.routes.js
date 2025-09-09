const express = require('express');
const { checkRole, verifyToken } = require('../middlewares/auth.jwt');
const usuarioController = require('../controllers/usuario.controller');
const ROLES = require('../config/roles.config');
const { validateRequest, userValidations, idParamValidation } = require('../middlewares/validators');

const router = express.Router();

router.get('/', verifyToken, checkRole([ROLES.ADMIN]), usuarioController.getAllUsers);
router.get('/:id', verifyToken, checkRole([ROLES.ADMIN]), usuarioController.findById);
router.put('/:id', verifyToken, checkRole([ROLES.ADMIN]), idParamValidation, userValidations, validateRequest, usuarioController.updateUser);
router.get('/:id/ventas', verifyToken, checkRole([ROLES.ADMIN, ROLES.VENDEDOR]), idParamValidation, usuarioController.getUserSales);
router.delete('/:id', verifyToken, checkRole([ROLES.ADMIN]), usuarioController.deleteUser);

module.exports = router;