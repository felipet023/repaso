const bcrypt = require('bcrypt');
const pool = require('../config/db');
const env = require('../config/env');

async function ensureUser({ nombre, email, password, rol }) {
  const [existing] = await pool.execute('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
  if (existing.length) return 'existente';
  const hash = await bcrypt.hash(password, 10);
  await pool.execute(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, rol]
  );
  return 'creado';
}

// Crea al arrancar (idempotente): el admin desde ADMIN_* y el cliente demo desde DEMO_*.
async function seedAdmin() {
  const { name, email, password } = env.admin;
  if (name && email && password) {
    const resultado = await ensureUser({ nombre: name, email, password, rol: 'admin' });
    console.log(`Admin ${email}: ${resultado === 'creado' ? 'creado' : 'ya existe, omitido'}`);
  } else {
    console.log('Seed de admin omitido: variables ADMIN no configuradas');
  }

  const demo = env.demo;
  if (demo.name && demo.email && demo.password) {
    const resultado = await ensureUser({ nombre: demo.name, email: demo.email, password: demo.password, rol: 'cliente' });
    console.log(`Cliente demo ${demo.email}: ${resultado === 'creado' ? 'creado' : 'ya existe, omitido'}`);
  }
}

module.exports = seedAdmin;
