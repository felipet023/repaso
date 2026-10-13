# Matriz de trazabilidad — Requisitos funcionales

Cada RF indica: descripción · endpoint(s) backend · componente/página frontend · prueba automatizada.

## Catálogo

| RF | Requisito | Endpoint(s) | Frontend | Prueba |
|----|-----------|-------------|----------|--------|
| RF-01 | Consulta pública del catálogo (sin sesión) | `GET /api/products` | `CatalogPage.jsx`, `HomePage.jsx` | `products.test.js` — "catálogo público sin autenticación" |
| RF-02 | Datos del producto: imagen, nombre, marca, categoría, precio, descuento, valoración, disponibilidad | `GET /api/products/:id` | `ProductDetailPage.jsx`, `ProductCard.jsx` | `products.test.js` — "detalle público de producto activo" |
| RF-03 | Filtrar por categoría, marca, precio, disponibilidad y valoración; buscar por nombre/marca | `GET /api/products?categoria=&marca=&min=&max=&disponible=&rating=&search=` | `ProductFilters.jsx`, `CatalogPage.jsx` | `products.test.js` — "filtra por categoría y busca por marca" |
| RF-04 | Ordenar por más vendidos, precio ↑↓ y nombre A-Z | `GET /api/products?orden=` | `ProductFilters.jsx` | `products.test.js` — orden `precio_asc` verificado |

## Carrito

| RF | Requisito | Endpoint(s) | Frontend | Prueba |
|----|-----------|-------------|----------|--------|
| RF-05 | Agregar al carrito desde catálogo y detalle | `POST /api/cart/items` | `ProductCard.jsx`, `ProductDetailPage.jsx`, `CartContext.jsx` | `cart.test.js` — "agrega al carrito y calcula totales" |
| RF-06 | Mostrar productos, cantidad, precio parcial y total | `GET /api/cart` | `CartPage.jsx`, `Navbar.jsx` (badge) | `cart.test.js` — totales exactos |
| RF-07 | Aumentar, disminuir, eliminar; sin exceder inventario | `PATCH /api/cart/items/:id`, `DELETE /api/cart/items/:id` | `CartPage.jsx` | `cart.test.js` — "impide cantidad mayor al inventario" |
| RF-08 | Carrito asociado al cliente y recuperable | `GET /api/cart` (JWT) | `CartContext.jsx` (recarga al loguearse) | `cart.test.js` — "persiste el carrito del usuario" |

## Compras y pago simulado

| RF | Requisito | Endpoint(s) | Frontend | Prueba |
|----|-----------|-------------|----------|--------|
| RF-09 | Resumen previo de la compra | `POST /api/orders/preview` | `CheckoutPage.jsx` | `orders.test.js` — "preview muestra el resumen" |
| RF-10 | Número único de pedido | `POST /api/orders` (`TK-AAAA-…`) | `CheckoutPage.jsx`, `OrderConfirmationPage.jsx` | `orders.test.js` — formato y unicidad |
| RF-11 | Pago simulado aprobado/rechazado; confirma solo si es exitoso | `POST /api/payments/simulate` | `CheckoutPage.jsx` | `orders.test.js` — aprobado y rechazado |
| RF-12 | Actualiza inventario tras compra exitosa; página de confirmación | `POST /api/payments/simulate` (transacción) | `OrderConfirmationPage.jsx` | `orders.test.js` — stock decrementado, carrito vacío |

## Usuarios

