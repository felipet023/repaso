const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

let contador = 0;

function uniqueEmail(prefijo) {
  contador += 1;
  return `${prefijo}-${Date.now().toString(36)}-${contador}@test.bike-store.local`;
}

async function createUser({ nombre, email, password = 'ClaveSegura1!', rol = 'cliente' }) {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, rol]
  );
  return { id_usuario: result.insertId, nombre, email, rol, password };
}

async function createProduct({ nombre = `Producto test ${Date.now()}`, stock = 10, activo = true }) {
  const [marcas] = await pool.execute('SELECT id_marca FROM marcas LIMIT 1');
  const [categorias] = await pool.execute('SELECT id_categoria FROM categorias LIMIT 1');
  const [result] = await pool.execute(
    'INSERT INTO productos (nombre, id_marca, id_categoria, precio, descuento, stock, activo) VALUES (?, ?, ?, ?, 0, ?, ?)',
    [nombre, marcas[0].id_marca, categorias[0].id_categoria, 100000, stock, activo]
  );
  return { id_producto: result.insertId, nombre, stock };
}

// Limpia en orden respetando claves foráneas
async function cleanupUser(idUsuario) {
  const [pedidos] = await pool.execute('SELECT id_pedido FROM pedidos WHERE id_usuario = ?', [idUsuario]);
  for (const pedido of pedidos) {
    await pool.execute('DELETE FROM pagos_simulados WHERE id_pedido = ?', [pedido.id_pedido]);
    await pool.execute('DELETE FROM pedido_detalles WHERE id_pedido = ?', [pedido.id_pedido]);
  }
  await pool.execute('DELETE FROM pedidos WHERE id_usuario = ?', [idUsuario]);
  await pool.execute('DELETE FROM citas_taller WHERE id_usuario = ?', [idUsuario]);
  await pool.execute('DELETE FROM tokens_recuperacion WHERE id_usuario = ?', [idUsuario]);
  await pool.execute('DELETE FROM carritos WHERE id_usuario = ?', [idUsuario]);
  await pool.execute('DELETE FROM auditoria WHERE id_usuario = ?', [idUsuario]);
  await pool.execute('DELETE FROM usuarios WHERE id_usuario = ?', [idUsuario]);
}

async function cleanupProduct(idProducto) {
  await pool.execute('DELETE FROM carrito_detalles WHERE id_producto = ?', [idProducto]);
  await pool.execute('DELETE FROM pedido_detalles WHERE id_producto = ?', [idProducto]);
  await pool.execute('DELETE FROM productos WHERE id_producto = ?', [idProducto]);
}

async function cleanupAppointment(idCita) {
  await pool.execute('DELETE FROM citas_taller WHERE id_cita = ?', [idCita]);
}

module.exports = { uniqueEmail, createUser, createProduct, cleanupUser, cleanupProduct, cleanupAppointment };
