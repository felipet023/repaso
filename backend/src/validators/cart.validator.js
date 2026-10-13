const AppError = require('../utils/AppError');
const { positiveInt } = require('../utils/validators');

function addItem(body) {
  const idProducto = positiveInt((body || {}).id_producto);
  if (idProducto === null) throw new AppError('id_producto es obligatorio y debe ser un número entero positivo', 400);
  const cantidad = positiveInt(body.cantidad) ?? 1;
  if (cantidad > 99) throw new AppError('la cantidad no puede superar 99 unidades', 400);
  return { id_producto: idProducto, cantidad };
}

function updateItem(body) {
  const cantidad = positiveInt((body || {}).cantidad);
  if (cantidad === null) throw new AppError('cantidad es obligatoria y debe ser un número entero positivo', 400);
  if (cantidad > 99) throw new AppError('la cantidad no puede superar 99 unidades', 400);
  return { cantidad };
}

function idParam(params) {
  const id = positiveInt(params && params.id);
  if (id === null) throw new AppError('id de producto inválido', 400);
  return id;
}

module.exports = { addItem, updateItem, idParam };
