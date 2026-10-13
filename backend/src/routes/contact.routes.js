const express = require('express');
const controller = require('../controllers/contact.controller');
const validators = require('../validators/contact.validator');
const validate = require('../utils/validate');

const router = express.Router();

router.post('/', validate(validators.createMessage), controller.createMessage);

module.exports = router;
