const express = require('express');
const controller = require('../controllers/cart.controller');
const validators = require('../validators/cart.validator');
const validate = require('../utils/validate');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/', controller.list);
router.post('/items', validate(validators.addItem), controller.addItem);
router.patch('/items/:id', validate(validators.updateItem), controller.updateItem);
// id de producto se valida dentro del controlador (req.params)
router.delete('/items/:id', controller.removeItem);

module.exports = router;
