const request = require('supertest');
const app = require('../src/app');
const { createUser, createProduct, cleanupUser, cleanupProduct, uniqueEmail } = require('./helpers');

describe('Carrito (RF-05 a RF-08)', () => {
  let user;
  let token;
  let auth;
  let producto;

  beforeAll(async () => {
    user = await createUser({ nombre: 'Cliente Carrito', email: uniqueEmail('carrito') });
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'ClaveSegura1!' });
    token = login.body.token;
    auth = { Authorization: `Bearer ${token}` };
    producto = await createProduct({ nombre: 'Producto Carrito', stock: 5 });
  });

  afterAll(async () => {
    await cleanupUser(user.id_usuario);
    await cleanupProduct(producto.id_producto);
  });

  test('requiere autenticación', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  test('agrega al carrito y calcula totales (RF-05, RF-06)', async () => {
    const res = await request(app).post('/api/cart/items').set(auth).send({ id_producto: producto.id_producto, cantidad: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].cantidad).toBe(2);
    // precio 100000 sin descuento → subtotal 200000
    expect(Number(res.body.items[0].subtotal)).toBe(200000);
    expect(Number(res.body.total)).toBe(200000);
  });

  test('aumenta cantidad del mismo producto', async () => {
    const res = await request(app).post('/api/cart/items').set(auth).send({ id_producto: producto.id_producto, cantidad: 1 });
    expect(res.status).toBe(200);
    expect(res.body.items[0].cantidad).toBe(3);
  });

  test('impide cantidad mayor al inventario (RF-07)', async () => {
    const res = await request(app).post('/api/cart/items').set(auth).send({ id_producto: producto.id_producto, cantidad: 10 });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('disponibles');
  });

  test('modifica cantidad y elimina producto (RF-07, RF-08)', async () => {
    const mod = await request(app)
      .patch(`/api/cart/items/${producto.id_producto}`)
      .set(auth)
      .send({ cantidad: 1 });
    expect(mod.status).toBe(200);
    expect(mod.body.items[0].cantidad).toBe(1);

    const del = await request(app).delete(`/api/cart/items/${producto.id_producto}`).set(auth);
    expect(del.status).toBe(200);
    expect(del.body.items).toHaveLength(0);
    expect(Number(del.body.total)).toBe(0);
  });

  test('persiste el carrito del usuario (RF-08)', async () => {
    await request(app).post('/api/cart/items').set(auth).send({ id_producto: producto.id_producto, cantidad: 2 });
    // Nueva "sesión": login de nuevo y consulta
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'ClaveSegura1!' });
    const res = await request(app).get('/api/cart').set({ Authorization: `Bearer ${login.body.token}` });
    expect(res.status).toBe(200);
    expect(res.body.items[0].cantidad).toBe(2);
  });
});
