const contactService = require('../services/contact.service');
const validators = require('../validators/contact.validator');

async function createMessage(req, res, next) {
  try {
    const data = validators.createMessage(req.body);
    await contactService.createMessage(data);
    res.status(201).json({ ok: true, message: 'Mensaje enviado correctamente. Te contactaremos pronto.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createMessage };
