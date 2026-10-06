// udp-servidor.js
// Servidor UDP mínimo (módulo `dgram` de Node). Complétalo: recibe
// datagramas y responde con un eco a quien lo envió. A diferencia de TCP,
// aquí no hay conexión previa: cada datagrama trae su propio remitente.

const dgram = require('dgram');

const PUERTO = process.env.PUERTO || 5001;
const servidor = dgram.createSocket('udp4');

// TODO: escuchar 'message' — recibe (datagrama, remitente) y responde con servidor.send()
// TODO: escuchar 'error'

servidor.bind(PUERTO, () => {
  console.log(`Servidor UDP escuchando en el puerto ${PUERTO}`);
});
