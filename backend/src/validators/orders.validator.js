const AppError = require('../utils/AppError');
const { positiveInt } = require('../utils/validators');

const METODOS_PAGO = ['tarjeta', 'transferencia', 'efectivo'];

function create(body) {
  const direccion = String((body || {}).direccion || '').trim();
  if (direccion.length < 5 || direccion.length > 200) {
    throw new AppError('la dirección de envío es obligatoria (entre 5 y 200 caracteres)', 400);
  }
  return { direccion };
}

function idParam(params) {
  const id = positiveInt(params && params.id);
  if (id === null) throw new AppError('id de pedido inválido', 400);
  return id;
}

function simulate(body) {
  const idPedido = positiveInt((body || {}).id_pedido);
  if (idPedido === null) throw new AppError('id_pedido es obligatorio y debe ser un número entero positivo', 400);
  const metodo = String(body.metodo || 'tarjeta').toLowerCase();
  if (!METODOS_PAGO.includes(metodo)) {
    throw new AppError(`método de pago inválido. Permitidos: ${METODOS_PAGO.join(', ')}`, 400);
  }
  return { id_pedido: idPedido, metodo, forzarRechazo: body.forzarRechazo === true };
}

module.exports = { create, idParam, simulate };
