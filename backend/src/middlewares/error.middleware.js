const AppError = require('../utils/AppError');

function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.status).json({ ok: false, message: error.message });
  }
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ ok: false, message: 'La imagen no puede superar 2MB' });
  }
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, message: 'El cuerpo de la solicitud no es válido' });
  }
  console.error(error);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
}
module.exports = errorHandler;
