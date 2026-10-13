# Matriz de requisitos no funcionales

| RNF | Requisito | Evidencia técnica |
|-----|-----------|-------------------|
| RNF-01 | Interfaz clara, consistente e intuitiva | Diseño basado en la referencia Figma: tokens centralizados en `src/assets/styles.css` (`:root`), componentes reutilizables (`ProductCard`, `ProductFilters`, `Spinner`, `EmptyState`, `ErrorBox`), mensajes en español. |
| RNF-02 | Responsive en escritorio, tableta y móvil | Media queries en `styles.css` a 900 px (tabla) y 640 px (móvil): filtros apilados, navbar con menú hamburguesa, grid de productos con `auto-fill`, tablas con scroll horizontal. |
| RNF-03 | Consultas del catálogo con respuesta adecuada | Pool de conexiones MySQL (`connectionLimit: 10`), índices en `productos` (categoría, marca, activo, precio, ventas), `LIMIT/OFFSET` con tope de 100, consultas parametrizadas. |
| RNF-04 | Protección de funciones administrativas | Middlewares `authenticate` (JWT + recarga de usuario desde BD) y `authorize('admin')` en el backend; el frontend solo oculta botones. Prueba: cliente recibe 403 en `/api/admin/*` y 403 al crear productos (`admin.test.js`). |
| RNF-05 | Contraseñas con hash, nunca texto plano | `bcrypt` (costo 10) en registro, login y restablecimiento. La columna `password` nunca se selecciona en respuestas; `loginUser` la elimina antes de devolver el usuario. |
| RNF-06 | Integridad de productos, usuarios, pedidos y detalles | Claves foráneas en `bike-store.sql`; transacción ACID en el pago (`BEGIN`/`COMMIT`/`ROLLBACK` + `SELECT … FOR UPDATE`); el inventario solo cambia si el pago es aprobado; números de pedido únicos (`UNIQUE`). |
| RNF-07 | Disponibilidad durante pruebas y demostraciones | `npm run dev` en ambos paquetes (nodemon + Vite con HMR); seed idempotente de admin y cliente demo al arrancar; `GET /api/health` para chequeo. |
| RNF-08 | Código modular y mantenible | Backend en capas estrictas: `routes → controllers (delgados) → services (lógica) → mysql2 parametrizado`; validadores separados en `src/validators/`; frontend con `pages/`, `components/`, `context/`, `services/`, `hooks/`, `utils/`. |
| RNF-09 | Compatibilidad con navegadores modernos | React 19 + Vite 7 (baseline Chrome/Edge/Firefox/Safari actuales); CSS estándar sin prefijos; `Intl.NumberFormat('es-CO')` nativo. |
| RNF-10 | Mensajes comprensibles | Errores validados con textos en español y causa concreta (ej.: «Solo hay 5 unidades disponibles de…»); `AppError` con código HTTP correcto; estados de carga, vacío y error en todas las páginas. |
| RNF-11 | Arquitectura ampliable | Módulos independientes por dominio (products, cart, orders, payments, admin, workshop, contact); nuevas rutas se agregan en `src/routes/` sin tocar el núcleo; esquema SQL versionado en `sql/`. |
| RNF-12 | Despliegue local | `cd backend && npm install && npm run dev` (puerto 3000) + `cd frontend && npm install && npm run dev` (puerto 5173); configuración por `.env`; MySQL 8+ como único requisito externo. Documentado en ambos README. |
