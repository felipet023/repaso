const express = require('express');
const controller = require('../controllers/auth.controller');
const validators = require('../validators/auth.validator');
const validate = require('../utils/validate');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', validate(validators.register), controller.register);
router.post('/login', validate(validators.login), controller.login);
router.post('/forgot-password', validate(validators.forgotPassword), controller.forgotPassword);
router.post('/reset-password', validate(validators.resetPassword), controller.resetPassword);
router.get('/me', authenticate, controller.me);

module.exports = router;
