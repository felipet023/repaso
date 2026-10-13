const pool = require('../config/db');
const AppError = require('../utils/AppError');

async function listServices() {
  const [rows] = await pool.execute(
    'SELECT id_servicio, nombre, descripcion, duracion_minutos, precio_desde FROM servicios_taller ORDER BY precio_desde'
  );
  return {
    data: rows.map((row) => ({
      id: row.id_servicio,
      nombre: row.nombre,
      descripcion: row.descripcion,
      duracion_minutos: Number(row.duracion_minutos),
      precio_desde: Number(row.precio_desde)
    }))
  };
}

async function createAppointment(idUsuario, data) {
  const [servicios] = await pool.execute(
    'SELECT nombre FROM servicios_taller WHERE id_servicio = ?',
    [data.id_servicio]
  );
  if (!servicios.length) throw new AppError('Servicio de taller no encontrado', 404);

  // Impide reservar un horario ya ocupado (fecha + hora, citas no canceladas)
  const [[ocupada]] = await pool.execute(
    `SELECT id_cita FROM citas_taller
     WHERE fecha = ? AND hora = ? AND estado != 'cancelada'
     LIMIT 1`,
    [data.fecha, data.hora]
  );
  if (ocupada) throw new AppError('El horario seleccionado ya está ocupado. Elige otra hora.', 409);

  const [result] = await pool.execute(
    'INSERT INTO citas_taller (id_usuario, id_servicio, tipo_bicicleta, telefono, fecha, hora, descripcion, nombre_contacto, email_contacto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [idUsuario, data.id_servicio, data.tipo_bicicleta, data.telefono, data.fecha, data.hora, data.descripcion, data.nombre, data.email]
  );
  return getAppointment(result.insertId);
}

async function getAppointment(idCita) {
  const [rows] = await pool.execute(
    `SELECT c.id_cita, c.id_servicio, s.nombre AS servicio, c.tipo_bicicleta, c.telefono,
            c.fecha, c.hora, c.descripcion, c.estado, c.created_at,
            c.nombre_contacto AS nombre, c.email_contacto AS email
     FROM citas_taller c
     JOIN servicios_taller s ON s.id_servicio = c.id_servicio
     WHERE c.id_cita = ?`,
    [idCita]
  );
  if (!rows.length) throw new AppError('Cita no encontrada', 404);
  return { data: rows[0] };
}

async function listAppointments(idUsuario, esAdmin) {
  const [rows] = await pool.execute(
    `SELECT c.id_cita, c.fecha, c.hora, c.tipo_bicicleta, c.estado, s.nombre AS servicio,
            u.nombre AS cliente
     FROM citas_taller c
     JOIN servicios_taller s ON s.id_servicio = c.id_servicio
     JOIN usuarios u ON u.id_usuario = c.id_usuario
     ${esAdmin ? '' : 'WHERE c.id_usuario = ?'}
     ORDER BY c.fecha DESC, c.hora DESC
     LIMIT 100`,
    esAdmin ? [] : [idUsuario]
  );
  return { data: rows };
}

module.exports = { listServices, createAppointment, getAppointment, listAppointments };
