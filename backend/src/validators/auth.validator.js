const AppError = require('../utils/AppError');
const { isEmail, passwordErrors } = require('../utils/validators');

function register(body) {
  const { nombre, email, password, confirmarPassword } = body || {};
  const errors = [];
  if (!nombre || !String(nombre).trim()) errors.push('el nombre es obligatorio');
  if (!isEmail(email)) errors.push('el correo electrónico es inválido');
  errors.push(...passwordErrors(password));
  if (password !== confirmarPassword) errors.push('las contraseñas no coinciden');
  if (errors.length) throw new AppError(errors.join('. '), 400);
  return {
    nombre: String(nombre).trim(),
    email: String(email).trim().toLowerCase(),
    password
  };
}

function login(body) {
  const { email, password } = body || {};
  const errors = [];
  if (!isEmail(email)) errors.push('el correo electrónico es inválido');
  if (!password) errors.push('la contraseña es obligatoria');
  if (errors.length) throw new AppError(errors.join('. '), 400);
  return { email: String(email).trim().toLowerCase(), password };
}

function forgotPassword(body) {
  const { email } = body || {};
  if (!isEmail(email)) throw new AppError('el correo electrónico es inválido', 400);
  return { email: String(email).trim().toLowerCase() };
}

function resetPassword(body) {
  const { token, password, confirmarPassword } = body || {};
  const errors = [];
  if (!token || !String(token).trim()) errors.push('el token es obligatorio');
  errors.push(...passwordErrors(password));
  if (password !== confirmarPassword) errors.push('las contraseñas no coinciden');
  if (errors.length) throw new AppError(errors.join('. '), 400);
  return { token: String(token).trim(), password };
}

module.exports = { register, login, forgotPassword, resetPassword };
