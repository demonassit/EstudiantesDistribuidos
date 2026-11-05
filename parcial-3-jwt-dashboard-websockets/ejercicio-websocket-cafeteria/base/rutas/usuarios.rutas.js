// /api/usuarios — ya viene resuelto. Solo lectura.
const express = require('express');
const envolver = require('./envolver');
const usuarios = require('../modelos/usuarios.modelo');

const router = express.Router();

// GET /api/usuarios            -> todos
// GET /api/usuarios?rol=alumno -> solo alumnos (para la lista de la pantalla del alumno)
router.get('/', envolver(async (req, res) => {
  res.json(await usuarios.listar(req.query.rol));
}));

module.exports = router;
