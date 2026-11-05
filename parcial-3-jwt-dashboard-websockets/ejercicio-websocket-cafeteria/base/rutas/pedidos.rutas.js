// /api/pedidos — ya viene resuelto, salvo los avisos en tiempo real (sesión 2).
const express = require('express');
const envolver = require('./envolver');
const pedidos = require('../modelos/pedidos.modelo');
const productos = require('../modelos/productos.modelo');
const usuarios = require('../modelos/usuarios.modelo');
const { ESTADOS, esTransicionValida } = require('../estados');
const { avisarCocina, avisarAlumno } = require('../tiempo-real');

const router = express.Router();

// POST /api/pedidos  { "usuarioId": 1, "productos": [1, 4] }
router.post('/', envolver(async (req, res) => {
  const { usuarioId, productos: ids } = req.body || {};

  const usuario = await usuarios.obtener(usuarioId);
  if (!usuario || usuario.rol !== 'alumno') {
    return res.status(400).json({ error: 'Elige un alumno válido' });
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
  }

  const elegidos = [];
  for (const id of ids) {
    const producto = await productos.obtener(id);
    if (!producto) return res.status(400).json({ error: `No existe el producto ${id}` });
    // 409: la petición está bien escrita, pero el producto se agotó mientras elegías.
    if (!producto.disponible) return res.status(409).json({ error: `"${producto.nombre}" ya no está disponible` });
    elegidos.push(producto);
  }

  const pedido = await pedidos.crear(usuario.id, elegidos);

  // Tu turno (sesión 2, paso 1): avisa al grupo "cocina" que llegó un pedido nuevo (sin la clave).

  // La clave SOLO se entrega aquí, a quien hizo el pedido.
  res.status(201).json({ pedido: pedidos.publico(pedido), clave: pedido.clave });
}));

// GET /api/pedidos — la cocina consulta todos los pedidos
router.get('/', envolver(async (req, res) => {
  res.json((await pedidos.listar()).map(pedidos.publico));
}));

// GET /api/pedidos/:id?clave=... — el alumno consulta SU pedido
router.get('/:id', envolver(async (req, res) => {
  const pedido = await pedidos.obtener(req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
  if (req.query.clave !== pedido.clave) {
    return res.status(403).json({ error: 'Clave incorrecta: este pedido no es tuyo' });
  }
  res.json(pedidos.publico(pedido));
}));

// PATCH /api/pedidos/:id/estado  { "estado": "preparando" }
router.patch('/:id/estado', envolver(async (req, res) => {
  const pedido = await pedidos.obtener(req.params.id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

  const { estado } = req.body || {};
  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ error: `Estado desconocido: "${estado}"` });
  }
  if (!esTransicionValida(pedido.estado, estado)) {
    return res.status(409).json({ error: `No se puede pasar de "${pedido.estado}" a "${estado}"` });
  }
  const cambio = await pedidos.cambiarEstado(pedido.id, pedido.estado, estado);
  if (!cambio) {
    return res.status(409).json({ error: 'Otra pantalla de cocina cambió este pedido al mismo tiempo' });
  }

  const actualizado = pedidos.publico(await pedidos.obtener(pedido.id));

  // Tu turno (sesión 2, paso 1): avisa al grupo "cocina" que el pedido cambió.

  // Tu turno (sesión 2, paso 3): avisa SOLO al alumno dueño del pedido.

  res.json(actualizado);
}));

module.exports = router;
