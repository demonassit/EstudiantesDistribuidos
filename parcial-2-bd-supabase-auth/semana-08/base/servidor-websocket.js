// servidor-websocket.js
// Servidor WebSocket con broadcast (librería `ws`). Es el mismo patrón que
// base/servidor-sockets.js de semana 9, pero sobre WebSocket en vez de un
// socket TCP crudo. Complétalo.

const { WebSocketServer } = require('ws');

const PUERTO = process.env.PUERTO || 6000;
const clientes = new Map();
let siguienteId = 1;

const servidor = new WebSocketServer({ port: PUERTO });

servidor.on('connection', (socket) => {
  // TODO: asignar un id al cliente, guardarlo en `clientes` y loguear la conexión
  // TODO: enviarle un mensaje de bienvenida con socket.send()
  // TODO: escuchar 'message' y reenviar (broadcast) el mensaje a TODOS los clientes conectados
  // TODO: escuchar 'close' para quitarlo de `clientes` y loguear la desconexión
  // TODO: escuchar 'error'
});

console.log(`Servidor WebSocket escuchando en el puerto ${PUERTO}`);