| RF | Requisito | Endpoint(s) | Frontend | Prueba |
|----|-----------|-------------|----------|--------|
| RF-13 | Registro con nombre, correo, contraseña y confirmación | `POST /api/auth/register` | `RegisterPage.jsx` | `auth.test.js` — "registra un usuario válido" |
| RF-14 | Validación de correo único/formato y contraseña segura | validadores + servicio | `RegisterPage.jsx` (pistas en vivo) | `auth.test.js` — contraseña débil, correo duplicado |
| RF-15 | Login con correo y contraseña; redirección por rol | `POST /api/auth/login` | `LoginPage.jsx` | `auth.test.js` — "login válido e inválido" |
| RF-16 | Recuperación con token temporal (1 h, hash SHA-256, un solo uso) | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` | `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx` | `auth.test.js` — flujo completo + token inválido |

## Administración de productos

| RF | Requisito | Endpoint(s) | Frontend | Prueba |
|----|-----------|-------------|----------|--------|
| RF-17 | Crear productos | `POST /api/products` (admin) | `ProductFormPage.jsx` | `products.test.js` — "admin crea…" |
| RF-18 | Editar nombre, marca, categoría, descripción, imagen, precio, existencia; descuentos | `PUT /api/products/:id` | `ProductFormPage.jsx` | `products.test.js` — edición y descuento |
| RF-19 | Inactivar sin borrar historial | `PATCH /api/products/:id/status` | `AdminProductsPage.jsx` | `products.test.js` — invisible al público, visible al admin |
| RF-20 | Buscar y filtrar productos (admin) | `GET /api/products?incluirInactivos=&search=&disponible=&rating=` | `AdminProductsPage.jsx` | `products.test.js` — "buscar y filtrar como administrador" |

## Dashboard e informes

| RF | Requisito | Endpoint(s) | Frontend | Prueba |
|----|-----------|-------------|----------|--------|
| RF-21 | Ventas totales | `GET /api/admin/dashboard` | `AdminReportsPage.jsx` | `admin.test.js` — "dashboard con ventas…" |
| RF-22 | Productos más vendidos | `GET /api/admin/dashboard` (top 5) | `AdminReportsPage.jsx` | `admin.test.js` |
| RF-23 | Alertas de inventario bajo y pedidos recientes | `GET /api/admin/dashboard` | `AdminReportsPage.jsx` | `admin.test.js` |
| RF-24 | Informes por categoría y productos estrella | `GET /api/admin/reports` | `AdminReportsPage.jsx` | `admin.test.js` — "reportes con filtros" |
| RF-25 | Filtros por fechas y categorías | `?desde=&hasta=&categoria=` en dashboard/reports | `AdminReportsPage.jsx` | `admin.test.js` — "dashboard filtra por fechas" |
| RF-26 | Exportar en Excel y PDF | `GET /api/admin/reports/export?formato=excel\|pdf` | `AdminReportsPage.jsx` | `admin.test.js` — content-type xlsx/pdf verificado |

## Administración de usuarios

| RF | Requisito | Endpoint(s) | Frontend | Prueba |
|----|-----------|-------------|----------|--------|
| RF-27 | Consultar listado de usuarios | `GET /api/admin/users` | `AdminUsersPage.jsx` | `admin.test.js` — "lista y busca usuarios" |
| RF-28 | Buscar usuarios | `GET /api/admin/users?search=` | `AdminUsersPage.jsx` | `admin.test.js` |
| RF-29 | Asignar roles (con protección de último admin y auto-rol) | `PATCH /api/admin/users/:id/role` | `AdminUsersPage.jsx` | `admin.test.js` — "asigna roles con reglas de seguridad" |
| RF-30 | Activar/desactivar cuentas (bloquea sesiones existentes) | `PATCH /api/admin/users/:id/status` | `AdminUsersPage.jsx` | `admin.test.js` — token inválido tras desactivar |
| RF-31 | Control de acceso por rol + auditoría de cambios | middlewares `authenticate`/`authorize` + tabla `auditoria` | `AdminRoute.jsx` (UX; el backend es la barrera) | `admin.test.js` — 403 para cliente + registros en `auditoria` |

## Taller y contacto

| RF | Requisito | Endpoint(s) | Frontend | Prueba |
|----|-----------|-------------|----------|--------|
| — | Servicios del taller públicos (4 servicios con duración y precio) | `GET /api/workshop/services` | `WorkshopPage.jsx`, `HomePage.jsx` | `workshop.test.js` |
| — | Agendar cita con validación y horarios ocupados | `POST /api/workshop/appointments` | `AppointmentPage.jsx` | `workshop.test.js` — 409 horario ocupado, 400 fecha pasada |
| — | Formulario de contacto validado | `POST /api/contact` | `ContactPage.jsx` | `workshop.test.js` — acepta/valida mensajes |

## Flujos E2E mínimos verificados

1. Visitante abre inicio, navega al catálogo y filtra por categoría → `HomePage`, `CatalogPage`, `GET /api/products?categoria=…`
2. Cliente se registra e inicia sesión → `POST /api/auth/register` (devuelve JWT) → `POST /api/auth/login`
3. Cliente agrega producto, modifica cantidades y revisa el total → `CartPage` + `PATCH /api/cart/items/:id`
4. Cliente paga (simulado) y consulta la confirmación → `POST /api/orders` + `POST /api/payments/simulate` → `/pedido/:id/confirmacion`
5. Administrador crea y actualiza un producto → `POST/PUT /api/products`
6. Administrador desactiva una cuenta → `PATCH /api/admin/users/:id/status` (sesión muere al instante)
7. Administrador consulta y exporta un informe → `GET /api/admin/reports` + `/export`
8. Cliente agenda cita de taller → `POST /api/workshop/appointments`
