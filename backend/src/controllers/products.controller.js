const productsService = require('../services/products.service');
const validators = require('../validators/products.validator');
const AppError = require('../utils/AppError');

async function list(req, res, next) {
  try {
    const filters = validators.queryList(req.query);
    if (filters.incluirInactivos && req.user?.rol !== 'admin') {
      throw new AppError('Se requiere rol administrador para ver productos inactivos', 403);
    }
    const [lista, filtros] = await Promise.all([
      productsService.list(filters),
      productsService.filtros()
    ]);
    res.json({ ok: true, ...lista, filtros });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const id = validators.idParam(req.params);
    const esAdmin = req.user?.rol === 'admin';
    const producto = esAdmin
      ? await productsService.getByIdAdmin(id)
      : await productsService.getByIdPublic(id);
    res.json({ ok: true, data: producto });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = req.validatedBody;
    const producto = await productsService.createEquipo(data, req.file?.filename, req.user.id_usuario);
    res.status(201).json({ ok: true, data: producto });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = validators.idParam(req.params);
    const data = req.validatedBody;
    const producto = await productsService.updateEquipo(id, data, req.file?.filename, req.user.id_usuario);
    res.json({ ok: true, data: producto });
  } catch (error) {
    next(error);
  }
}

async function patchStatus(req, res, next) {
  try {
    const id = validators.idParam(req.params);
    const { activo } = req.validatedBody;
    const producto = await productsService.patchStatus(id, activo, req.user.id_usuario);
    res.json({ ok: true, data: producto });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create, update, patchStatus };
