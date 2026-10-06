// udp-cliente.js
// Cliente UDP: envía 3 datagramas independientes ("uno", "dos", "tres") al
// servidor, sin conexión previa, y cuenta cuántas respuestas llegan.

const dgram = require('dgram');

const HOST = process.env.HOST || '127.0.0.1';
const PUERTO = process.env.PUERTO || 5001;

const cliente = dgram.createSocket('udp4');
const mensajes = ['uno', 'dos', 'tres'];

// TODO: enviar cada mensaje con cliente.send(Buffer.from(mensaje), PUERTO, HOST)
// TODO: escuchar 'message' para contar e imprimir las respuestas
// TODO: cerrar el socket con cliente.close() cuando termines
