const request = require('supertest');
const app = require('../src/app');
const { createUser, cleanupUser, cleanupAppointment, uniqueEmail } = require('./helpers');

describe('Taller y contacto (RF: agenda de taller)', () => {
  let user;
  let auth;

  beforeAll(async () => {
    user = await createUser({ nombre: 'Cliente Taller', email: uniqueEmail('taller') });
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'ClaveSegura1!' });
    auth = { Authorization: `Bearer ${login.body.token}` };
  });

  afterAll(async () => {
    await cleanupUser(user.id_usuario);
  });

  test('servicios del taller visibles sin autenticación', async () => {
    const res = await request(app).get('/api/workshop/services');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data[0]).toMatchObject({ nombre: expect.any(String), duracion_minutos: expect.any(Number) });
  });

  test('agenda una cita válida', async () => {
    const manana = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    const res = await request(app)
      .post('/api/workshop/appointments')
      .set(auth)
      .send({
        id_servicio: 1,
        tipo_bicicleta: 'Montaña',
        telefono: '+57 300 123 4567',
        fecha: manana,
        hora: '10:00',
        nombre: user.nombre,
        email: user.email,
        descripcion: 'La cadena hace ruido'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.estado).toBe('pendiente');
    await cleanupAppointment(res.body.data.id_cita);
  });

  test('impide reservar un horario ocupado', async () => {
    const manana = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);
    const datos = {
      id_servicio: 2,
      tipo_bicicleta: 'Carretera',
      telefono: '3001234567',
      fecha: manana,
      hora: '14:00',
      nombre: user.nombre,
      email: user.email
    };
    const primera = await request(app).post('/api/workshop/appointments').set(auth).send(datos);
    expect(primera.status).toBe(201);

    const segunda = await request(app).post('/api/workshop/appointments').set(auth).send(datos);
    expect(segunda.status).toBe(409);
    expect(segunda.body.message).toContain('ocupado');

    await cleanupAppointment(primera.body.data.id_cita);
  });

  test('valida campos: fecha pasada y hora fuera de horario', async () => {
    const pasada = '2020-01-01';
    const res = await request(app)
      .post('/api/workshop/appointments')
      .set(auth)
      .send({ id_servicio: 1, tipo_bicicleta: 'Urbana', telefono: '3001234567', fecha: pasada, hora: '10:00', nombre: 'X', email: user.email });
    expect(res.status).toBe(400);

    const res2 = await request(app)
      .post('/api/workshop/appointments')
      .set(auth)
      .send({ id_servicio: 1, tipo_bicicleta: 'Urbana', telefono: '3001234567', fecha: '2099-01-01', hora: '23:00', nombre: 'X', email: user.email });
    expect(res2.status).toBe(400);
  });

  test('requiere autenticación para agendar y lista las citas propias', async () => {
    const sinToken = await request(app).post('/api/workshop/appointments').send({});
    expect(sinToken.status).toBe(401);

    const res = await request(app).get('/api/workshop/appointments').set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('formulario de contacto valida y acepta mensajes', async () => {
    const valido = await request(app)
      .post('/api/contact')
      .send({ nombre: 'Contacto Test', email: 'contacto@test.local', mensaje: 'Tengo una duda sobre garantías' });
    expect(valido.status).toBe(201);

    const invalido = await request(app)
      .post('/api/contact')
      .send({ nombre: '', email: 'no-correo', mensaje: 'corto' });
    expect(invalido.status).toBe(400);
  });
});
