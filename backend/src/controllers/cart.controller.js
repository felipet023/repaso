const cartService = require('../services/cart.service');
const validators = require('../validators/cart.validator');

async function list(req, res, next) {
  try {
    const carrito = await cartService.list(req.user.id_usuario);
    res.json({ ok: true, ...carrito });
  } catch (error) {
    next(error);
  }
}

async function addItem(req, res, next) {
  try {
    const { id_producto, cantidad } = validators.addItem(req.body);
    const carrito = await cartService.addItem(req.user.id_usuario, id_producto, cantidad);
    res.json({ ok: true, ...carrito });
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const idProducto = validators.idParam(req.params);
    const { cantidad } = validators.updateItem(req.body);
    const carrito = await cartService.updateItem(req.user.id_usuario, idProducto, cantidad);
    res.json({ ok: true, ...carrito });
  } catch (error) {
    next(error);
  }
}

async function removeItem(req, res, next) {
  try {
    const idProducto = validators.idParam(req.params);
    const carrito = await cartService.removeItem(req.user.id_usuario, idProducto);
    res.json({ ok: true, ...carrito });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, addItem, updateItem, removeItem };
