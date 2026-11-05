// /api/diagnostico — herramientas para practicar fallas. Ya viene resuelto.
const express = require('express');
const { cortarConexiones } = require('../tiempo-real');

const router = express.Router();

// POST /api/diagnostico/cortar-conexiones — simula que se cae la red (WiFi del plantel)
router.post('/cortar-conexiones', (req, res) => {
  res.json({ cortadas: cortarConexiones() });
});

module.exports = router;
