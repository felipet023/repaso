-- ============================================================
-- Bike Store / TUKI BIKES — Esquema y datos iniciales (MySQL)
-- Reemplaza al antiguo sql/lab-crud.sql (CRUD de equipos).
-- Ejecutar: mysql -u root -p < sql/bike-store.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS bike_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bike_store;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS tokens_recuperacion;
DROP TABLE IF EXISTS mensajes_contacto;
DROP TABLE IF EXISTS citas_taller;
DROP TABLE IF EXISTS servicios_taller;
DROP TABLE IF EXISTS pagos_simulados;
DROP TABLE IF EXISTS pedido_detalles;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS carrito_detalles;
DROP TABLE IF EXISTS carritos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS marcas;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Usuarios (visitantes registrados: clientes y administradores)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuarios_rol (rol),
    INDEX idx_usuarios_activo (activo)
);

-- ------------------------------------------------------------
-- Catálogo: categorías, marcas y productos
-- ------------------------------------------------------------
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    id_marca INT NOT NULL,
    id_categoria INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(5, 2) NOT NULL DEFAULT 0,
    imagen VARCHAR(255) NULL,
    stock INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 0,
    ventas INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_marca) REFERENCES marcas(id_marca),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
    INDEX idx_productos_categoria (id_categoria),
    INDEX idx_productos_marca (id_marca),
    INDEX idx_productos_activo (activo),
    INDEX idx_productos_precio (precio),
    INDEX idx_productos_ventas (ventas)
);

-- ------------------------------------------------------------
-- Carrito de compras (un carrito por usuario)
-- ------------------------------------------------------------
CREATE TABLE carritos (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE carrito_detalles (
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    PRIMARY KEY (id_carrito, id_producto),
    FOREIGN KEY (id_carrito) REFERENCES carritos(id_carrito) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Pedidos y pagos simulados
-- ------------------------------------------------------------
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(30) NOT NULL UNIQUE,
    id_usuario INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente',
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    INDEX idx_pedidos_usuario (id_usuario),
    INDEX idx_pedidos_estado (estado),
    INDEX idx_pedidos_fecha (created_at)
);

CREATE TABLE pedido_detalles (
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_pedido, id_producto),
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE pagos_simulados (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    metodo VARCHAR(40) NOT NULL,
    estado ENUM('aprobado', 'rechazado') NOT NULL,
    referencia VARCHAR(80),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    INDEX idx_pagos_estado (estado)
);

-- ------------------------------------------------------------
-- Taller: servicios y citas
-- ------------------------------------------------------------
CREATE TABLE servicios_taller (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT,
    duracion_minutos INT NOT NULL,
    precio_desde DECIMAL(10, 2) NOT NULL
);

CREATE TABLE citas_taller (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_servicio INT NOT NULL,
    tipo_bicicleta VARCHAR(60) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    descripcion TEXT,
    nombre_contacto VARCHAR(100) NOT NULL,
    email_contacto VARCHAR(150) NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_servicio) REFERENCES servicios_taller(id_servicio),
    INDEX idx_citas_fecha (fecha),
    INDEX idx_citas_horario (fecha, hora)
);

-- ------------------------------------------------------------
-- Contacto, recuperación de contraseña y auditoría
-- ------------------------------------------------------------
CREATE TABLE mensajes_contacto (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tokens_recuperacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_tokens_expira (expires_at)
);

CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    accion VARCHAR(60) NOT NULL,
    entidad VARCHAR(40) NOT NULL,
    entidad_id INT,
    detalle TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    INDEX idx_auditoria_entidad (entidad, entidad_id),
    INDEX idx_auditoria_fecha (created_at)
);

-- ------------------------------------------------------------
-- Datos iniciales: categorías y marcas
-- ------------------------------------------------------------
INSERT INTO categorias (id_categoria, nombre) VALUES
  (1, 'Carretera'),
  (2, 'Montaña'),
  (3, 'E-bike'),
  (4, 'Accesorios'),
  (5, 'Protección');

