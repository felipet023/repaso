const express = require('express');
const controller = require('../controllers/orders.controller');
const validators = require('../validators/orders.validator');
const validate = require('../utils/validate');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/preview', controller.preview);
router.post('/', validate(validators.create), controller.create);
router.get('/', controller.list);
// id de pedido se valida dentro del controlador (req.params)
router.get('/:id', controller.getById);

module.exports = router;
