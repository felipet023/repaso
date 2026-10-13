const ordersService = require('../services/orders.service');
const validators = require('../validators/orders.validator');

async function preview(req, res, next) {
  try {
    const resumen = await ordersService.preview(req.user.id_usuario);
    res.json({ ok: true, ...resumen });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const { direccion } = validators.create(req.body);
    const pedido = await ordersService.create(req.user.id_usuario, { direccion });
    res.status(201).json({ ok: true, data: pedido });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const pedidos = await ordersService.list(req.user.id_usuario, req.user.rol === 'admin');
    res.json({ ok: true, ...pedidos });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const id = validators.idParam(req.params);
    const pedido = await ordersService.getById(req.user.id_usuario, id, req.user.rol === 'admin');
    res.json({ ok: true, data: pedido });
  } catch (error) {
    next(error);
  }
}

module.exports = { preview, create, list, getById };
