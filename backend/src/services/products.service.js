const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { UPLOAD_DIR } = require('../middlewares/upload.middleware');

async function borrarImagenSiExiste(imagen) {
  if (!imagen) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, imagen));
  } catch {
    // La imagen puede no existir; no es un error crítico
  }
}

const ORDENES = {
  mas_vendidos: 'p.ventas DESC',
  precio_asc: 'p.precio ASC',
  precio_desc: 'p.precio DESC',
  nombre_asc: 'p.nombre ASC'
};

function toDto(row) {
  const precioFinal = Number(row.precio) * (1 - Number(row.descuento || 0) / 100);
  return {
    id: row.id_producto,
    nombre: row.nombre,
    descripcion: row.descripcion,
    marca: { id: row.id_marca, nombre: row.marca },
    categoria: { id: row.id_categoria, nombre: row.categoria },
    precio: Number(row.precio),
    descuento: Number(row.descuento || 0),
    precioFinal: Math.round(precioFinal * 100) / 100,
    imagen: row.imagen,
    stock: Number(row.stock),
    activo: Boolean(row.activo),
    rating: Number(row.rating || 0),
    ventas: Number(row.ventas || 0)
  };
}

function buildWhere(filters, params) {
  const where = [];
  if (!filters.incluirInactivos) where.push('p.activo = 1');
  if (filters.search) {
    where.push('(p.nombre LIKE ? OR m.nombre LIKE ?)');
    const like = `%${filters.search}%`;
    params.push(like, like);
  }
  if (filters.categoria) {
    where.push('p.id_categoria = ?');
    params.push(filters.categoria);
  }
  if (filters.marca) {
    where.push('p.id_marca = ?');
    params.push(filters.marca);
  }
  if (filters.min != null) {
    where.push('p.precio >= ?');
    params.push(filters.min);
  }
  if (filters.max != null) {
    where.push('p.precio <= ?');
    params.push(filters.max);
  }
  if (filters.disponible) where.push('p.stock > 0');
  if (filters.rating != null) {
    where.push('p.rating >= ?');
    params.push(filters.rating);
  }
  return where.length ? `WHERE ${where.join(' AND ')}` : '';
}

async function list(filters) {
  const params = [];
  const whereSql = buildWhere(filters, params);
  const orderSql = ORDENES[filters.orden] || ORDENES.mas_vendidos;
  const [rows] = await pool.execute(
    `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.descuento, p.imagen,
            p.stock, p.activo, p.rating, p.ventas,
            m.id_marca, m.nombre AS marca, c.id_categoria, c.nombre AS categoria
     FROM productos p
     JOIN marcas m ON m.id_marca = p.id_marca
     JOIN categorias c ON c.id_categoria = p.id_categoria
     ${whereSql}
     ORDER BY ${orderSql}
     LIMIT ? OFFSET ?`,
    [...params, filters.limit, filters.offset]
  );
  const [[countRow]] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM productos p
     JOIN marcas m ON m.id_marca = p.id_marca
     ${whereSql}`,
    params
  );
  return { data: rows.map(toDto), total: Number(countRow.total), limit: filters.limit, offset: filters.offset };
}

async function filtros() {
  const [categorias] = await pool.execute('SELECT id_categoria AS id, nombre FROM categorias ORDER BY nombre');
  const [marcas] = await pool.execute('SELECT id_marca AS id, nombre FROM marcas ORDER BY nombre');
  return { categorias, marcas };
}

async function findById(id, { soloActivos = true } = {}) {
  const [rows] = await pool.execute(
    `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.descuento, p.imagen,
            p.stock, p.activo, p.rating, p.ventas,
            m.id_marca, m.nombre AS marca, c.id_categoria, c.nombre AS categoria
     FROM productos p
     JOIN marcas m ON m.id_marca = p.id_marca
     JOIN categorias c ON c.id_categoria = p.id_categoria
     WHERE p.id_producto = ?${soloActivos ? ' AND p.activo = 1' : ''}`,
    [id]
  );
  return rows.length ? toDto(rows[0]) : null;
}

async function getByIdPublic(id) {
  const producto = await findById(id, { soloActivos: true });
  if (!producto) throw new AppError('Producto no encontrado', 404);
  return producto;
}

async function getByIdAdmin(id) {
  const producto = await findById(id, { soloActivos: false });
  if (!producto) throw new AppError('Producto no encontrado', 404);
  return producto;
}

async function createEquipo(data, imagen, idUsuarioSesion) {
  const [result] = await pool.execute(
    'INSERT INTO productos (nombre, descripcion, id_marca, id_categoria, precio, descuento, imagen, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [data.nombre, data.descripcion ?? null, data.id_marca, data.id_categoria, data.precio, data.descuento ?? 0, imagen || null, data.stock ?? 0]
  );
  await pool.execute(
    'INSERT INTO auditoria (id_usuario, accion, entidad, entidad_id, detalle) VALUES (?, ?, ?, ?, ?)',
    [idUsuarioSesion, 'producto_creado', 'productos', result.insertId, data.nombre]
  );
  return getByIdAdmin(result.insertId);
}

async function updateEquipo(id, data, imagen, idUsuarioSesion) {
  const actual = await getByIdAdmin(id);
  const nuevaImagen = imagen || actual.imagen;
  await pool.execute(
    'UPDATE productos SET nombre = ?, descripcion = ?, id_marca = ?, id_categoria = ?, precio = ?, descuento = ?, imagen = ?, stock = ? WHERE id_producto = ?',
    [data.nombre ?? actual.nombre, data.descripcion ?? actual.descripcion, data.id_marca ?? actual.marca.id, data.id_categoria ?? actual.categoria.id, data.precio ?? actual.precio, data.descuento ?? actual.descuento, nuevaImagen, data.stock ?? actual.stock, id]
  );
  if (imagen && actual.imagen && actual.imagen !== imagen) await borrarImagenSiExiste(actual.imagen);
  await pool.execute(
    'INSERT INTO auditoria (id_usuario, accion, entidad, entidad_id, detalle) VALUES (?, ?, ?, ?, ?)',
    [idUsuarioSesion, 'producto_actualizado', 'productos', id, actual.nombre]
  );
  return getByIdAdmin(id);
}

async function patchStatus(id, activo, idUsuarioSesion) {
  const actual = await getByIdAdmin(id);
  await pool.execute('UPDATE productos SET activo = ? WHERE id_producto = ?', [activo, id]);
  await pool.execute(
    'INSERT INTO auditoria (id_usuario, accion, entidad, entidad_id, detalle) VALUES (?, ?, ?, ?, ?)',
    [idUsuarioSesion, activo ? 'producto_activado' : 'producto_inactivado', 'productos', id, actual.nombre]
  );
  return getByIdAdmin(id);
}

module.exports = {
  list,
  filtros,
  getByIdPublic,
  getByIdAdmin,
  createEquipo,
  updateEquipo,
  patchStatus
};
