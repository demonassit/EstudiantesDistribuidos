const http = require('http');
const path = require('path');
const express = require('express');
const { iniciarTiempoReal } = require('./tiempo-real');

const app = express();
app.use(express.json());

// Las páginas (alumno, cocina y menú) se sirven desde la carpeta public/.
app.use(express.static(path.join(__dirname, 'public')));

// La API REST: aquí se HACEN las cosas y se guardan en MySQL.
app.use('/api/usuarios', require('./rutas/usuarios.rutas'));
app.use('/api/productos', require('./rutas/productos.rutas'));
app.use('/api/pedidos', require('./rutas/pedidos.rutas'));
app.use('/api/diagnostico', require('./rutas/diagnostico.rutas'));

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Errores no esperados (por ejemplo, MySQL apagado): 500 en JSON.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error('[error]', error.message);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo no es JSON válido' });
  }
  res.status(500).json({ error: 'Error del servidor (¿MySQL está encendido?)' });
});

// Un solo servidor HTTP para las dos cosas: Express atiende las peticiones
// normales y el WebSocket se "cuelga" del mismo puerto en la ruta /tiempo-real.
const PORT = process.env.PORT || 4500;
const servidor = http.createServer(app);
iniciarTiempoReal(servidor);

servidor.listen(PORT, () => {
  console.log(`Cafetería lista en http://localhost:${PORT}`);
  console.log(`  Alumno: http://localhost:${PORT}/cliente.html`);
  console.log(`  Cocina: http://localhost:${PORT}/cocina.html`);
  console.log(`  Menú:   http://localhost:${PORT}/productos.html`);
});
