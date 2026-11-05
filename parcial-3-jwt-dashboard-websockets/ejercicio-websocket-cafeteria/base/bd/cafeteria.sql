-- Base de datos de la cafetería, LISTA PARA IMPORTAR (estructura + datos de ejemplo).
--
-- MySQL Workbench: File > Open SQL Script... > elige este archivo > botón del rayo (Execute).
-- Terminal:        mysql -u root -p --default-character-set=utf8mb4 < bd/cafeteria.sql
--
-- OJO: borra la base "cafeteria" si ya existía. `npm run bd` carga este mismo archivo.
-- Es la base COMPLETA para las dos sesiones: no le tienes que agregar tablas ni columnas.
-- Si en tu .env usas otro DB_NAME, cambia "cafeteria" en las 3 líneas de abajo.

SET NAMES utf8mb4;
DROP DATABASE IF EXISTS cafeteria;
CREATE DATABASE cafeteria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cafeteria;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  boleta CHAR(10) NULL UNIQUE,
  rol VARCHAR(10) NOT NULL -- 'alumno' o 'cocina'
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  precio INT NOT NULL, -- en pesos, sin centavos
  disponible TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  estado VARCHAR(12) NOT NULL DEFAULT 'recibido',
  total INT NOT NULL,
  clave CHAR(12) NOT NULL,
  creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Qué se pidió en cada pedido. Se copian nombre y precio del momento de la
-- compra: si después cambia el precio o se borra el producto, el pedido no cambia.
CREATE TABLE pedido_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NULL,
  nombre VARCHAR(80) NOT NULL,
  precio INT NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
);

INSERT INTO usuarios (nombre, boleta, rol) VALUES
  ('Ana López', '2026090001', 'alumno'),
  ('Luis Pérez', '2026090002', 'alumno'),
  ('María Ruiz', '2026090003', 'alumno'),
  ('Diego Hernández', '2026090004', 'alumno'),
  ('Cocina CECyT 9', NULL, 'cocina');

INSERT INTO productos (nombre, precio, disponible) VALUES
  ('Torta de jamón', 35, 1),
  ('Chilaquiles verdes', 45, 1),
  ('Molletes (3)', 30, 1),
  ('Agua de jamaica', 15, 1),
  ('Café de olla', 18, 1);
