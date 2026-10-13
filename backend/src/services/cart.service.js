const pool = require('../config/db');
const AppError = require('../utils/AppError');

async function obtenerOCrearCarrito(idUsuario) {
  const [rows] = await pool.execute('SELECT id_carrito FROM carritos WHERE id_usuario = ?', [idUsuario]);
  if (rows.length) return rows[0].id_carrito;
  const [result] = await pool.execute('INSERT INTO carritos (id_usuario) VALUES (?)', [idUsuario]);
  return result.insertId;
}

function withTotals(item) {
  const precioFinal = Number(item.precio) * (1 - Number(item.descuento || 0) / 100);
  const subtotal = precioFinal * Number(item.cantidad);
  return {
    ...item,
    precioFinal: Math.round(precioFinal * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100
  };
}

async function list(idUsuario) {
  const idCarrito = await obtenerOCrearCarrito(idUsuario);
  const [items] = await pool.execute(
    `SELECT cd.id_producto, cd.cantidad, p.nombre, p.precio, p.descuento, p.imagen, p.stock, m.nombre AS marca
     FROM carrito_detalles cd
     JOIN productos p ON p.id_producto = cd.id_producto
     JOIN marcas m ON m.id_marca = p.id_marca
     WHERE cd.id_carrito = ?
     ORDER BY cd.id_producto`,
    [idCarrito]
  );
  const itemsDto = items.map(withTotals);
  const total = itemsDto.reduce((sum, item) => sum + item.subtotal, 0);
  return { items: itemsDto, total: Math.round(total * 100) / 100 };
}

async function obtenerProductoActivo(idProducto) {
  const [rows] = await pool.execute(
    'SELECT id_producto, nombre, precio, descuento, stock FROM productos WHERE id_producto = ? AND activo = 1',
    [idProducto]
  );
  if (!rows.length) throw new AppError('Producto no encontrado', 404);
  return rows[0];
}

async function addItem(idUsuario, idProducto, cantidad) {
  const idCarrito = await obtenerOCrearCarrito(idUsuario);
  const producto = await obtenerProductoActivo(idProducto);
  const [existing] = await pool.execute(
    'SELECT cantidad FROM carrito_detalles WHERE id_carrito = ? AND id_producto = ?',
    [idCarrito, idProducto]
  );
  const nuevaCantidad = (existing.length ? Number(existing[0].cantidad) : 0) + cantidad;
  if (nuevaCantidad > Number(producto.stock)) {
    throw new AppError(`Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`, 409);
  }
  if (existing.length) {
    await pool.execute('UPDATE carrito_detalles SET cantidad = ? WHERE id_carrito = ? AND id_producto = ?', [nuevaCantidad, idCarrito, idProducto]);
  } else {
    await pool.execute('INSERT INTO carrito_detalles (id_carrito, id_producto, cantidad) VALUES (?, ?, ?)', [idCarrito, idProducto, cantidad]);
  }
  return list(idUsuario);
}

async function updateItem(idUsuario, idProducto, cantidad) {
  const idCarrito = await obtenerOCrearCarrito(idUsuario);
  const producto = await obtenerProductoActivo(idProducto);
  const [existing] = await pool.execute(
    'SELECT id_producto FROM carrito_detalles WHERE id_carrito = ? AND id_producto = ?',
    [idCarrito, idProducto]
  );
  if (!existing.length) throw new AppError('El producto no está en el carrito', 404);
  if (cantidad > Number(producto.stock)) {
    throw new AppError(`Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`, 409);
  }
  await pool.execute('UPDATE carrito_detalles SET cantidad = ? WHERE id_carrito = ? AND id_producto = ?', [cantidad, idCarrito, idProducto]);
  return list(idUsuario);
}

async function removeItem(idUsuario, idProducto) {
  const idCarrito = await obtenerOCrearCarrito(idUsuario);
  const [result] = await pool.execute('DELETE FROM carrito_detalles WHERE id_carrito = ? AND id_producto = ?', [idCarrito, idProducto]);
  if (!result.affectedRows) throw new AppError('El producto no está en el carrito', 404);
  return list(idUsuario);
}

async function vaciarCarrito(idUsuario) {
  await pool.execute(
    'DELETE cd FROM carrito_detalles cd JOIN carritos c ON c.id_carrito = cd.id_carrito WHERE c.id_usuario = ?',
    [idUsuario]
  );
}

module.exports = { list, addItem, updateItem, removeItem, vaciarCarrito };
