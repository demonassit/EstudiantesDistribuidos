// Pedidos: ya vienen resueltos. Se guardan en dos tablas: pedidos y pedido_productos.
const crypto = require('crypto');
const pool = require('../db');

const CONSULTA = `
  SELECT p.id, p.usuario_id, u.nombre AS alumno, p.estado, p.total, p.clave, p.creado, p.actualizado
  FROM pedidos p JOIN usuarios u ON u.id = p.usuario_id`;

// Arma el objeto pedido con la lista de nombres de productos.
async function completar(filas) {
  if (filas.length === 0) return [];
  const ids = filas.map((f) => f.id);
  const [detalle] = await pool.query(
    'SELECT pedido_id, nombre FROM pedido_productos WHERE pedido_id IN (?) ORDER BY id',
    [ids],
  );
  return filas.map((f) => ({
    id: f.id,
    codigo: `C-${String(f.id).padStart(3, '0')}`,
    usuarioId: f.usuario_id,
    alumno: f.alumno,
    productos: detalle.filter((d) => d.pedido_id === f.id).map((d) => d.nombre),
    total: f.total,
    estado: f.estado,
    creado: f.creado,
    actualizado: f.actualizado,
    clave: f.clave,
  }));
}

async function obtener(id) {
  const [filas] = await pool.query(`${CONSULTA} WHERE p.id = ?`, [id]);
  const [pedido] = await completar(filas);
  return pedido || null;
}

async function listar() {
  const [filas] = await pool.query(`${CONSULTA} ORDER BY p.id`);
  return completar(filas);
}

// productos: arreglo de objetos producto (ya validados) tal como están en la tabla productos.
// Se usa una transacción: o se guarda el pedido completo, o no se guarda nada.
async function crear(usuarioId, productos) {
  const clave = crypto.randomBytes(6).toString('hex');
  const total = productos.reduce((suma, p) => suma + p.precio, 0);
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const [resultado] = await conexion.query(
      'INSERT INTO pedidos (usuario_id, total, clave) VALUES (?, ?, ?)',
      [usuarioId, total, clave],
    );
    const pedidoId = resultado.insertId;
    for (const p of productos) {
      await conexion.query(
        'INSERT INTO pedido_productos (pedido_id, producto_id, nombre, precio) VALUES (?, ?, ?, ?)',
        [pedidoId, p.id, p.nombre, p.precio],
      );
    }
    await conexion.commit();
    return obtener(pedidoId);
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

// Cambia el estado SOLO si el pedido sigue en el estado que leímos ("de").
// Si dos pantallas de cocina pulsan el mismo botón al mismo tiempo, una gana
// y a la otra le regresa false (la ruta responde 409).
async function cambiarEstado(id, de, a) {
  const [resultado] = await pool.query('UPDATE pedidos SET estado = ? WHERE id = ? AND estado = ?', [a, id, de]);
  return resultado.affectedRows === 1;
}

// Lo que se puede mostrar a cualquiera: todo menos la clave.
function publico(pedido) {
  const { clave, ...resto } = pedido;
  return resto;
}

module.exports = { obtener, listar, crear, cambiarEstado, publico };
