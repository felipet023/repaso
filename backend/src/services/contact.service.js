const pool = require('../config/db');

async function createMessage({ nombre, email, mensaje }) {
  const [result] = await pool.execute(
    'INSERT INTO mensajes_contacto (nombre, email, mensaje) VALUES (?, ?, ?)',
    [nombre, email, mensaje]
  );
  return { id_mensaje: result.insertId };
}

module.exports = { createMessage };
