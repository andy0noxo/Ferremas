const express = require('express');
const { checkRole, verifyToken } = require('../middlewares/auth.jwt');
const rolController = require('../controllers/rol.controller');
const ROLES = require('../config/roles.config');

const router = express.Router();

// Allow unauthenticated access to roles list for registration
router.get('/', rolController.findAll);
router.get('/:id', verifyToken, checkRole([ROLES.ADMIN]), rolController.findById);
router.post('/', verifyToken, checkRole([ROLES.ADMIN]), rolController.create);
router.put('/:id', verifyToken, checkRole([ROLES.ADMIN]), rolController.update);
router.delete('/:id', verifyToken, checkRole([ROLES.ADMIN]), rolController.delete);

module.exports = router;
