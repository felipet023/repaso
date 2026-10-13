# Bike Store / TUKI BIKES — Frontend

Aplicación web de la tienda de bicicletas y accesorios: Home pública, catálogo con búsqueda/filtros/orden, detalle de producto, carrito, checkout con pago simulado, taller con citas, contacto, autenticación y panel de administración.

Stack: React 19 + Vite 7 (ESM), `react-router-dom` 7, `lucide-react`. Tema oscuro por defecto (con toggle claro/oscuro), acento verde lima, mensajes en español. Pruebas unitarias con Vitest.

## Requisitos

- Node.js 20+
- Backend corriendo en `http://localhost:3000` (ver `backend/README.md`)

## Instalar y ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
```

Configuración opcional (`.env`):

```
VITE_API_URL=http://localhost:3000/api
```

Sin variable, el frontend usa el valor por defecto `http://localhost:3000/api`.

Otros comandos:

```bash
npm run build      # build de producción en dist/
npm test           # Vitest (format, validators)
```

## Usuarios de prueba

Se crean automáticamente al arrancar el backend (configurables en `backend/.env`):

| Rol     | Email                    | Contraseña      |
|---------|--------------------------|-----------------|
| admin   | `admin@bike-store.local` | `AdminDemo2026!` |
| cliente | `cliente@bike-store.local` | `ClienteDemo2026!` |

Rutas del frontend:

- Públicas: `/`, `/catalogo`, `/producto/:id`, `/nosotros`, `/taller`, `/contacto`, `/login`, `/registro`, `/recuperar-contrasena`, `/restablecer-contrasena`
- Autenticadas: `/taller/agendar`, `/carrito`, `/checkout`, `/pedido/:id/confirmacion`, `/mis-pedidos`, `/mi-cuenta`
- Admin: `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/:id/editar`, `/admin/usuarios`, `/admin/reportes`

## Responsabilidades

- `assets`: estilos globales (tokens CSS del tema oscuro/claro).
- `components`: componentes reutilizables (Navbar, Footer, ProductCard, ProductFilters, ProductForm, ProtectedRoute, AdminRoute, Spinner, EmptyState, ErrorBox…).
- `config`: `env.js` (`API_URL` y `SERVER_URL` para imágenes).
- `context`: estado global — `AuthContext` (sesión), `CartContext` (carrito persistente), `ThemeContext` (tema).
- `hooks`: hooks propios (`useAuth`, `useCart`, `useTheme`).
- `pages`: pantallas públicas, de cuenta y `pages/admin/` (panel).
- `services`: comunicación con la API (`api.js` + servicios por módulo).
- `utils`: `storage.js` (sesión en `localStorage`), `format.js` (moneda COP, fechas, URLs de imagen), `validators.js`.

## Flujo

`Login → AuthContext guarda JWT en localStorage (tuki_token / tuki_user)` → `api.js` adjunta `Authorization: Bearer` y omite `Content-Type` en `FormData` → el backend verifica el JWT y el rol.

El carrito vive en el backend (por usuario autenticado) y `CartContext` lo sincroniza. El chequeo de roles admin se hace en el backend; las rutas `/admin/*` solo son la capa visual.