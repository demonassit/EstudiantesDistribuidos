// Máquina de estados de un pedido.
// Cada estado dice a qué estados SÍ se puede pasar desde él.
//
//   recibido ──► preparando ──► listo ──► entregado
//      │
//      └──► cancelado
//
const TRANSICIONES = {
  recibido: ['preparando', 'cancelado'],
  preparando: ['listo'],
  listo: ['entregado'],
  entregado: [],
  cancelado: [],
};

const ESTADOS = Object.keys(TRANSICIONES);

function esTransicionValida(actual, nuevo) {
  const permitidos = TRANSICIONES[actual] || [];
  return permitidos.includes(nuevo);
}

module.exports = { TRANSICIONES, ESTADOS, esTransicionValida };
