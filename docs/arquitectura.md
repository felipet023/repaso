# Arquitectura — Bike Store / TUKI BIKES

## Vista general

```
React 19 + Vite 7 (5173)  →  Express 5 API REST (3000)  →  MySQL 8 (bike_store)
```

- **frontend/**: React 19, módulos ES, React Router 7, Lucide icons. Sin SSR; estado en Context (Auth, Cart, Theme) + localStorage para sesión y tema.
- **backend/**: Express 5, CommonJS. Capas estrictas: `routes → controllers (delgados, try/catch → next) → services (lógica y SQL) → mysql2/promise con consultas parametrizadas`. Sin ORM.
- **sql/**: `bike-store.sql` — esquema completo + datos iniciales (reemplaza al antiguo `lab-crud.sql` del laboratorio de equipos).

## Flujos clave

### Carrito → pedido → pago
1. `POST /api/orders` crea el pedido en estado **pendiente** con número único `TK-AAAA-<aleatorio>` y sus `pedido_detalles`.
2. `POST /api/payments/simulate` ejecuta una **transacción** (`BEGIN` … `COMMIT`/`ROLLBACK`, `SELECT … FOR UPDATE`):
   - Aprobado: pedido → `aprobado`, stock ↓, `ventas` ↑, carrito vacío, fila en `pagos_simulados`.
   - Rechazado (`forzarRechazo: true` para pruebas): pedido → `rechazado`, inventario intacto.
   - Stock insuficiente en el momento de pagar → 409 y rollback.
3. El frontend navega a `/pedido/:id/confirmacion` solo si el pago fue aprobado.

### Seguridad
- `authenticate` verifica el JWT y **recarga el usuario desde la BD** (rol y `activo` frescos en cada petición).
- `authorize('admin')` protege rutas de administración; el frontend (`AdminRoute`) solo mejora la UX.
- Contraseñas con bcrypt (costo 10); tokens de recuperación hasheados con SHA-256, 1 h de vigencia, un solo uso.
- Auditoría básica en la tabla `auditoria` (cambios de rol/estado de usuarios, creación/edición/inactivación de productos).

### Imágenes
`multer` → `backend/uploads/products/` (nombre `{timestamp}-{random}{ext}`), servidas por Express en `/uploads/products/*`. Solo JPEG/PNG/WEBP ≤ 2 MB. Las imágenes semilla son SVG locales (sin dependencias externas).

## Migración desde la plantilla (lab-crud)

| Plantilla | Bike Store |
|-----------|-----------|
| tabla `equipos` | tablas `productos`, `categorias`, `marcas` |
| `equipos.service.js` | `products.service.js` (+ filtros, orden, auditoría) |
| BD `laboratorio_crud` | BD `bike_store` (`sql/bike-store.sql`) |
| `EquiposPage.jsx` | `CatalogPage.jsx` + `ProductDetailPage.jsx` + `pages/admin/*` |
| `TeamForm/TeamTable` | `ProductForm`, `ProductCard`, `ProductFilters` |
| uploads `equipos` | uploads `products` |

La aplicación dejó de ser un CRUD de equipos: catálogo público, carrito persistente, pedidos con pago simulado, taller, contacto, administración de usuarios y reportes.

## Decisiones de diseño

- **Carrito solo para usuarios autenticados**: simplifica la persistencia y cumple "recuperar el carrito posteriormente"; agregar sin sesión redirige a `/login`.
- **Pago simulado determinista**: `forzarRechazo` permite probar ambos caminos; nunca se manejan datos de tarjetas.
- **Sin test framework preexistente**: se eligió **Vitest + supertest** (nativo para Vite, ESM/CJS, rápido). Las pruebas de backend corren contra la BD configurada en `.env` y limpian sus datos al terminar.
- **Seed de usuarios al arrancar** (`seedAdmin.js`): admin por `ADMIN_*` y cliente demo por `DEMO_*`, idempotente.

## Estado de la aplicación

- Tema: oscuro por defecto, claro opcional (`data-theme="light"`), persistido en `localStorage.tuki_theme`.
- Sesión: `localStorage.tuki_token` / `tuki_user`; se verifica con `GET /api/auth/me` al cargar la app.
