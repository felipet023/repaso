const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const { createUser, createProduct, cleanupUser, cleanupProduct, uniqueEmail } = require('./helpers');

describe('Pedidos y pago simulado (RF-09 a RF-12)', () => {
  let user;
  let auth;
  let producto;

  async function vaciarCarrito() {
    const carrito = await request(app).get('/api/cart').set(auth);
    for (const item of carrito.body.items || []) {
      await request(app).delete(`/api/cart/items/${item.id_producto}`).set(auth);
    }
  }

  // Cada pedido necesita productos en el carrito: el pago
  // exitoso lo vacía y crear un pedido no lo consume, así que
  // se limpia antes de cada alta para que las cantidades no se acumulen.
  async function agregarAlCarrito(cantidad = 2) {
    await vaciarCarrito();
    const res = await request(app)
      .post('/api/cart/items')
      .set(auth)
      .send({ id_producto: producto.id_producto, cantidad });
    if (res.status !== 200) throw new Error(`No se pudo agregar al carrito: ${res.body.message}`);
    return res;
  }

  beforeAll(async () => {
    user = await createUser({ nombre: 'Cliente Compras', email: uniqueEmail('compras') });
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'ClaveSegura1!' });
    auth = { Authorization: `Bearer ${login.body.token}` };
    producto = await createProduct({ nombre: 'Producto Compra', stock: 50 });
  });

  afterAll(async () => {
    await cleanupUser(user.id_usuario);
    await cleanupProduct(producto.id_producto);
  });

  test('preview muestra el resumen del carrito (RF-09)', async () => {
    await agregarAlCarrito(2);
    const res = await request(app).post('/api/orders/preview').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(Number(res.body.total)).toBe(200000);
  });

  test('preview rechaza carrito vacío', async () => {
    const otro = await createUser({ nombre: 'Vacio', email: uniqueEmail('vacio') });
    const login = await request(app).post('/api/auth/login').send({ email: otro.email, password: 'ClaveSegura1!' });
    const res = await request(app).post('/api/orders/preview').set({ Authorization: `Bearer ${login.body.token}` });
    expect(res.status).toBe(400);
    await cleanupUser(otro.id_usuario);
  });

  test('crea pedido con número único y pago aprobado actualiza inventario (RF-10, RF-11, RF-12)', async () => {
    await agregarAlCarrito(2);
    const stockAntes = (await pool.execute('SELECT stock FROM productos WHERE id_producto = ?', [producto.id_producto]))[0][0].stock;

    const crear = await request(app)
      .post('/api/orders')
      .set(auth)
      .send({ direccion: 'Calle 123 # 45-67, Bogotá' });
    expect(crear.status).toBe(201);
    const pedido = crear.body.data;
    expect(pedido.numero_pedido).toMatch(/^TK-\d{4}-[A-Z0-9]+$/);
    expect(pedido.estado).toBe('pendiente');

    const pago = await request(app)
      .post('/api/payments/simulate')
      .set(auth)
      .send({ id_pedido: pedido.id_pedido, metodo: 'tarjeta' });
    expect(pago.status).toBe(200);
    expect(pago.body.aprobado).toBe(true);
    expect(pago.body.pedido.estado).toBe('aprobado');

    const stockDespues = (await pool.execute('SELECT stock, ventas FROM productos WHERE id_producto = ?', [producto.id_producto]))[0][0];
    expect(Number(stockDespues.stock)).toBe(Number(stockAntes) - 2);
    expect(Number(stockDespues.ventas)).toBeGreaterThan(0);

    // El carrito se vació tras el pago exitoso
    const carrito = await request(app).get('/api/cart').set(auth);
    expect(carrito.body.items).toHaveLength(0);
  });

  test('genera números de pedido únicos', async () => {
    await agregarAlCarrito(1);
    const crear1 = await request(app).post('/api/orders').set(auth).send({ direccion: 'Dirección A 1' });
    await agregarAlCarrito(1);
    const crear2 = await request(app).post('/api/orders').set(auth).send({ direccion: 'Dirección B 2' });
    expect(crear1.status).toBe(201);
    expect(crear2.status).toBe(201);
    expect(crear2.body.data.numero_pedido).not.toBe(crear1.body.data.numero_pedido);
  });

  test('pago rechazado no confirma el pedido ni toca inventario', async () => {
    await agregarAlCarrito(2);
    const stockAntes = (await pool.execute('SELECT stock FROM productos WHERE id_producto = ?', [producto.id_producto]))[0][0].stock;

    const crear = await request(app).post('/api/orders').set(auth).send({ direccion: 'Dirección rechazo 1' });
    expect(crear.status).toBe(201);
    const pago = await request(app)
      .post('/api/payments/simulate')
      .set(auth)
      .send({ id_pedido: crear.body.data.id_pedido, metodo: 'tarjeta', forzarRechazo: true });
    expect(pago.status).toBe(200);
    expect(pago.body.aprobado).toBe(false);
    expect(pago.body.pedido.estado).toBe('rechazado');

    const stockDespues = (await pool.execute('SELECT stock FROM productos WHERE id_producto = ?', [producto.id_producto]))[0][0];
    expect(Number(stockDespues.stock)).toBe(Number(stockAntes));
  });

  test('rechaza pago con stock insuficiente al momento de pagar', async () => {
    // Producto con stock 2, agregar 2 al carrito, reducir stock manualmente a 1
    const productoLimitado = await createProduct({ nombre: 'Producto Limitado', stock: 2 });
    await vaciarCarrito();
    await request(app).post('/api/cart/items').set(auth).send({ id_producto: productoLimitado.id_producto, cantidad: 2 });
    await pool.execute('UPDATE productos SET stock = 1 WHERE id_producto = ?', [productoLimitado.id_producto]);

    const crear = await request(app).post('/api/orders').set(auth).send({ direccion: 'Dirección stock 1' });
    expect(crear.status).toBe(201);
    const pago = await request(app)
      .post('/api/payments/simulate')
      .set(auth)
      .send({ id_pedido: crear.body.data.id_pedido, metodo: 'tarjeta' });
    expect(pago.status).toBe(409);
    expect(pago.body.message).toContain('Stock insuficiente');

    // El pedido queda pendiente y el stock intacto
    const stock = (await pool.execute('SELECT stock FROM productos WHERE id_producto = ?', [productoLimitado.id_producto]))[0][0];
    expect(Number(stock.stock)).toBe(1);

    await cleanupProduct(productoLimitado.id_producto);
  });

  test('no se puede pagar un pedido dos veces ni ver pedidos ajenos', async () => {
    await agregarAlCarrito(1);
    const crear = await request(app).post('/api/orders').set(auth).send({ direccion: 'Dirección doble 1' });
    const idPedido = crear.body.data.id_pedido;
    await request(app).post('/api/payments/simulate').set(auth).send({ id_pedido: idPedido, metodo: 'tarjeta' });

    const doble = await request(app).post('/api/payments/simulate').set(auth).send({ id_pedido: idPedido, metodo: 'tarjeta' });
    expect(doble.status).toBe(409);
    expect(doble.body.message).toContain('ya fue procesado');

    // Pedido ajeno
    const otro = await createUser({ nombre: 'Ajeno', email: uniqueEmail('ajeno') });
    const login = await request(app).post('/api/auth/login').send({ email: otro.email, password: 'ClaveSegura1!' });
    const ajeno = await request(app).get(`/api/orders/${idPedido}`).set({ Authorization: `Bearer ${login.body.token}` });
    expect(ajeno.status).toBe(403);
    await cleanupUser(otro.id_usuario);
  });

  test('lista mis pedidos (RF-12)', async () => {
    const res = await request(app).get('/api/orders').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].numero_pedido).toBeDefined();
  });
});
