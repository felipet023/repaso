// Validaciones compartidas
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

// Regla de contraseña: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial.
function passwordErrors(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('la contraseña debe tener al menos 8 caracteres');
    return errors;
  }
  if (!/[a-z]/.test(password)) errors.push('debe contener al menos una minúscula');
  if (!/[A-Z]/.test(password)) errors.push('debe contener al menos una mayúscula');
  if (!/\d/.test(password)) errors.push('debe contener al menos un número');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('debe contener al menos un carácter especial');
  return errors;
}

function positiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function nonNegativeInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num >= 0 ? num : null;
}

function finiteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

module.exports = { isEmail, passwordErrors, positiveInt, nonNegativeInt, finiteNumber };
