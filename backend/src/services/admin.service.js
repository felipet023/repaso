const pool = require('../config/db');
const AppError = require('../utils/AppError');

const ROLES = ['admin', 'cliente'];

async function listUsers({ search }) {
  const params = [];
  let where = '';
  if (search && String(search).trim()) {
    where = 'WHERE u.nombre LIKE ? OR u.email LIKE ?';
    const like = `%${String(search).trim()}%`;
    params.push(like, like);
  }
  const [rows] = await pool.execute(
    `SELECT u.id_usuario, u.nombre, u.email, u.rol, u.activo, u.created_at,
            (SELECT COUNT(*) FROM pedidos p WHERE p.id_usuario = u.id_usuario) AS pedidos
     FROM usuarios u
     ${where}
     ORDER BY u.created_at DESC, u.nombre`,
    params
  );
  return { data: rows };
}

async function ensureExists(idUsuario) {
  const [rows] = await pool.execute(
    'SELECT id_usuario, nombre, email, rol, activo FROM usuarios WHERE id_usuario = ?',
    [idUsuario]
  );
  if (!rows.length) throw new AppError('Usuario no encontrado', 404);
  return rows[0];
}

async function logAudit(idUsuarioSesion, accion, entidad, entidadId, detalle) {
  await pool.execute(
    'INSERT INTO auditoria (id_usuario, accion, entidad, entidad_id, detalle) VALUES (?, ?, ?, ?, ?)',
    [idUsuarioSesion, accion, entidad, entidadId, detalle]
  );
}

async function changeRole(idUsuarioSesion, idUsuario, rol) {
  if (!ROLES.includes(rol)) throw new AppError('Rol inválido. Permitidos: admin, cliente', 400);
  if (Number(idUsuarioSesion) === Number(idUsuario)) {
    throw new AppError('No puedes cambiar tu propio rol', 400);
  }
  const objetivo = await ensureExists(idUsuario);
  if (objetivo.rol === rol) return { user: objetivo, message: 'El rol ya tiene ese valor' };

  // Evita dejar el sistema sin administradores
  if (objetivo.rol === 'admin' && rol === 'cliente') {
    const [[conteo]] = await pool.execute("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin' AND activo = 1");
    if (Number(conteo.total) <= 1) {
      throw new AppError('Debe haber al menos un administrador activo', 400);
    }
  }
  await pool.execute('UPDATE usuarios SET rol = ? WHERE id_usuario = ?', [rol, idUsuario]);
  await logAudit(idUsuarioSesion, 'cambio_rol', 'usuarios', idUsuario, `${objetivo.nombre}: ${objetivo.rol} → ${rol}`);
  const actualizado = await ensureExists(idUsuario);
  return { user: actualizado, message: 'Rol actualizado correctamente' };
}

async function changeStatus(idUsuarioSesion, idUsuario, activo) {
  if (typeof activo !== 'boolean') throw new AppError('activo debe ser true o false', 400);
  if (Number(idUsuarioSesion) === Number(idUsuario)) {
    throw new AppError('No puedes activar o desactivar tu propia cuenta', 400);
  }
  const objetivo = await ensureExists(idUsuario);
  if (Boolean(objetivo.activo) === activo) return { user: objetivo, message: 'El estado ya tiene ese valor' };
  await pool.execute('UPDATE usuarios SET activo = ? WHERE id_usuario = ?', [activo, idUsuario]);
  await logAudit(idUsuarioSesion, activo ? 'usuario_activado' : 'usuario_desactivado', 'usuarios', idUsuario, objetivo.nombre);
  const actualizado = await ensureExists(idUsuario);
  return { user: { ...actualizado, activo: Boolean(actualizado.activo) }, message: activo ? 'Cuenta activada' : 'Cuenta desactivada' };
}

