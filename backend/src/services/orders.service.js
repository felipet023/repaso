const pool = require('../config/db');
const AppError = require('../utils/AppError');
const cartService = require('./cart.service');

function generarNumeroPedido() {
  const anio = new Date().getFullYear();
  const aleatorio = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  return `TK-${anio}-${aleatorio}`;
}

async function preview(idUsuario) {
  const { items, total } = await cartService.list(idUsuario);
  if (!items.length) throw new AppError('El carrito está vacío', 400);
  return { items, total };
}

async function create(idUsuario, { direccion }) {
  const { items, total } = await preview(idUsuario);
  const numeroPedido = generarNumeroPedido();
  const [result] = await pool.execute(
    'INSERT INTO pedidos (numero_pedido, id_usuario, total, estado, direccion) VALUES (?, ?, ?, ?, ?)',
    [numeroPedido, idUsuario, total, 'pendiente', direccion]
  );
  const idPedido = result.insertId;
  for (const item of items) {
    await pool.execute(
      'INSERT INTO pedido_detalles (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
      [idPedido, item.id_producto, item.cantidad, item.precioFinal]
    );
  }
  return getById(idUsuario, idPedido, false);
}

async function list(idUsuario, esAdmin) {
  const [rows] = await pool.execute(
    `SELECT p.id_pedido, p.numero_pedido, p.total, p.estado, p.direccion, p.created_at,
            u.nombre AS cliente,
            (SELECT COUNT(*) FROM pedido_detalles pd WHERE pd.id_pedido = p.id_pedido) AS cantidad_items
     FROM pedidos p
     JOIN usuarios u ON u.id_usuario = p.id_usuario
     ${esAdmin ? '' : 'WHERE p.id_usuario = ?'}
     ORDER BY p.created_at DESC
     LIMIT 100`,
    esAdmin ? [] : [idUsuario]
  );
  return { data: rows.map((row) => ({ ...row, total: Number(row.total) })) };
}

async function getById(idUsuario, idPedido, esAdmin) {
  const [rows] = await pool.execute(
    `SELECT p.id_pedido, p.id_usuario, p.numero_pedido, p.total, p.estado, p.direccion, p.created_at,
            u.nombre AS cliente
     FROM pedidos p
     JOIN usuarios u ON u.id_usuario = p.id_usuario
     WHERE p.id_pedido = ?`,
    [idPedido]
  );
  if (!rows.length) throw new AppError('Pedido no encontrado', 404);
  const pedido = rows[0];
  if (!esAdmin && Number(pedido.id_usuario) !== Number(idUsuario)) {
    throw new AppError('No tienes acceso a este pedido', 403);
  }
  const [detalles] = await pool.execute(
    `SELECT pd.id_producto, pd.cantidad, pd.precio_unitario, p.nombre, p.imagen
     FROM pedido_detalles pd
     JOIN productos p ON p.id_producto = pd.id_producto
     WHERE pd.id_pedido = ?`,
    [idPedido]
  );
  return {
    ...pedido,
    total: Number(pedido.total),
    items: detalles.map((d) => ({
      ...d,
      precio_unitario: Number(d.precio_unitario)
    }))
  };
}

// Devuelve el pedido con detalles sin verificar propiedad (uso interno de pagos).
async function getByIdConDetalles(idPedido) {
  const [rows] = await pool.execute(
    `SELECT p.id_pedido, p.numero_pedido, p.total, p.estado, p.id_usuario,
            u.nombre AS cliente, u.email AS cliente_email
     FROM pedidos p
     JOIN usuarios u ON u.id_usuario = p.id_usuario
     WHERE p.id_pedido = ?`,
    [idPedido]
  );
  if (!rows.length) return null;
  const [detalles] = await pool.execute(
    'SELECT id_producto, cantidad, precio_unitario FROM pedido_detalles WHERE id_pedido = ?',
    [idPedido]
  );
  return { ...rows[0], total: Number(rows[0].total), detalles };
}

module.exports = { preview, create, list, getById, getByIdConDetalles };
