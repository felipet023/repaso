# AGENTS.md

## What this repo is

**Bike Store / TUKI BIKES**: tienda en línea de bicicletas y accesorios con catálogo público, carrito, checkout con **pago simulado**, autenticación JWT con roles `admin`/`cliente`, taller de servicios con citas, formulario de contacto y panel de administración (usuarios, productos, dashboard y reportes exportables). A pesar del nombre de la carpeta (`prototipo_mio-bike`), **no es** un CRUD de equipos de laboratorio: esa versión fue migrada a `productos`/`marcas`/`categorías`. UI y API están en español.

Dos proyectos npm independientes (sin workspaces) dentro de este repo:

- `backend/` — Express 5, **CommonJS** (`require`), mysql2 con consultas parametrizadas (sin ORM). API en `http://localhost:3000`.
- `frontend/` — React 19 + Vite 7, **ESM** (`import`). App en `http://localhost:5173`.

## Commands

- Backend (`cd backend`): `npm install` → `npm run dev` (nodemon) o `npm start`. Health check: `GET /api/health`.
- Frontend (`cd frontend`): `npm install` → `npm run dev`. Necesita el backend corriendo.
- Pruebas: `npm test` en **ambos** paquetes (Vitest; el backend usa supertest contra MySQL **real**). Build: `npm run build` en frontend.
- No hay lint ni typecheck ni CI.

## Setup gotchas (verified against source)

- MySQL debe estar corriendo y el esquema aplicado **antes** de arrancar el backend: `sql/bike-store.sql` es la fuente de verdad — crea la base **`bike_store`** y 10 productos semilla (imágenes SVG en `backend/uploads/products/`, commitadas). `backend/scripts/apply-sql.js` aplica el SQL programáticamente. Los `.env.example` actuales ya apuntan a `DB_NAME=bike_store`.
- `backend/src/config/env.js` lanza error en tiempo de `require` si falta `DB_HOST`, `DB_USER`, `DB_NAME` o `JWT_SECRET` — el proceso sale al instante. `ADMIN_*` y `DEMO_*` son opcionales; `src/startup/seedAdmin.js` crea el admin y el cliente demo al arrancar (idempotente: omite si el email ya existe).
- Copia `.env.example` → `.env` en ambos proyectos. El frontend solo necesita `VITE_API_URL` (por defecto `http://localhost:3000/api`).
- Los **tests del backend usan la base real** (`backend/test/helpers.js` inserta/borra usuarios y productos): necesitan MySQL arriba con el esquema `bike_store` aplicado. La suite limpia lo que crea salvo que un test interrumpa (FKs: borrar `carrito_detalles`/`pedido_detalles` antes que productos).
- `**/package-lock.json` está gitignoreado en ambos paquetes y las dependencias son rangos — `npm install` puede resolver versiones más nuevas en otra sesión.

## Architecture facts that aren't obvious

- Backend estricto en capas: `routes → controllers (try/catch delgado → next(error)) → services (SQL parametrizado vía pool mysql2; sin ORM)`. Errores esperados son `AppError(message, status)`; cualquier otro → 500 vía `error.middleware.js`.
- Catálogo **público**: `GET /api/products` y `GET /api/products/:id` usan `optionalAuthenticate` (funcionan sin token). Las rutas de escritura de productos (`POST`, `PUT`, `PATCH /:id/status`) requieren JWT y rol **admin** — verificado server-side, no solo ocultando botones. No existe DELETE de productos: se desactivan con `PATCH /:id/status`.
- Roles: el registro siempre crea `cliente`; el admin solo existe vía el seed `ADMIN_*`. Todo `/api/admin/*` (usuarios, dashboard, reportes, exportación) exige `authenticate + authorize('admin')`. JWT payload: `{id_usuario, nombre, email, rol}`, expiración por defecto 2h.
- Carrito ligado al usuario autenticado (`carritos` + `carrito_detalles`); `POST /api/cart/items` **acumula** cantidades y rechaza si excede stock (409). Crear un pedido **no vacía el carrito**; solo el pago aprobado lo vacía y descuenta el stock (transacción con `FOR UPDATE`). Pago 100% simulado: nunca toca datos reales de tarjetas; `forzarRechazo` produce rechazo determinista (usado en pruebas).
- Imágenes: multer acepta solo jpeg/png/webp ≤ 2 MB en `backend/uploads/products/`; el nombre es `{Date.now()}-{aleatorio}{ext}` (la extensión sale del nombre original, solo el MIME se valida). Los servicios borran el archivo antiguo al actualizar. Las imágenes SVG de los productos semilla están commitadas (excepción en `backend/.gitignore`).
- Sesión frontend en `localStorage` con claves `tuki_token` y `tuki_user` (`src/utils/storage.js`; `getUser()` tolera JSON corrupto). `api.js` inyecta el Bearer y omite `Content-Type` para `FormData`. URLs de imagen se arman con `SERVER_URL` = `VITE_API_URL` sin el sufijo `/api` (`src/config/env.js`).
- Taller: los servicios (Diagnóstico, Mantenimiento general, Frenos/transmisión, Servicio e-bike) vienen del schema semilla; agendar cita (`POST /api/workshop/appointments`) exige login y valida horarios ocupados server-side. Contacto es público (`POST /api/contact`).
- Reportes: `GET /api/admin/reports` y `GET /api/admin/reports/export?formato=excel|pdf` (exceljs/pdfkit). Dashboard: `GET /api/admin/dashboard` (ventas, más vendidos, alertas de inventario, pedidos recientes).

## Docs

- `docs/matriz-requisitos.md` (RF-01 a RF-31), `docs/matriz-no-funcionales.md` (RNF-01 a RNF-12), `docs/api.md` (endpoints), `docs/arquitectura.md` (migración desde la plantilla lab-crud). `.opencode/agentes/` contiene agentes base (arquitecto, desarrollador, tester, etc.).

## Git state

Un solo commit ("patos"); `backend/`, `frontend/`, `docs/`, `sql/` están/llevan cambios **sin commitear** (los archivos `mafia-patos*` quedaron staged como borrados). Conviene commitear el trabajo actual de forma deliberada — no asumas que el árbol coincide con HEAD.