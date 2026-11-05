// Productos: el CRUD que escribes en la sesión 1.
// listar() y obtener() ya vienen hechos: úsalos como ejemplo.
const pool = require('../db');

// MySQL guarda "disponible" como 0/1; en JavaScript lo queremos como true/false.
function aProducto(fila) {
  return { id: fila.id, nombre: fila.nombre, precio: fila.precio, disponible: fila.disponible === 1 };
}

async function listar() {
  const [filas] = await pool.query('SELECT id, nombre, precio, disponible FROM productos ORDER BY id');
  return filas.map(aProducto);
}

async function obtener(id) {
  const [filas] = await pool.query('SELECT id, nombre, precio, disponible FROM productos WHERE id = ?', [id]);
  return filas[0] ? aProducto(filas[0]) : null;
}

// Tu turno (sesión 1, paso 2): INSERT y regresa el producto recién creado.
async function crear({ nombre, precio, disponible = true }) {
}

// Tu turno (sesión 1, paso 2): UPDATE y regresa el producto ya actualizado.
async function actualizar(id, { nombre, precio, disponible }) {
}

// Tu turno (sesión 1, paso 2): DELETE; regresa true si borró algo y false si no existía.
async function eliminar(id) {
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
