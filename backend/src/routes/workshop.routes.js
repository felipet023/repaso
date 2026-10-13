const express = require('express');
const controller = require('../controllers/workshop.controller');
const validators = require('../validators/workshop.validator');
const validate = require('../utils/validate');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Público: ver servicios del taller
router.get('/services', controller.listServices);

// Autenticado: agendar y consultar citas
router.use(authenticate);
router.post('/appointments', validate(validators.createAppointment), controller.createAppointment);
router.get('/appointments', controller.listAppointments);

module.exports = router;
