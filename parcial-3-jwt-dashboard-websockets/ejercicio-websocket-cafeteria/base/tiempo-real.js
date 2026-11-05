// Canal de tiempo real (WebSocket).
//
// La API REST es por donde se HACEN las cosas (y se guardan en MySQL).
// El WebSocket es por donde el servidor AVISA sin que nadie le pregunte.
//
// Hay tres alcances de aviso:
//   1. A TODOS    (difundirATodos) -> el menú cambió: lo deben ver todas las pantallas
//   2. A UN GRUPO (avisarCocina)   -> pedidos nuevos o actualizados: solo pantallas de cocina
//   3. A UNO      (avisarAlumno)   -> tu pedido cambió: solo el dueño de ese pedido
//
// Mensajes que el navegador le puede mandar al servidor:
//   { "tipo": "soy_cocina" }                               -> quiero recibir TODOS los pedidos
//   { "tipo": "suscribir", "pedidoId": 3, "clave": "..." } -> quiero recibir SOLO mi pedido
//
// Mensajes que el servidor le manda al navegador:
//   { "tipo": "menu_actualizado", "productos": [...] }  (a todos)
//   { "tipo": "bienvenida", "rol": "cocina" }
//   { "tipo": "pedido_nuevo", "pedido": {...} }        (solo a cocinas)
//   { "tipo": "pedido_actualizado", "pedido": {...} }  (solo a cocinas)
//   { "tipo": "suscrito", "pedido": {...} }            (al alumno, con el estado ACTUAL)
//   { "tipo": "estado_pedido", "pedido": {...} }       (solo al dueño del pedido)
//   { "tipo": "error", "mensaje": "..." }
const { WebSocketServer } = require('ws');
const pedidos = require('./modelos/pedidos.modelo');

let wss = null;
const cocinas = new Set(); // sockets de las pantallas de cocina
const suscriptores = new Map(); // pedidoId -> Set de sockets de ese alumno

function enviar(socket, mensaje) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(mensaje));
  }
}

async function suscribir(socket, mensaje) {
  const pedido = await pedidos.obtener(mensaje.pedidoId);
  if (!pedido) {
    return enviar(socket, { tipo: 'error', mensaje: 'Pedido no encontrado' });
  }
  if (mensaje.clave !== pedido.clave) {
    return enviar(socket, { tipo: 'error', mensaje: 'Clave incorrecta: este pedido no es tuyo' });
  }
  // Tu turno (sesión 2, paso 3): el pedido existe y la clave es correcta.
  // Guarda el socket en "suscriptores" (en el Set de ese pedido) y contéstale
  // { tipo: 'suscrito', pedido } con el estado ACTUAL (sin la clave).
}

function iniciarTiempoReal(servidorHttp) {
  wss = new WebSocketServer({ server: servidorHttp, path: '/tiempo-real' });

  wss.on('connection', (socket) => {
    socket.on('message', async (texto) => {
      let mensaje;
      try {
        mensaje = JSON.parse(texto);
      } catch {
        return enviar(socket, { tipo: 'error', mensaje: 'El mensaje no es JSON válido' });
      }

      try {
        // Tu turno (sesión 2, paso 1): si mensaje.tipo es "soy_cocina", guarda el
        // socket en "cocinas" y contéstale { tipo: 'bienvenida', rol: 'cocina' }.

        if (mensaje.tipo === 'suscribir') {
          return await suscribir(socket, mensaje);
        }

        enviar(socket, { tipo: 'error', mensaje: `Tipo de mensaje desconocido: "${mensaje.tipo}"` });
      } catch (error) {
        console.error('[tiempo-real]', error.message);
        enviar(socket, { tipo: 'error', mensaje: 'Error del servidor' });
      }
    });

    socket.on('close', () => {
      cocinas.delete(socket);
      for (const [pedidoId, sockets] of suscriptores) {
        sockets.delete(socket);
        if (sockets.size === 0) suscriptores.delete(pedidoId);
      }
    });
  });
}

// 1. A TODOS: cualquier pantalla conectada (alumnos, cocinas, administración del menú).
// wss.clients es el conjunto de TODOS los sockets conectados.
function difundirATodos(mensaje) {
  if (!wss) return;
  // Tu turno (sesión 1, paso 4)
}

// 2. A UN GRUPO: solo las pantallas que dijeron "soy_cocina".
function avisarCocina(tipo, pedido) {
  // Tu turno (sesión 2, paso 1)
}

// 3. A UNO: solo a quien se suscribió a ESE pedido.
function avisarAlumno(pedidoId, pedido) {
  // Tu turno (sesión 2, paso 3)
}

// Simula una caída de red: cierra de golpe todas las conexiones WebSocket.
function cortarConexiones() {
  if (!wss) return 0;
  let cortadas = 0;
  for (const socket of wss.clients) {
    socket.terminate();
    cortadas += 1;
  }
  return cortadas;
}

module.exports = { iniciarTiempoReal, difundirATodos, avisarCocina, avisarAlumno, cortarConexiones };
