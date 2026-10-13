const express = require('express');
const controller = require('../controllers/payments.controller');
const validators = require('../validators/orders.validator');
const validate = require('../utils/validate');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.post('/simulate', validate(validators.simulate), controller.simulate);

module.exports = router;
