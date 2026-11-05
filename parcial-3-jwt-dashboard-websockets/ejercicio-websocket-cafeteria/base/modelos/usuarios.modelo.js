// Usuarios: ya vienen resueltos. Solo se consultan (no hay alta ni contraseña).
const pool = require('../db');

async function listar(rol) {
  if (rol) {
    const [filas] = await pool.query(
      'SELECT id, nombre, boleta, rol FROM usuarios WHERE rol = ? ORDER BY nombre',
      [rol],
    );
    return filas;
  }
  const [filas] = await pool.query('SELECT id, nombre, boleta, rol FROM usuarios ORDER BY nombre');
  return filas;
}

async function obtener(id) {
  const [filas] = await pool.query('SELECT id, nombre, boleta, rol FROM usuarios WHERE id = ?', [id]);
  return filas[0] || null;
}

module.exports = { listar, obtener };
