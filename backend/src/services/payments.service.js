const crypto = require('crypto');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const ordersService = require('./orders.service');
const cartService = require('./cart.service');

// Pago 100% simulado: nunca toca datos reales de tarjetas.
// Si forzarRechazo = true, el pago se rechaza (útil para pruebas).
async function simulate(idUsuario, { id_pedido: idPedido, metodo, forzarRechazo }, esAdmin) {
  const pedido = await ordersService.getByIdConDetalles(idPedido);
  if (!pedido) throw new AppError('Pedido no encontrado', 404);
  if (!esAdmin && Number(pedido.id_usuario) !== Number(idUsuario)) {
    throw new AppError('No tienes acceso a este pedido', 403);
  }
  if (!pedido.detalles.length) throw new AppError('El pedido no tiene productos', 400);

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [[fila]] = await conexion.execute(
      'SELECT estado FROM pedidos WHERE id_pedido = ? FOR UPDATE',
      [idPedido]
    );
    if (!fila) throw new AppError('Pedido no encontrado', 404);
    if (fila.estado !== 'pendiente') {
      throw new AppError(`El pedido ya fue procesado con estado "${fila.estado}"`, 409);
    }

    const referencia = `SIM-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    if (forzarRechazo) {
      await conexion.execute('UPDATE pedidos SET estado = ? WHERE id_pedido = ?', ['rechazado', idPedido]);
      await conexion.execute(
        'INSERT INTO pagos_simulados (id_pedido, metodo, estado, referencia) VALUES (?, ?, ?, ?)',
        [idPedido, metodo, 'rechazado', referencia]
      );
      await conexion.commit();
      const actualizado = await ordersService.getById(idUsuario, idPedido, esAdmin);
      return { aprobado: false, referencia, pedido: actualizado };
    }

    // Verifica stock con bloqueo de fila antes de confirmar
    for (const detalle of pedido.detalles) {
      const [[producto]] = await conexion.execute(
        'SELECT nombre, stock FROM productos WHERE id_producto = ? FOR UPDATE',
        [detalle.id_producto]
      );
      if (!producto) throw new AppError('Un producto del pedido ya no existe', 409);
      if (Number(producto.stock) < Number(detalle.cantidad)) {
        throw new AppError(`Stock insuficiente de "${producto.nombre}" (quedan ${producto.stock})`, 409);
      }
    }

    for (const detalle of pedido.detalles) {
      await conexion.execute(
        'UPDATE productos SET stock = stock - ?, ventas = ventas + ? WHERE id_producto = ?',
        [detalle.cantidad, detalle.cantidad, detalle.id_producto]
      );
    }

    await conexion.execute('UPDATE pedidos SET estado = ? WHERE id_pedido = ?', ['aprobado', idPedido]);
    await conexion.execute(
      'INSERT INTO pagos_simulados (id_pedido, metodo, estado, referencia) VALUES (?, ?, ?, ?)',
      [idPedido, metodo, 'aprobado', referencia]
    );
    await cartService.vaciarCarrito(pedido.id_usuario);

    await conexion.commit();
    const actualizado = await ordersService.getById(idUsuario, idPedido, esAdmin);
    return { aprobado: true, referencia, pedido: actualizado };
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

module.exports = { simulate };
