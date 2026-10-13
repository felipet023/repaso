# API — Bike Store / TUKI BIKES

Base: `http://localhost:3000/api` · Respuestas: `{ ok, message?, data?|items? }` · Errores: `{ ok: false, message }`

## Salud

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | No | Prueba de vida del servidor |

## Autenticación

| Método | Ruta | Auth | Body | Respuesta |
|--------|------|------|------|-----------|
| POST | `/api/auth/register` | No | `{ nombre, email, password, confirmarPassword }` | 201 · `{ id_usuario, user, token }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ user, token }` |
| POST | `/api/auth/forgot-password` | No | `{ email }` | `{ message, token? }` (token de demo; en producción va por email) |
| POST | `/api/auth/reset-password` | No | `{ token, password, confirmarPassword }` | `{ message }` |
| GET | `/api/auth/me` | JWT | — | `{ user }` |

**Reglas**: contraseña ≥ 8 caracteres con mayúscula, minúscula, número y carácter especial; email único y con formato válido; tokens de recuperación expiran en 1 h, se almacenan hasheados (SHA-256) y son de un solo uso.

## Productos

| Método | Ruta | Auth | Parámetros |
|--------|------|------|------------|
| GET | `/api/products` | No | `search`, `categoria`, `marca`, `min`, `max`, `disponible=true`, `rating`, `orden` (`mas_vendidos\|precio_asc\|precio_desc\|nombre_asc`), `limit`, `offset`. Devuelve también `filtros` (categorías y marcas). |
| GET | `/api/products/:id` | No (solo activos) / Admin (todos) | — |
| POST | `/api/products` | Admin | `multipart/form-data`: `nombre*`, `id_marca*`, `id_categoria*`, `precio*`, `descripcion`, `descuento` (0-100), `stock`, `imagen` (jpg/png/webp ≤ 2 MB) |
| PUT | `/api/products/:id` | Admin | Igual que POST |
| PATCH | `/api/products/:id/status` | Admin | `{ activo: boolean }` — inactiva sin borrar historial |

## Carrito (JWT requerido)

| Método | Ruta | Body | Notas |
|--------|------|------|-------|
| GET | `/api/cart` | — | `{ items[], total }` con `precioFinal` y `subtotal` por línea |
| POST | `/api/cart/items` | `{ id_producto, cantidad? }` | Suma a la línea existente; 409 si supera el stock |
| PATCH | `/api/cart/items/:id` | `{ cantidad }` | 409 si supera el stock |
| DELETE | `/api/cart/items/:id` | — | Elimina la línea |

## Pedidos y pagos (JWT requerido)

| Método | Ruta | Body | Notas |
|--------|------|------|-------|
| POST | `/api/orders/preview` | — | Resumen del carrito; 400 si está vacío |
| POST | `/api/orders` | `{ direccion }` | Crea pedido `pendiente` con número único `TK-AAAA-…` |
| POST | `/api/payments/simulate` | `{ id_pedido, metodo: tarjeta\|transferencia\|efectivo, forzarRechazo? }` | **Simulación**: si aprueba (transacción ACID) marca el pedido `aprobado`, descuenta stock, incrementa `ventas` y vacía el carrito; si rechaza, marca `rechazado` sin tocar inventario. 409 si el stock es insuficiente o el pedido ya fue procesado. |
| GET | `/api/orders` | — | Pedidos del usuario (admin: todos) |
| GET | `/api/orders/:id` | — | Detalle con `items`; 403 si es ajeno |

## Taller

| Método | Ruta | Auth | Notas |
|--------|------|------|-------|
| GET | `/api/workshop/services` | No | 4 servicios con duración y precio desde |
| POST | `/api/workshop/appointments` | JWT | `{ id_servicio, tipo_bicicleta, telefono, fecha (AAAA-MM-DD), hora (HH:MM 08:00-18:00), nombre, email, descripcion? }` · 409 si fecha+hora ya está ocupada |
| GET | `/api/workshop/appointments` | JWT | Propias (admin: todas) |

## Contacto

| Método | Ruta | Auth | Body |
|--------|------|------|------|
| POST | `/api/contact` | No | `{ nombre, email, mensaje (≥ 10 caracteres) }` |

## Administración (rol admin, JWT requerido)

| Método | Ruta | Parámetros / Body |
|--------|------|-------------------|
| GET | `/api/admin/users` | `search` |
| PATCH | `/api/admin/users/:id/role` | `{ rol: admin\|cliente }` — no propio, mínimo un admin activo |
| PATCH | `/api/admin/users/:id/status` | `{ activo: boolean }` — no propio; la sesión del afectado expira al instante |
| GET | `/api/admin/dashboard` | `desde`, `hasta`, `categoria` → ventas totales, pedidos, top 5 más vendidos, alertas de inventario (≤ 5), pedidos recientes |
| GET | `/api/admin/reports` | `desde`, `hasta`, `categoria` → resumen, ventas por categoría, productos estrella |
| GET | `/api/admin/reports/export` | `formato=excel\|pdf` + mismos filtros → descarga de archivo |

## Reglas de seguridad

- JWT con expiración (por defecto 2 h) en `Authorization: Bearer <token>`.
- El usuario se recarga desde la BD en cada petición autenticada: cambios de rol y desactivaciones surten efecto inmediato.
- Todas las consultas usan parámetros (`mysql2` `execute`); el ordenamiento usa lista blanca.
- Imágenes: solo jpg/png/webp ≤ 2 MB, nombre aleatorio en `uploads/products/`.
- El pago es explícitamente simulado: nunca se reciben ni almacenan datos reales de tarjetas.
