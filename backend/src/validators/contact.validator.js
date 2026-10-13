const AppError = require('../utils/AppError');

function createMessage(body) {
  const data = body || {};
  const errors = [];
  const nombre = String(data.nombre || '').trim();
  const email = String(data.email || '').trim();
  const mensaje = String(data.mensaje || '').trim();
  if (!nombre) errors.push('el nombre es obligatorio');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('el correo electrónico es inválido');
  if (mensaje.length < 10) errors.push('el mensaje debe tener al menos 10 caracteres');
  if (mensaje.length > 1000) errors.push('el mensaje no puede superar 1000 caracteres');
  if (errors.length) throw new AppError(errors.join('. '), 400);
  return { nombre, email, mensaje };
}

module.exports = { createMessage };
