// cliente-websocket.js
// Cliente WebSocket de prueba: conéctate, manda un mensaje y escucha el
// broadcast del servidor. Uso: node cliente-websocket.js <nombre>

const WebSocket = require('ws');

const PUERTO = process.env.PUERTO || 6000;
const nombre = process.argv[2] || 'cliente-anonimo';

const socket = new WebSocket(`ws://localhost:${PUERTO}`);

// TODO: en 'open', loguear la conexión y enviar un saludo con socket.send()
// TODO: en 'message', imprimir lo recibido
// TODO: en 'close' y 'error', loguear
