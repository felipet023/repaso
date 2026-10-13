const workshopService = require('../services/workshop.service');
const validators = require('../validators/workshop.validator');

async function listServices(req, res, next) {
  try {
    const resultado = await workshopService.listServices();
    res.json({ ok: true, ...resultado });
  } catch (error) {
    next(error);
  }
}

async function createAppointment(req, res, next) {
  try {
    const data = validators.createAppointment(req.body);
    const cita = await workshopService.createAppointment(req.user.id_usuario, data);
    res.status(201).json({ ok: true, message: 'Cita registrada correctamente', ...cita });
  } catch (error) {
    next(error);
  }
}

async function listAppointments(req, res, next) {
  try {
    const esAdmin = req.user.rol === 'admin';
    const resultado = await workshopService.listAppointments(req.user.id_usuario, esAdmin);
    res.json({ ok: true, ...resultado });
  } catch (error) {
    next(error);
  }
}

module.exports = { listServices, createAppointment, listAppointments };
