// Validaciones del lado del cliente para formularios (la validación
// de confianza siempre ocurre en el backend).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

export function passwordErrors(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('Mínimo 8 caracteres');
    return errors;
  }
  if (!/[a-z]/.test(password)) errors.push('una minúscula');
  if (!/[A-Z]/.test(password)) errors.push('una mayúscula');
  if (!/\d/.test(password)) errors.push('un número');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('un carácter especial');
  return errors;
}

export function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}
