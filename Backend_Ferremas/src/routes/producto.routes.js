const { checkRole } = require('../middlewares/auth.jwt');
const { validateRequest, productValidations, idParamValidation } = require('../middlewares/validators');
const productoController = require('../controllers/producto.controller');
const ROLES = require('../config/roles.config');
const { verifyToken } = require('../middlewares/auth.jwt');

const express = require('express');
const router = express.Router();

router.get('/',
    productoController.findAll
);

router.post('/',
    verifyToken,
    checkRole([ROLES.ADMIN, ROLES.BODEGUERO]),
    productValidations,
    validateRequest,
    productoController.create
);

router.put('/:id',
    verifyToken,
    checkRole([ROLES.ADMIN, ROLES.BODEGUERO]),
    idParamValidation,
    productValidations,
    validateRequest,
    productoController.update // Cambiado de updateStock a update
);

router.delete('/:id',
    verifyToken,
    checkRole([ROLES.ADMIN, ROLES.BODEGUERO]),
    idParamValidation,
    productoController.delete // Asegúrate que esta función exista en el controlador
);

router.get('/:id/stock',
    verifyToken,
    checkRole([ROLES.BODEGUERO, ROLES.ADMIN]),
    idParamValidation,
    productoController.getStock // Asegúrate que esta función exista en el controlador
);
router.get('/:id',
    productoController.findById
);
module.exports = router;