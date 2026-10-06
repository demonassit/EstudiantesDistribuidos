// servidor.js
// WebSocket + página web local: el mismo escenario de "cupo lleno" que ya
// programaste en base/servidor-sockets.js (sockets TCP crudos), pero ahora
// mostrado en un navegador real vía WebSocket. Complétalo.

const path = require('path');
const http = require('http');
const fs = require('fs');
const readline = require('readline');
const { WebSocketServer } = require('ws');

const PUERTO = process.env.PUERTO || 7000;

// Servidor HTTP mínimo, solo para servir index.html.
const servidorHttp = http.createServer((req, res) => {
  fs.readFile(path.join(__dirname, 'index.html'), (error, contenido) => {
    if (error) {
      res.writeHead(500);
      return res.end('No se pudo cargar index.html');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(contenido);
  });
});

// TODO: crear el WebSocketServer adjuntado a `servidorHttp`
// TODO: llevar un registro (Set o Map) de los clientes conectados
// TODO: escribir una función broadcast(mensaje) que le mande el aviso
//       (como JSON: { tipo: 'cupo_lleno', mensaje, fecha }) a todos los
//       clientes conectados

servidorHttp.listen(PUERTO, () => {
  console.log(`Abre http://localhost:${PUERTO} en el navegador`);
  console.log('Escribe "lleno <nombre del taller>" y Enter para simular un aviso de cupo lleno a todos los navegadores conectados.');
});

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (linea) => {
  const [comando, ...resto] = linea.trim().split(' ');
  if (comando === 'lleno') {
    const taller = resto.join(' ') || 'un taller';
    // TODO: llamar aquí a broadcast(`Cupo lleno en: ${taller}`)
  }
});
