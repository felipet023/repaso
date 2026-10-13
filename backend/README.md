# Bike Store / TUKI BIKES — Backend

API REST para la tienda de bicicletas y accesorios: catálogo público, carrito por usuario, pedidos con **pago simulado**, taller con citas, contacto, autenticación JWT con roles `admin`/`cliente` y panel de administración (usuarios, dashboard, reportes Excel/PDF).

Stack: Express 5 (CommonJS), MySQL 8+ con `mysql2` (consultas parametrizadas, sin ORM), `bcrypt`, `jsonwebtoken`, `multer`, `exceljs`, `pdfkit`. Pruebas con **Vitest + supertest** contra la base real.

## Requisitos

- Node.js 20+
- MySQL 8+ corriendo localmente

## 1. Base de datos

El esquema fuente es `../sql/bike-store.sql` (crea la base **`bike_store`**, tablas, índices, FKs y 10 productos + 4 servicios de taller semilla). Aplica de una de estas formas:

```bash
# Opción A: desde la carpeta backend (usa las credenciales de tu .env)
node scripts/apply-sql.js

# Opción B: con el cliente mysql
mysql -u root -p < ../sql/bike-store.sql
```

> El script es **destructivo por diseño**: hace `DROP TABLE IF EXISTS` y recrea todo desde cero. Ideal para reiniciar el entorno de desarrollo.

## 2. Variables de entorno

```bash
cp .env.example .env
```

El proceso **sale de inmediato** si faltan `DB_HOST`, `DB_USER`, `DB_NAME` o `JWT_SECRET`. Variables opcionales:

- `ADMIN_*` — crea el usuario administrador al arrancar si no existe (idempotente).
- `DEMO_*` — crea un cliente de demostración al arrancar si no existe (idempotente).

Usuarios por defecto (`backend/.env.example`):

| Rol     | Email                    | Contraseña      |
|---------|--------------------------|-----------------|
| admin   | `admin@bike-store.local` | `AdminDemo2026!` |
| cliente | `cliente@bike-store.local` | `ClienteDemo2026!` |

## 3. Instalar y ejecutar

```bash
npm install
npm run dev        # nodemon, http://localhost:3000
# o: npm start
```

Verificación rápida: `GET http://localhost:3000/api/health` → `{ ok: true, message: 'Bike Store API funcional' }`

## 4. Pruebas

```bash
npm test    # Vitest: auth, products, cart, orders, payments, admin, workshop
```

Los tests requieren MySQL arriba con el esquema aplicado (usan la base real, crean y limpian sus propios datos).

## Rutas

Todas bajo `/api`.

### Auth — `/api/auth`
| Método | Ruta              | Acceso  | Descripción |
|--------|-------------------|---------|-------------|
| POST   | `/register`       | público | Registro (siempre crea `cliente`) |
| POST   | `/login`          | público | Login, devuelve JWT 2h |
| POST   | `/forgot-password`| público | Genera token de recuperación |
| POST   | `/reset-password` | público | Restablece contraseña con token |
| GET    | `/me`             | JWT     | Perfil del usuario actual |

Validaciones: email único y formato; contraseña ≥ 8 caracteres con mayúscula, minúscula, número y carácter especial.

### Catálogo — `/api/products`
| Método | Ruta            | Acceso        | Descripción |
|--------|-----------------|---------------|-------------|
| GET    | `/`             | público       | Lista con búsqueda, filtros (categoría, marca, precio, disponibilidad, rating) y orden (más vendidos, precio, nombre) |
| GET    | `/:id`          | público       | Detalle de producto |
| POST   | `/`             | **admin**     | Crea producto (multipart, imagen opcional) |
| PUT    | `/:id`          | **admin**     | Actualiza producto |
| PATCH  | `/:id/status`   | **admin**     | Activa/desactiva producto |

### Carrito — `/api/cart` (requiere JWT)
| Método | Ruta         | Descripción |
|--------|--------------|-------------|
| GET    | `/`          | Carrito con subtotales y total |
| POST   | `/items`     | Agrega producto (acumula; rechaza si excede stock) |
| PATCH  | `/items/:id` | Cambia cantidad |
| DELETE | `/items/:id` | Quita producto |

### Pedidos y pago — `/api/orders` y `/api/payments` (requieren JWT)
| Método | Ruta                  | Descripción |
|--------|-----------------------|-------------|
| POST   | `/orders/preview`     | Resumen del carrito antes de crear el pedido |
| POST   | `/orders`             | Crea pedido `pendiente` con número único `TK-AAAA-XXXX` |
| GET    | `/orders`             | Mis pedidos |
| GET    | `/orders/:id`         | Detalle de un pedido propio (403 si es ajeno) |
| POST   | `/payments/simulate`  | **Pago simulado**: aprobado/rechazado; al aprobar descuenta stock y vacía el carrito (transacción `FOR UPDATE`) |

> El pago es **100 % simulado**: la API nunca recibe ni almacena datos reales de tarjetas. Existe `forzarRechazo` para pruebas.

### Taller — `/api/workshop`
| Método | Ruta           | Acceso  | Descripción |
|--------|----------------|---------|-------------|
| GET    | `/services`    | público | Servicios de taller |
| POST   | `/appointments`| JWT     | Agenda cita (valida horarios ocupados server-side) |
| GET    | `/appointments`| JWT     | Mis citas |

### Contacto — `/api/contact`
| Método | Ruta | Acceso  | Descripción |
|--------|------|---------|-------------|
| POST   | `/`  | público | Envía mensaje de contacto |

### Administración — `/api/admin` (exige JWT + rol `admin`, verificado server-side)
| Método | Ruta                  | Descripción |
|--------|-----------------------|-------------|
| GET    | `/users`              | Lista/busca usuarios |
| PATCH  | `/users/:id/role`     | Cambia rol (no a sí mismo) |
| PATCH  | `/users/:id/status`   | Activa/desactiva (bloquea acceso; no a sí mismo) |
| GET    | `/dashboard`          | Ventas, más vendidos, alertas de inventario, pedidos recientes (filtros `desde`, `hasta`, `categoria`) |
| GET    | `/reports`            | Reporte: resumen, ventas por categoría, productos estrella |
| GET    | `/reports/export`     | Exporta a Excel (`?formato=excel`) o PDF (`?formato=pdf`) |

## Notas de arquitectura

- Capas estrictas: `routes → controllers (delgados) → services (SQL parametrizado vía pool)`.
- Errores esperados: `AppError(message, status)`; lo demás deriva en 500 vía `middlewares/error.middleware.js`.
- Imágenes: solo jpeg/png/webp ≤ 2 MB, guardadas en `uploads/products/` y servidas en `/uploads/products/<archivo>`. Las imágenes SVG de los productos semilla están versionadas.
- La autorización por rol se valida **en el backend**, ocultar botones en el frontend no constituye seguridad.