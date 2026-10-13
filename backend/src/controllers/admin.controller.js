const adminService = require('../services/admin.service');
const exportService = require('../services/export.service');
const AppError = require('../utils/AppError');

async function listUsers(req, res, next) {
  try {
    const resultado = await adminService.listUsers({ search: req.query.search });
    res.json({ ok: true, ...resultado });
  } catch (error) {
    next(error);
  }
}

async function changeRole(req, res, next) {
  try {
    const idUsuario = Number(req.params.id);
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      throw new AppError('id de usuario inválido', 400);
    }
    const resultado = await adminService.changeRole(req.user.id_usuario, idUsuario, req.body.rol);
    res.json({ ok: true, ...resultado });
  } catch (error) {
    next(error);
  }
}

async function changeStatus(req, res, next) {
  try {
    const idUsuario = Number(req.params.id);
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      throw new AppError('id de usuario inválido', 400);
    }
    const resultado = await adminService.changeStatus(req.user.id_usuario, idUsuario, req.body.activo);
    res.json({ ok: true, ...resultado });
  } catch (error) {
    next(error);
  }
}

async function dashboard(req, res, next) {
  try {
    const datos = await adminService.dashboard(req.query);
    res.json({ ok: true, data: datos });
  } catch (error) {
    next(error);
  }
}

async function reports(req, res, next) {
  try {
    const datos = await adminService.report(req.query);
    res.json({ ok: true, data: datos });
  } catch (error) {
    next(error);
  }
}

async function exportReports(req, res, next) {
  try {
    const archivo = await exportService.exportReport(req.query);
    res.setHeader('Content-Type', archivo.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${archivo.filename}"`);
    res.send(archivo.buffer);
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, changeRole, changeStatus, dashboard, reports, exportReports };
