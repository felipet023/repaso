const paymentsService = require('../services/payments.service');
const validators = require('../validators/orders.validator');

async function simulate(req, res, next) {
  try {
    const datos = validators.simulate(req.body);
    const resultado = await paymentsService.simulate(req.user.id_usuario, datos, req.user.rol === 'admin');
    res.json({ ok: true, ...resultado });
  } catch (error) {
    next(error);
  }
}

module.exports = { simulate };
