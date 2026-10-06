// tcp-servidor.js
// Servidor TCP mínimo (módulo `net` de Node). Complétalo: crea el servidor,
// escucha conexiones entrantes, recibe datos del cliente y responde con un
// eco. Recuerda que TCP es un flujo de bytes: los mensajes del cliente
// pueden no llegar delimitados uno por uno.

const net = require('net');

const PUERTO = process.env.PUERTO || 5000;

const servidor = net.createServer((socket) => {
  // TODO: loguear la conexión (socket.remoteAddress/remotePort)
  // TODO: escuchar 'data', separar mensajes por '\n' y responder con socket.write()
  // TODO: escuchar 'close' y 'error'
});

servidor.listen(PUERTO, () => {
  console.log(`Servidor TCP escuchando en el puerto ${PUERTO}`);
});
