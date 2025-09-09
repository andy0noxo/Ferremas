const express = require('express');
const { checkRole, verifyToken } = require('../middlewares/auth.jwt');
const marcaController = require('../controllers/marca.controller');
const ROLES = require('../config/roles.config');

const router = express.Router();

router.get('/', marcaController.findAll);
router.get('/:id', marcaController.findById);
router.post('/', verifyToken, checkRole([ROLES.ADMIN]), marcaController.create);
router.put('/:id', verifyToken, checkRole([ROLES.ADMIN]), marcaController.update);
router.delete('/:id', verifyToken, checkRole([ROLES.ADMIN]), marcaController.delete);

module.exports = router;