async function dashboard({ desde, hasta, categoria }) {
  const params = [];
  const whereFecha = [];
  if (desde && /^\d{4}-\d{2}-\d{2}$/.test(desde)) {
    params.push(`${desde} 00:00:00`);
    whereFecha.push('p.created_at >= ?');
  }
  if (hasta && /^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
    params.push(`${hasta} 23:59:59`);
    whereFecha.push('p.created_at <= ?');
  }
  const fechaSql = whereFecha.length ? ` AND ${whereFecha.join(' AND ')}` : '';

  // Filtro de categoría: consultas sobre "pedidos" usan subconsulta (no hay join a pedido_detalles);
  // consultas con join a productos usan pr.id_categoria directamente.
  let categoriaBase = '';
  let categoriaDetalle = '';
  if (categoria) {
    params.push(Number(categoria));
    categoriaBase = ' AND p.id_pedido IN (SELECT pd2.id_pedido FROM pedido_detalles pd2 JOIN productos pr2 ON pr2.id_producto = pd2.id_producto WHERE pr2.id_categoria = ?)';
    categoriaDetalle = ' AND pr.id_categoria = ?';
  }

  const whereBase = `WHERE p.estado = 'aprobado'${fechaSql}${categoriaBase}`;
  const whereDetalle = `WHERE p.estado = 'aprobado'${fechaSql}${categoriaDetalle}`;

  const [[resumen]] = await pool.execute(
    `SELECT COALESCE(SUM(p.total), 0) AS ventas_totales, COUNT(*) AS total_pedidos
     FROM pedidos p ${whereBase}`,
    params
  );

  const [masVendidos] = await pool.execute(
    `SELECT pr.id_producto, pr.nombre, SUM(pd.cantidad) AS unidades, SUM(pd.cantidad * pd.precio_unitario) AS ingreso
     FROM pedido_detalles pd
     JOIN pedidos p ON p.id_pedido = pd.id_pedido
     JOIN productos pr ON pr.id_producto = pd.id_producto
     ${whereDetalle}
     GROUP BY pr.id_producto, pr.nombre
     ORDER BY unidades DESC
     LIMIT 5`,
    params
  );

  const [alertas] = await pool.execute(
    `SELECT pr.id_producto, pr.nombre, pr.stock
     FROM productos pr
     WHERE pr.activo = 1 AND pr.stock <= 5
     ORDER BY pr.stock ASC
     LIMIT 20`
  );

  const [pedidosRecientes] = await pool.execute(
    `SELECT p.id_pedido, p.numero_pedido, p.total, p.estado, p.created_at, u.nombre AS cliente
     FROM pedidos p
     JOIN usuarios u ON u.id_usuario = p.id_usuario
     ORDER BY p.created_at DESC
     LIMIT 10`
  );

  return {
    resumen: {
      ventas_totales: Number(resumen.ventas_totales),
      total_pedidos: Number(resumen.total_pedidos)
    },
    productos_mas_vendidos: masVendidos.map((r) => ({
      id: r.id_producto,
      nombre: r.nombre,
      unidades: Number(r.unidades),
      ingreso: Number(r.ingreso)
    })),
    alertas_inventario: alertas.map((r) => ({ id: r.id_producto, nombre: r.nombre, stock: Number(r.stock) })),
    pedidos_recientes: pedidosRecientes.map((r) => ({ ...r, total: Number(r.total) }))
  };
}

async function report({ desde, hasta, categoria }) {
  const params = [];
  const whereFecha = [];
  if (desde && /^\d{4}-\d{2}-\d{2}$/.test(desde)) {
    params.push(`${desde} 00:00:00`);
    whereFecha.push('p.created_at >= ?');
  }
  if (hasta && /^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
    params.push(`${hasta} 23:59:59`);
    whereFecha.push('p.created_at <= ?');
  }
  const fechaSql = whereFecha.length ? ` AND ${whereFecha.join(' AND ')}` : '';

  let categoriaBase = '';
  let categoriaDetalle = '';
  if (categoria) {
    params.push(Number(categoria));
    categoriaBase = ' AND p.id_pedido IN (SELECT pd2.id_pedido FROM pedido_detalles pd2 JOIN productos pr2 ON pr2.id_producto = pd2.id_producto WHERE pr2.id_categoria = ?)';
    categoriaDetalle = ' AND pr.id_categoria = ?';
  }

  const whereBase = `WHERE p.estado = 'aprobado'${fechaSql}${categoriaBase}`;
  const whereDetalle = `WHERE p.estado = 'aprobado'${fechaSql}${categoriaDetalle}`;

  const [porCategoria] = await pool.execute(
    `SELECT c.nombre AS categoria, COUNT(DISTINCT p.id_pedido) AS pedidos,
            SUM(pd.cantidad) AS unidades, SUM(pd.cantidad * pd.precio_unitario) AS ventas
     FROM pedido_detalles pd
     JOIN pedidos p ON p.id_pedido = pd.id_pedido
     JOIN productos pr ON pr.id_producto = pd.id_producto
     JOIN categorias c ON c.id_categoria = pr.id_categoria
     ${whereDetalle}
     GROUP BY c.id_categoria, c.nombre
     ORDER BY ventas DESC`,
    params
  );

  const [topProductos] = await pool.execute(
    `SELECT pr.nombre, m.nombre AS marca, SUM(pd.cantidad) AS unidades,
            SUM(pd.cantidad * pd.precio_unitario) AS ventas
     FROM pedido_detalles pd
     JOIN pedidos p ON p.id_pedido = pd.id_pedido
     JOIN productos pr ON pr.id_producto = pd.id_producto
     JOIN marcas m ON m.id_marca = pr.id_marca
     ${whereDetalle}
     GROUP BY pr.id_producto, pr.nombre, m.nombre
     ORDER BY ventas DESC
     LIMIT 10`,
    params
  );

  const [[resumen]] = await pool.execute(
    `SELECT COALESCE(SUM(p.total), 0) AS ventas_totales, COUNT(*) AS total_pedidos
     FROM pedidos p ${whereBase}`,
    params
  );

  return {
    filtros: { desde: desde || null, hasta: hasta || null, categoria: Number(categoria) || null },
    resumen: {
      ventas_totales: Number(resumen.ventas_totales),
      total_pedidos: Number(resumen.total_pedidos)
    },
    ventas_por_categoria: porCategoria.map((r) => ({
      categoria: r.categoria,
      pedidos: Number(r.pedidos),
      unidades: Number(r.unidades),
      ventas: Number(r.ventas)
    })),
    productos_estrella: topProductos.map((r) => ({
      nombre: r.nombre,
      marca: r.marca,
      unidades: Number(r.unidades),
      ventas: Number(r.ventas)
    }))
  };
}

module.exports = { listUsers, changeRole, changeStatus, dashboard, report };
