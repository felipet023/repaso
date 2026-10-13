const request = require('supertest');
const app = require('../src/app');
const { createUser, cleanupUser, uniqueEmail } = require('./helpers');

describe('Administración (RF-21 a RF-31)', () => {
  let admin;
  let adminAuth;
  let cliente;
  let clienteAuth;

  beforeAll(async () => {
    admin = await createUser({ nombre: 'Admin Panel', email: uniqueEmail('adminpanel'), rol: 'admin' });
    const loginAdmin = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'ClaveSegura1!' });
    adminAuth = { Authorization: `Bearer ${loginAdmin.body.token}` };

    cliente = await createUser({ nombre: 'Cliente Panel', email: uniqueEmail('clientepanel') });
    const loginCliente = await request(app).post('/api/auth/login').send({ email: cliente.email, password: 'ClaveSegura1!' });
    clienteAuth = { Authorization: `Bearer ${loginCliente.body.token}` };
  });

  afterAll(async () => {
    await cleanupUser(admin.id_usuario);
    await cleanupUser(cliente.id_usuario);
  });

  test('cliente no accede a endpoints de administración (RNF-04)', async () => {
    const endpoints = [
      ['get', '/api/admin/users'],
      ['get', '/api/admin/dashboard'],
      ['get', '/api/admin/reports'],
      ['get', '/api/admin/reports/export']
    ];
    for (const [metodo, url] of endpoints) {
      const res = await request(app)[metodo](url).set(clienteAuth);
      expect(res.status).toBe(403);
    }
    const patch = await request(app).patch(`/api/admin/users/${cliente.id_usuario}/role`).set(clienteAuth).send({ rol: 'admin' });
    expect(patch.status).toBe(403);
  });

  test('lista y busca usuarios (RF-27, RF-28)', async () => {
    const res = await request(app).get('/api/admin/users').set(adminAuth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(1);

    const busca = await request(app).get(`/api/admin/users?search=${encodeURIComponent(cliente.email)}`).set(adminAuth);
    expect(busca.body.data.some((u) => u.id_usuario === cliente.id_usuario)).toBe(true);
  });

  test('asigna roles con reglas de seguridad (RF-29)', async () => {
    // Promover a admin
    const promover = await request(app).patch(`/api/admin/users/${cliente.id_usuario}/role`).set(adminAuth).send({ rol: 'admin' });
    expect(promover.status).toBe(200);

    // No puede cambiarse a sí mismo
    const propio = await request(app).patch(`/api/admin/users/${admin.id_usuario}/role`).set(adminAuth).send({ rol: 'cliente' });
    expect(propio.status).toBe(400);

    // Rol inválido
    const invalido = await request(app).patch(`/api/admin/users/${cliente.id_usuario}/role`).set(adminAuth).send({ rol: 'superuser' });
    expect(invalido.status).toBe(400);

    // Volver a cliente
    await request(app).patch(`/api/admin/users/${cliente.id_usuario}/role`).set(adminAuth).send({ rol: 'cliente' });
  });

  test('activa/desactiva cuentas y la desactivación bloquea el acceso (RF-30, RF-31)', async () => {
    // No puede desactivarse a sí mismo
    const propio = await request(app).patch(`/api/admin/users/${admin.id_usuario}/status`).set(adminAuth).send({ activo: false });
    expect(propio.status).toBe(400);

    const desactivar = await request(app).patch(`/api/admin/users/${cliente.id_usuario}/status`).set(adminAuth).send({ activo: false });
    expect(desactivar.status).toBe(200);

    // El token del cliente desactivado deja de funcionar
    const conToken = await request(app).get('/api/auth/me').set(clienteAuth);
    expect(conToken.status).toBe(401);

    const activar = await request(app).patch(`/api/admin/users/${cliente.id_usuario}/status`).set(adminAuth).send({ activo: true });
    expect(activar.status).toBe(200);
  });

  test('dashboard con ventas, más vendidos, alertas y pedidos recientes (RF-21 a RF-23)', async () => {
    const res = await request(app).get('/api/admin/dashboard').set(adminAuth);
    expect(res.status).toBe(200);
    expect(res.body.data.resumen).toHaveProperty('ventas_totales');
    expect(res.body.data.resumen).toHaveProperty('total_pedidos');
    expect(Array.isArray(res.body.data.productos_mas_vendidos)).toBe(true);
    expect(Array.isArray(res.body.data.alertas_inventario)).toBe(true);
    expect(Array.isArray(res.body.data.pedidos_recientes)).toBe(true);
  });

  test('dashboard filtra por fechas y categoría (RF-25)', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard?desde=2020-01-01&hasta=2099-12-31&categoria=1')
      .set(adminAuth);
    expect(res.status).toBe(200);
  });

  test('reportes con filtros (RF-24, RF-26)', async () => {
    const res = await request(app)
      .get('/api/admin/reports?desde=2020-01-01&hasta=2099-12-31')
      .set(adminAuth);
    expect(res.status).toBe(200);
    expect(res.body.data.resumen).toHaveProperty('ventas_totales');
    expect(Array.isArray(res.body.data.ventas_por_categoria)).toBe(true);
    expect(Array.isArray(res.body.data.productos_estrella)).toBe(true);
  });

  test('exporta informes en Excel y PDF (RF-26)', async () => {
    const excel = await request(app)
      .get('/api/admin/reports/export?formato=excel')
      .set(adminAuth);
    expect(excel.status).toBe(200);
    expect(excel.headers['content-type']).toContain('spreadsheetml');
    expect(excel.headers['content-disposition']).toContain('reporte-bike-store.xlsx');

    const pdf = await request(app)
      .get('/api/admin/reports/export?formato=pdf')
      .set(adminAuth);
    expect(pdf.status).toBe(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');
  });

  test('auditoría registra cambios de rol y estado (RF-31)', async () => {
    await request(app).patch(`/api/admin/users/${cliente.id_usuario}/role`).set(adminAuth).send({ rol: 'admin' });
    await request(app).patch(`/api/admin/users/${cliente.id_usuario}/role`).set(adminAuth).send({ rol: 'cliente' });

    const [rows] = await require('../src/config/db').execute(
      "SELECT * FROM auditoria WHERE entidad = 'usuarios' AND entidad_id = ? ORDER BY id DESC LIMIT 2",
      [cliente.id_usuario]
    );
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows.some((fila) => fila.accion === 'cambio_rol')).toBe(true);
  });
});
