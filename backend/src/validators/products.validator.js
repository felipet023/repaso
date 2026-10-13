const AppError = require('../utils/AppError');
const { positiveInt, nonNegativeInt, finiteNumber } = require('../utils/validators');

const ORDENES_PERMITIDOS = ['mas_vendidos', 'precio_asc', 'precio_desc', 'nombre_asc'];

function requireString(value, campo, maximo = 120) {
  if (value == null || !String(value).trim()) throw new AppError(`${campo} es obligatorio`, 400);
  const texto = String(value).trim();
  if (texto.length > maximo) throw new AppError(`${campo} no puede superar ${maximo} caracteres`, 400);
  return texto;
}

function parseBody(body) {
  const data = {};
  if (body.nombre !== undefined) data.nombre = requireString(body.nombre, 'nombre');
  if (body.descripcion !== undefined) {
    data.descripcion = body.descripcion ? String(body.descripcion).trim().slice(0, 1000) : null;
  }
  if (body.precio !== undefined) {
    const precio = finiteNumber(body.precio);
    if (precio === null || precio <= 0) throw new AppError('el precio debe ser un número mayor que cero', 400);
    data.precio = precio;
  }
  if (body.descuento !== undefined) {
    const descuento = finiteNumber(body.descuento);
    if (descuento === null || descuento < 0 || descuento > 100) {
      throw new AppError('el descuento debe estar entre 0 y 100', 400);
    }
    data.descuento = descuento;
  }
  if (body.stock !== undefined) {
    const stock = nonNegativeInt(body.stock);
    if (stock === null) throw new AppError('la existencia debe ser un número entero mayor o igual a 0', 400);
    data.stock = stock;
  }
  if (body.id_marca !== undefined) {
    const idMarca = positiveInt(body.id_marca);
    if (idMarca === null) throw new AppError('id_marca debe ser un número entero positivo', 400);
    data.id_marca = idMarca;
  }
  if (body.id_categoria !== undefined) {
    const idCategoria = positiveInt(body.id_categoria);
    if (idCategoria === null) throw new AppError('id_categoria debe ser un número entero positivo', 400);
    data.id_categoria = idCategoria;
  }
  return data;
}

function create(body) {
  const data = parseBody(body || {});
  if (!data.nombre) throw new AppError('nombre es obligatorio', 400);
  if (!data.id_marca) throw new AppError('id_marca es obligatorio', 400);
  if (!data.id_categoria) throw new AppError('id_categoria es obligatorio', 400);
  if (data.precio === undefined) throw new AppError('precio es obligatorio', 400);
  return data;
}

function update(body) {
  const data = parseBody(body || {});
  if (!Object.keys(data).length) throw new AppError('No se enviaron campos para actualizar', 400);
  return data;
}

function idParam(params) {
  const id = positiveInt(params && params.id);
  if (id === null) throw new AppError('id de producto inválido', 400);
  return id;
}

function status(body) {
  if (typeof (body || {}).activo !== 'boolean') {
    throw new AppError('activo debe ser true o false', 400);
  }
  return { activo: body.activo };
}

function queryList(query) {
  const q = query || {};
  const result = {
    search: typeof q.search === 'string' && q.search.trim() ? q.search.trim().slice(0, 80) : null,
    categoria: positiveInt(q.categoria),
    marca: positiveInt(q.marca),
    min: finiteNumber(q.min),
    max: finiteNumber(q.max),
    disponible: q.disponible === 'true' || q.disponible === '1',
    rating: finiteNumber(q.rating),
    orden: ORDENES_PERMITIDOS.includes(q.orden) ? q.orden : 'mas_vendidos',
    limit: Math.min(nonNegativeInt(q.limit) ?? 20, 100),
    offset: nonNegativeInt(q.offset) ?? 0,
    incluirInactivos: q.incluirInactivos === 'true' || q.incluirInactivos === '1'
  };
  if (result.min !== null && result.min < 0) throw new AppError('el precio mínimo no puede ser negativo', 400);
  if (result.max !== null && result.max < 0) throw new AppError('el precio máximo no puede ser negativo', 400);
  if (result.min !== null && result.max !== null && result.min > result.max) {
    throw new AppError('el precio mínimo no puede ser mayor que el máximo', 400);
  }
  if (result.rating !== null && (result.rating < 0 || result.rating > 5)) {
    throw new AppError('la valoración debe estar entre 0 y 5', 400);
  }
  return result;
}

module.exports = { create, update, idParam, status, queryList };
