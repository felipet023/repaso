const request = require('supertest');
const app = require('../src/app');
const { createUser, cleanupUser, uniqueEmail } = require('./helpers');

describe('Autenticación (RF-13 a RF-16)', () => {
  test('registra un usuario válido, inicia sesión y devuelve JWT', async () => {
    const email = uniqueEmail('registro');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Prueba Registro', email, password: 'ClaveSegura1!', confirmarPassword: 'ClaveSegura1!' });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.rol).toBe('cliente');
    expect(res.body.user.email).toBe(email);
    await cleanupUser(res.body.user.id_usuario);
  });

  test('rechaza registro con contraseña débil (RF-14)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'X', email: uniqueEmail('debil'), password: '123', confirmarPassword: '123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('8 caracteres');
  });

  test('rechaza registro con correo duplicado o inválido', async () => {
    const email = uniqueEmail('dup');
    const user = await createUser({ nombre: 'Dup', email });
    const dup = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Dup', email, password: 'ClaveSegura1!', confirmarPassword: 'ClaveSegura1!' });
    expect(dup.status).toBe(409);

    const malo = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'X', email: 'no-es-correo', password: 'ClaveSegura1!', confirmarPassword: 'ClaveSegura1!' });
    expect(malo.status).toBe(400);
    await cleanupUser(user.id_usuario);
  });

  test('login válido e inválido (RF-15)', async () => {
    const email = uniqueEmail('login');
    const user = await createUser({ nombre: 'Login Test', email });

    const ok = await request(app).post('/api/auth/login').send({ email, password: 'ClaveSegura1!' });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeDefined();
    expect(ok.body.user.password).toBeUndefined();

    const mal = await request(app).post('/api/auth/login').send({ email, password: 'incorrecta' });
    expect(mal.status).toBe(401);
    await cleanupUser(user.id_usuario);
  });

  test('recuperación y restablecimiento de contraseña con token temporal (RF-16)', async () => {
    const email = uniqueEmail('reset');
    const user = await createUser({ nombre: 'Reset', email });

    const forgot = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(forgot.status).toBe(200);
    expect(forgot.body.token).toBeDefined();

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.token, password: 'NuevaClave2!', confirmarPassword: 'NuevaClave2!' });
    expect(reset.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email, password: 'NuevaClave2!' });
    expect(login.status).toBe(200);

    const tokenMalo = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'no-existe', password: 'OtraClave2!', confirmarPassword: 'OtraClave2!' });
    expect(tokenMalo.status).toBe(400);
    await cleanupUser(user.id_usuario);
  });

  test('GET /api/auth/me requiere token válido', async () => {
    const sinToken = await request(app).get('/api/auth/me');
    expect(sinToken.status).toBe(401);

    const email = uniqueEmail('me');
    const user = await createUser({ nombre: 'Me', email });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'ClaveSegura1!' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    await cleanupUser(user.id_usuario);
  });
});