INSERT INTO marcas (id_marca, nombre) VALUES
  (1, 'Cannondale'),
  (2, 'Specialized'),
  (3, 'Trek'),
  (4, 'Rad Power'),
  (5, 'Canyon'),
  (6, 'Maxxis'),
  (7, 'Giro'),
  (8, 'TUKI');

-- ------------------------------------------------------------
-- Datos iniciales: catálogo de productos
-- Precios en COP. imagen apunta a uploads/products/*.svg
-- ------------------------------------------------------------
INSERT INTO productos (id_producto, nombre, descripcion, id_marca, id_categoria, precio, descuento, imagen, stock, rating, ventas) VALUES
  (1, 'Cannondale Treadwell 2', 'Bicicleta de carretera cómoda y liviana, ideal para rodar en ciudad y carretera con geometría relajada.', 1, 1, 1499990.00, 10.00, 'producto-1.svg', 8, 4.5, 42),
  (2, 'Specialized Allez Sport', 'Bicicleta de carretera de aluminio con cuadro ligero E5, perfecta para principiantes y rutas largas.', 2, 1, 2199000.00, 0.00, 'producto-2.svg', 6, 4.7, 35),
  (3, 'Trek Domane AL 2', 'Bicicleta de endurance con IsoSpeed, diseñada para comodidad en recorridos largos de carretera.', 3, 1, 2899000.00, 5.00, 'producto-3.svg', 5, 4.6, 28),
  (4, 'Trek Marlin 7', 'Bicicleta de montaña con suspensión delantera y transmisión amplia para senderos exigentes.', 3, 2, 3499000.00, 8.00, 'producto-4.svg', 7, 4.8, 51),
  (5, 'Rad Power RadRunner 3+', 'Bicicleta eléctrica utilitaria con capacidad de carga, ideal para desplazamientos diarios.', 4, 3, 3999000.00, 0.00, 'producto-5.svg', 4, 4.4, 19),
  (6, 'Trek Powerfly 4', 'Bicicleta eléctrica de montaña con motor Bosch y batería integrada para subir sin esfuerzo.', 3, 3, 4599000.00, 12.00, 'producto-6.svg', 3, 4.5, 23),
  (7, 'Canyon Neuron CF 7', 'Bicicleta de montaña de carbono con suspensión de doble recorrido para trails técnicos.', 5, 2, 5299000.00, 0.00, 'producto-7.svg', 2, 4.9, 17),
  (8, 'Maxxis Minion DHF 29', 'Neumático de montaña 29" con tacos agresivos para descenso y terreno suelto.', 6, 4, 189000.00, 15.00, 'producto-8.svg', 30, 4.6, 88),
  (9, 'Giro Aether MIPS', 'Casco de ruta con tecnología MIPS, ventilación superior y ajuste de precisión.', 7, 4, 429000.00, 0.00, 'producto-9.svg', 12, 4.7, 64),
  (10, 'Kit de Protección MTB Pro', 'Kit completo de protección para MTB: rodilleras, coderas y guantes reforzados.', 8, 5, 259000.00, 20.00, 'producto-10.svg', 0, 4.3, 31);

-- ------------------------------------------------------------
-- Datos iniciales: servicios del taller
-- ------------------------------------------------------------
INSERT INTO servicios_taller (id_servicio, nombre, descripcion, duracion_minutos, precio_desde) VALUES
  (1, 'Diagnóstico completo', 'Revisión de frenos, transmisión, ruedas, dirección y presión de neumáticos.', 30, 35000.00),
  (2, 'Mantenimiento general', 'Limpieza, lubricación, ajuste de frenos y cambios, revisión de seguridad.', 90, 90000.00),
  (3, 'Frenos y transmisión', 'Ajuste o reemplazo de pastillas, cables, piñones y cadena.', 60, 70000.00),
  (4, 'Servicio e-bike', 'Diagnóstico electrónico, batería, motor y firmware para bicicletas eléctricas.', 90, 120000.00);
