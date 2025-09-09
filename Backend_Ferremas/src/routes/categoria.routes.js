const express = require('express');
const { checkRole, verifyToken } = require('../middlewares/auth.jwt');
const categoriaController = require('../controllers/categoria.controller');
const ROLES = require('../config/roles.config');

const router = express.Router();

router.get('/', categoriaController.findAll);
router.get('/:id', categoriaController.findById);
router.post('/', verifyToken, checkRole([ROLES.ADMIN]), categoriaController.create);
router.put('/:id', verifyToken, checkRole([ROLES.ADMIN]), categoriaController.update);
router.delete('/:id', verifyToken, checkRole([ROLES.ADMIN]), categoriaController.delete);

module.exports = router;
