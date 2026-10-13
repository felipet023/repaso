const AppError = require('../utils/AppError');
const { positiveInt } = require('../utils/validators');

const TIPOS_BICICLETA = ['Carretera', 'Montaña', 'E-bike', 'Urbana', 'Plegable'];
const TELEFONO_RE = /^[+()\-.\s\d]{7,20}$/;

function createAppointment(body) {
  const data = body || {};
  const errors = [];

  const idServicio = positiveInt(data.id_servicio);
  if (idServicio === null) errors.push('id_servicio es obligatorio');

  const tipoBicicleta = String(data.tipo_bicicleta || '').trim();
  if (!TIPOS_BICICLETA.includes(tipoBicicleta)) errors.push('tipo de bicicleta inválido');

  const telefono = String(data.telefono || '').trim();
  if (!TELEFONO_RE.test(telefono)) errors.push('el teléfono es inválido');

  const nombre = String(data.nombre || '').trim();
  if (!nombre) errors.push('el nombre es obligatorio');

  const email = String(data.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('el correo electrónico es inválido');

  // Fecha: debe ser una fecha válida y no anterior a hoy
  let fecha = null;
  if (typeof data.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.fecha)) {
    fecha = new Date(`${data.fecha}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (Number.isNaN(fecha.getTime()) || fecha < hoy) errors.push('la fecha no puede ser anterior a hoy');
  } else {
    errors.push('la fecha es obligatoria (formato AAAA-MM-DD)');
  }

  // Hora: formato HH:MM entre 08:00 y 18:00
  let hora = null;
  if (typeof data.hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(data.hora)) {
    const horaNum = Number(data.hora.split(':')[0]);
    if (horaNum < 8 || horaNum > 18) errors.push('el horario del taller es de 08:00 a 18:00');
    else hora = data.hora;
  } else {
    errors.push('la hora es obligatoria (formato HH:MM)');
  }

  const descripcion = data.descripcion ? String(data.descripcion).trim().slice(0, 500) : null;

  if (errors.length) throw new AppError(errors.join('. '), 400);
  return {
    id_servicio: idServicio,
    tipo_bicicleta: tipoBicicleta,
    telefono,
    nombre,
    email,
    fecha: data.fecha,
    hora,
    descripcion
  };
}

module.exports = { createAppointment };
