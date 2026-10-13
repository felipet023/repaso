const express = require('express');
const controller = require('../controllers/products.controller');
const validators = require('../validators/products.validator');
const validate = require('../utils/validate');
const { authenticate, authorize, optionalAuthenticate } = require('../middlewares/auth.middleware');
const { uploadImagen } = require('../middlewares/upload.middleware');

const router = express.Router();

// Público: catálogo y detalle. Autenticación opcional para que el
// admin pueda ver productos inactivos y usar incluirInactivos.
router.get('/', optionalAuthenticate, controller.list);
router.get('/:id', optionalAuthenticate, controller.getById);

// Administrador: gestión de productos
router.use(authenticate, authorize('admin'));
router.post('/', uploadImagen, validate(validators.create), controller.create);
router.put('/:id', uploadImagen, validate(validators.update), controller.update);
router.patch('/:id/status', validate(validators.status), controller.patchStatus);

module.exports = router;
