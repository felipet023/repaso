const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { createToken } = require('../utils/jwt');

function publicUser(user) {
  return {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol
  };
}

async function registerUser({ nombre, email, password }) {
  const [existing] = await pool.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
  if (existing.length) throw new AppError('El correo ya está registrado', 409);
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, 'cliente']
  );
  const [rows] = await pool.execute(
    'SELECT id_usuario, nombre, email, rol FROM usuarios WHERE id_usuario = ?',
    [result.insertId]
  );
  const user = rows[0];
  return { id_usuario: user.id_usuario, user: publicUser(user), token: createToken(user) };
}

async function loginUser({ email, password }) {
  const [rows] = await pool.execute(
    'SELECT id_usuario, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
    [email]
  );
  // Mensaje genérico para no revelar si el correo existe
  if (!rows.length || !rows[0].activo) throw new AppError('Credenciales incorrectas', 401);
  const user = rows[0];
  if (!(await bcrypt.compare(password, user.password))) throw new AppError('Credenciales incorrectas', 401);
  delete user.password;
  delete user.activo;
  return { user: publicUser(user), token: createToken(user) };
}

// Devuelve el token de recuperación. En producción se enviaría por email;
// aquí se devuelve en la respuesta para la demostración (pago/auth simulados).
async function forgotPassword({ email }) {
  const [rows] = await pool.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
  if (!rows.length) {
    return { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña' };
  }
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  await pool.execute(
    'INSERT INTO tokens_recuperacion (id_usuario, token_hash, expires_at) VALUES (?, ?, ?)',
    [rows[0].id_usuario, tokenHash, expiresAt]
  );
  return { message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña', token };
}

async function resetPassword({ token, password }) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const [rows] = await pool.execute(
    `SELECT tr.id_usuario FROM tokens_recuperacion tr
     WHERE tr.token_hash = ? AND tr.used = 0 AND tr.expires_at > NOW()`,
    [tokenHash]
  );
  if (!rows.length) throw new AppError('Token inválido o expirado', 400);
  const hash = await bcrypt.hash(password, 10);
  await pool.execute('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [hash, rows[0].id_usuario]);
  await pool.execute('UPDATE tokens_recuperacion SET used = 1 WHERE token_hash = ?', [tokenHash]);
  return { message: 'Contraseña actualizada correctamente' };
}

async function getMe(idUsuario) {
  const [rows] = await pool.execute(
    'SELECT id_usuario, nombre, email, rol, activo, created_at FROM usuarios WHERE id_usuario = ?',
    [idUsuario]
  );
  if (!rows.length) throw new AppError('Usuario no encontrado', 404);
  return { user: publicUser(rows[0]) };
}

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getMe };
