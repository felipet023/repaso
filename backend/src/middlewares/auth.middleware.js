const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const env = require('../config/env');

// Verifica el JWT y recarga el usuario desde la base de datos para
// que cambios de rol o desactivación surtan efecto de inmediato.
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token requerido' });
  }
  let payload;
  try {
    payload = jwt.verify(header.substring(7), env.jwt.secret);
  } catch {
    return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
  }
  pool
    .execute('SELECT id_usuario, nombre, email, rol, activo FROM usuarios WHERE id_usuario = ?', [payload.id_usuario])
    .then(([rows]) => {
      if (!rows.length || !rows[0].activo) {
        return res.status(401).json({ ok: false, message: 'Token inválido o usuario inactivo' });
      }
      req.user = rows[0];
      next();
    })
    .catch(next);
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ ok: false, message: 'No tienes permisos para realizar esta operación' });
    }
    next();
  };
}

// Igual que authenticate, pero no rechaza si no hay (o hay un token inválido):
// deja req.user indefinido. Sirve para rutas públicas que comportan datos
// extra para el admin (ej.: ver productos inactivos).
function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  let payload;
  try {
    payload = jwt.verify(header.substring(7), env.jwt.secret);
  } catch {
    return next();
  }
  pool
    .execute('SELECT id_usuario, nombre, email, rol, activo FROM usuarios WHERE id_usuario = ?', [payload.id_usuario])
    .then(([rows]) => {
      if (rows.length && rows[0].activo) req.user = rows[0];
      next();
    })
    .catch(next);
}

module.exports = { authenticate, authorize, optionalAuthenticate };
