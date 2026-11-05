// /api/productos — el CRUD del menú.
// Cada vez que el menú cambia, se avisa a TODAS las pantallas abiertas.
// validar(), avisarMenu() y las dos rutas GET ya vienen hechas: úsalas como ejemplo.
const express = require('express');
const envolver = require('./envolver');
const productos = require('../modelos/productos.modelo');
const { difundirATodos } = require('../tiempo-real');

const router = express.Router();

// Regresa el mensaje de error o null si los datos están bien.
function validar({ nombre, precio, disponible }) {
  if (typeof nombre !== 'string' || !nombre.trim()) return 'Falta el nombre del producto';
  if (nombre.trim().length > 80) return 'El nombre no puede pasar de 80 caracteres';
  if (!Number.isInteger(precio) || precio < 1 || precio > 1000) return 'El precio debe ser un entero entre 1 y 1000';
  if (disponible !== undefined && typeof disponible !== 'boolean') return '"disponible" debe ser true o false';
  return null;
}

// Manda el menú completo, ya actualizado, a todas las pantallas.
async function avisarMenu() {
  difundirATodos({ tipo: 'menu_actualizado', productos: await productos.listar() });
}

// GET /api/productos
router.get('/', envolver(async (req, res) => {
  res.json(await productos.listar());
}));

// GET /api/productos/:id
router.get('/:id', envolver(async (req, res) => {
  const producto = await productos.obtener(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
}));

// Tu turno (sesión 1, paso 3): POST /api/productos
//   400 si validar() encuentra un error · 201 con el producto creado.

// Tu turno (sesión 1, paso 3): PUT /api/productos/:id
//   404 si no existe · 400 si validar() encuentra un error · 200 con el producto actualizado.

// Tu turno (sesión 1, paso 3): DELETE /api/productos/:id
//   404 si no existe · 204 sin cuerpo si se borró.

module.exports = router;
