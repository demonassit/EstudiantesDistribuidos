// Express 4 no atrapa los errores de las funciones async (por ejemplo, si MySQL
// está apagado). envolver() los atrapa y los manda al manejador de errores de
// server.js, que responde 500 en JSON en lugar de dejar la petición colgada.
//
//   router.get('/', envolver(async (req, res) => { ... }));
//
function envolver(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = envolver;
