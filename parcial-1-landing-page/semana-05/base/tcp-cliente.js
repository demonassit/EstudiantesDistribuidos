// tcp-cliente.js
// Cliente TCP: conéctate al servidor y envía 3 mensajes ("uno", "dos", "tres")
// por el mismo socket ya conectado.

const net = require('net');

const HOST = process.env.HOST || '127.0.0.1';
const PUERTO = process.env.PUERTO || 5000;

const socket = net.connect(PUERTO, HOST, () => {
  // TODO: enviar los 3 mensajes con socket.write() (agrega '\n' al final de cada uno)
  // TODO: cerrar el socket con socket.end() cuando termines de enviar
});

// TODO: escuchar 'data' para imprimir la respuesta del servidor
// TODO: escuchar 'close' y 'error'
