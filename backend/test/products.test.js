const request = require('supertest');
const app = require('../src/app');
const { createUser, createProduct, cleanupUser, cleanupProduct, uniqueEmail } = require('./helpers');

describe('Productos y catálogo (RF-01 a RF-04, RF-17 a RF-20)', () => {
  test('catálogo público sin autenticación, con filtros y ordenamiento', async () => {
    const res = await request(app).get('/api/products?limit=5&orden=precio_asc');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThanOrEqual(res.body.data.length);
    expect(res.body.filtros.categorias.length).toBeGreaterThan(0);
    expect(res.body.filtros.marcas.length).toBeGreaterThan(0);

    // Orden ascendente verificado
    const precios = res.body.data.map((p) => p.precio);
    expect([...precios].sort((a, b) => a - b)).toEqual(precios);
  });

  test('filtra por categoría y busca por marca (RF-03)', async () => {
    const res = await request(app).get('/api/products?categoria=1');
    expect(res.status).toBe(200);
    res.body.data.forEach((p) => expect(p.categoria.id).toBe(1));

    const busca = await request(app).get('/api/products?search=Trek');
    expect(busca.status).toBe(200);
    expect(busca.body.data.length).toBeGreaterThan(0);
    busca.body.data.forEach((p) => {
      const texto = `${p.nombre} ${p.marca.nombre}`.toLowerCase();
      expect(texto).toContain('trek');
    });
  });

  test('detalle público de producto activo (RF-02)', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBeTruthy();
    expect(res.body.data.precioFinal).toBeLessThanOrEqual(res.body.data.precio);
  });

  test('cliente no puede crear, editar ni cambiar estado (RNF-04)', async () => {
    const email = uniqueEmail('cliente-producto');
    const user = await createUser({ nombre: 'Cliente Producto', email });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'ClaveSegura1!' });
    const auth = { Authorization: `Bearer ${login.body.token}` };

    const crear = await request(app).post('/api/products').set(auth).send({ nombre: 'X', id_marca: 1, id_categoria: 1, precio: 1 });
    expect(crear.status).toBe(403);

    const editar = await request(app).put('/api/products/1').set(auth).send({ nombre: 'X' });
    expect(editar.status).toBe(403);

    const estado = await request(app).patch('/api/products/1/status').set(auth).send({ activo: false });
    expect(estado.status).toBe(403);

    await cleanupUser(user.id_usuario);
  });

  test('admin crea, edita, aplica descuento y cambia estado (RF-17 a RF-20)', async () => {
    const admin = await createUser({ nombre: 'Admin Test', email: uniqueEmail('admin'), rol: 'admin' });
    const login = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'ClaveSegura1!' });
    const auth = { Authorization: `Bearer ${login.body.token}` };

    // Crear
    const crear = await request(app)
      .post('/api/products')
      .set(auth)
      .send({ nombre: 'Bicicleta Test', descripcion: 'Desc', id_marca: 1, id_categoria: 2, precio: 2500000, descuento: 10, stock: 5 });
    expect(crear.status).toBe(201);
    const producto = crear.body.data;
    expect(producto.precioFinal).toBeCloseTo(2250000, 0);

    // Editar
    const editar = await request(app)
      .put(`/api/products/${producto.id}`)
      .set(auth)
      .send({ nombre: 'Bicicleta Test Editada', id_marca: 1, id_categoria: 2, precio: 2600000, descuento: 0, stock: 6 });
    expect(editar.status).toBe(200);
    expect(editar.body.data.nombre).toBe('Bicicleta Test Editada');

    // Inactivar: invisible al público, visible para admin
    await request(app).patch(`/api/products/${producto.id}/status`).set(auth).send({ activo: false });
    const publico = await request(app).get(`/api/products/${producto.id}`);
    expect(publico.status).toBe(404);
    const adminVe = await request(app).get(`/api/products/${producto.id}`).set(auth);
    expect(adminVe.status).toBe(200);

    // Reactivar
    await request(app).patch(`/api/products/${producto.id}/status`).set(auth).send({ activo: true });

    // Validaciones
    const invalido = await request(app).post('/api/products').set(auth).send({ nombre: '', precio: -5 });
    expect(invalido.status).toBe(400);

    await cleanupProduct(producto.id);
    await cleanupUser(admin.id_usuario);
  });

  test('buscar y filtrar productos como administrador', async () => {
    const admin = await createUser({ nombre: 'Admin Lista', email: uniqueEmail('adminlista'), rol: 'admin' });
    const login = await request(app).post('/api/auth/login').send({ email: admin.email, password: 'ClaveSegura1!' });
    const auth = { Authorization: `Bearer ${login.body.token}` };

    const res = await request(app).get('/api/products?incluirInactivos=true&disponible=true&rating=4.5').set(auth);
    expect(res.status).toBe(200);
    res.body.data.forEach((p) => {
      expect(p.activo).toBe(true);
      expect(p.stock).toBeGreaterThan(0);
      expect(p.rating).toBeGreaterThanOrEqual(4.5);
    });
    await cleanupUser(admin.id_usuario);
  });
});
