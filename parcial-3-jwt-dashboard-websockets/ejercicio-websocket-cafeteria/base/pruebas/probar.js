// Pruebas automáticas del ejercicio de la cafetería.
//
//   npm run probar:s1   -> solo lo de la sesión 1 (CRUD de productos + difusión del menú)
//   npm run probar      -> sesiones 1 y 2 (además: pedidos, cocina, mensajes dirigidos, reconexión)
//
// Las pruebas NO tocan tu base "cafeteria": crean su propia base "cafeteria_pruebas"
// desde cero (con los datos de tu .env) y arrancan su propio servidor en el puerto 4599.
const { fork } = require('child_process');
const path = require('path');
const WebSocket = require('ws');
const { crearBaseDeDatos } = require('../bd/crear-bd');

const SESION = Number(process.argv[2] || 2);
const PUERTO = 4599;
const BASE_DATOS = 'cafeteria_pruebas';
const BASE = `http://localhost:${PUERTO}`;
const WS_URL = `ws://localhost:${PUERTO}/tiempo-real`;

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Servidor ----------

let servidor = null;

async function arrancarServidor() {
  servidor = fork(path.join(__dirname, '..', 'server.js'), [], {
    env: { ...process.env, PORT: String(PUERTO), DB_NAME: BASE_DATOS },
    silent: true,
  });
  for (let i = 0; i < 50; i++) {
    await pausa(100);
    if (await fetch(`${BASE}/api/usuarios`).then(() => true, () => false)) return true;
  }
  return false;
}

async function detenerServidor() {
  if (!servidor) return;
  const termino = new Promise((r) => servidor.once('exit', r));
  servidor.kill();
  await termino;
  servidor = null;
}

// ---------- Ayudantes ----------

async function pedir(metodo, ruta, cuerpo) {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const datos = await respuesta.json().catch(() => null);
  return { status: respuesta.status, datos };
}

// Usuarios sembrados: 1 Ana, 2 Luis, 3 María, 4 Diego (alumnos), 5 Cocina.
// Productos sembrados: 1 Torta, 2 Chilaquiles, 3 Molletes, 4 Agua, 5 Café.
function crearPedido(usuarioId = 1, productos = [1]) {
  return pedir('POST', '/api/pedidos', { usuarioId, productos });
}

function cambiarEstado(id, estado) {
  return pedir('PATCH', `/api/pedidos/${id}/estado`, { estado });
}

// Abre un WebSocket y guarda todo lo que llega en .mensajes
function abrirSocket() {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(WS_URL);
    const cliente = {
      socket,
      mensajes: [],
      mandar: (obj) => socket.send(JSON.stringify(obj)),
      // Espera hasta que llegue un mensaje de cierto tipo (o se acabe el tiempo -> null).
      esperar: (tipo, ms = 1500) =>
        new Promise((ok) => {
          const inicio = Date.now();
          (function revisar() {
            const encontrado = cliente.mensajes.find((m) => m.tipo === tipo && !m._usado);
            if (encontrado) {
              encontrado._usado = true;
              return ok(encontrado);
            }
            if (Date.now() - inicio > ms) return ok(null);
            setTimeout(revisar, 20);
          })();
        }),
      cerrar: () => socket.close(),
    };
    socket.on('message', (texto) => cliente.mensajes.push(JSON.parse(texto.toString())));
    socket.on('open', () => resolve(cliente));
    socket.on('error', reject);
  });
}

async function abrirCocina() {
  const cocina = await abrirSocket();
  cocina.mandar({ tipo: 'soy_cocina' });
  await cocina.esperar('bienvenida');
  return cocina;
}

// ---------- Pruebas ----------

const pruebas = [];
function prueba(sesion, nombre, fn) {
  pruebas.push({ sesion, nombre, fn });
}

// ===== Sesión 1: CRUD de productos + difusión a todos =====

prueba(1, 'GET /api/usuarios?rol=alumno trae los 4 alumnos de ejemplo', async () => {
  const r = await pedir('GET', '/api/usuarios?rol=alumno');
  return r.status === 200 && r.datos.length === 4 && r.datos.every((u) => u.rol === 'alumno');
});

prueba(1, 'GET /api/productos trae los 5 productos de ejemplo', async () => {
  const r = await pedir('GET', '/api/productos');
  return r.status === 200 && r.datos.length === 5 && r.datos[0].disponible === true;
});

prueba(1, 'POST /api/productos válido responde 201 con id y disponible true', async () => {
  const r = await pedir('POST', '/api/productos', { nombre: 'Quesadilla', precio: 25 });
  return r.status === 201 && Number.isInteger(r.datos.id) && r.datos.nombre === 'Quesadilla' && r.datos.disponible === true;
});

prueba(1, 'POST sin nombre o con precio inválido responde 400', async () => {
  const sinNombre = await pedir('POST', '/api/productos', { precio: 20 });
  const precioMalo = await pedir('POST', '/api/productos', { nombre: 'Gratis', precio: 0 });
  return sinNombre.status === 400 && precioMalo.status === 400;
});

prueba(1, 'PUT cambia precio y disponible, y GET /api/productos/:id lo refleja', async () => {
  const { datos } = await pedir('POST', '/api/productos', { nombre: 'Tamal', precio: 20 });
  const r = await pedir('PUT', `/api/productos/${datos.id}`, { nombre: 'Tamal verde', precio: 22, disponible: false });
  const g = await pedir('GET', `/api/productos/${datos.id}`);
  return r.status === 200 && g.datos.nombre === 'Tamal verde' && g.datos.precio === 22 && g.datos.disponible === false;
});

prueba(1, 'PUT y DELETE de un producto que no existe responden 404', async () => {
  const put = await pedir('PUT', '/api/productos/9999', { nombre: 'X', precio: 10 });
  const del = await pedir('DELETE', '/api/productos/9999');
  const esDeProducto = (r) => r.status === 404 && r.datos?.error === 'Producto no encontrado';
  return esDeProducto(put) && esDeProducto(del);
});

prueba(1, 'DELETE responde 204 y después GET de ese id responde 404', async () => {
  const { datos } = await pedir('POST', '/api/productos', { nombre: 'Para borrar', precio: 10 });
  const del = await fetch(`${BASE}/api/productos/${datos.id}`, { method: 'DELETE' });
  const g = await pedir('GET', `/api/productos/${datos.id}`);
  return del.status === 204 && g.status === 404;
});

prueba(1, 'DIFUSIÓN A TODOS: dos pantallas reciben "menu_actualizado" con el producto nuevo', async () => {
  const pantalla1 = await abrirSocket();
  const pantalla2 = await abrirSocket();
  await pedir('POST', '/api/productos', { nombre: 'Elote', precio: 20 });
  const m1 = await pantalla1.esperar('menu_actualizado');
  const m2 = await pantalla2.esperar('menu_actualizado');
  pantalla1.cerrar();
  pantalla2.cerrar();
  const tiene = (m) => Boolean(m && m.productos.some((p) => p.nombre === 'Elote'));
  return tiene(m1) && tiene(m2);
});

prueba(1, 'Al hacer PUT y DELETE también se difunde "menu_actualizado"', async () => {
  const { datos } = await pedir('POST', '/api/productos', { nombre: 'Gelatina', precio: 12 });
  const pantalla = await abrirSocket();
  await pedir('PUT', `/api/productos/${datos.id}`, { nombre: 'Gelatina', precio: 12, disponible: false });
  const trasPut = await pantalla.esperar('menu_actualizado');
  await pedir('DELETE', `/api/productos/${datos.id}`);
  const trasDelete = await pantalla.esperar('menu_actualizado');
  pantalla.cerrar();
  return (
    trasPut?.productos.find((p) => p.id === datos.id)?.disponible === false &&
    trasDelete !== null &&
    !trasDelete.productos.some((p) => p.id === datos.id)
  );
});

prueba(1, 'Pedir un producto agotado responde 409', async () => {
  const { datos } = await pedir('POST', '/api/productos', { nombre: 'Pozole', precio: 50 });
  await pedir('PUT', `/api/productos/${datos.id}`, { nombre: 'Pozole', precio: 50, disponible: false });
  const r = await crearPedido(1, [datos.id]);
  return r.status === 409;
});

prueba(1, 'MySQL conserva los productos: el producto nuevo sigue ahí tras reiniciar el servidor', async () => {
  await pedir('POST', '/api/productos', { nombre: 'Sobreviviente', precio: 33 });
  await detenerServidor();
  await arrancarServidor();
  const r = await pedir('GET', '/api/productos');
  return r.status === 200 && r.datos.some((p) => p.nombre === 'Sobreviviente');
});

// ===== Sesión 2: pedidos en tiempo real =====

prueba(2, 'Saltar de "recibido" a "entregado" responde 409', async () => {
  const { datos } = await crearPedido(2, [2]);
  const r = await cambiarEstado(datos.pedido.id, 'entregado');
  return r.status === 409;
});

prueba(2, 'La secuencia recibido → preparando → listo → entregado responde 200 en cada paso', async () => {
  const { datos } = await crearPedido(3, [3]);
  for (const estado of ['preparando', 'listo', 'entregado']) {
    const r = await cambiarEstado(datos.pedido.id, estado);
    if (r.status !== 200) return false;
  }
  return true;
});

prueba(2, 'La cocina se registra con "soy_cocina" y recibe "bienvenida"', async () => {
  const cocina = await abrirSocket();
  cocina.mandar({ tipo: 'soy_cocina' });
  const m = await cocina.esperar('bienvenida');
  cocina.cerrar();
  return m !== null && m.rol === 'cocina';
});

prueba(2, 'GRUPO: dos cocinas reciben "pedido_nuevo" y una pantalla de alumno NO', async () => {
  const cocina1 = await abrirCocina();
  const cocina2 = await abrirCocina();
  const alumno = await abrirSocket();
  const { datos } = await crearPedido(1, [1, 4]);
  const m1 = await cocina1.esperar('pedido_nuevo');
  const m2 = await cocina2.esperar('pedido_nuevo');
  const ajeno = await alumno.esperar('pedido_nuevo', 500); // debe quedarse en null
  cocina1.cerrar();
  cocina2.cerrar();
  alumno.cerrar();
  return m1?.pedido.id === datos.pedido.id && m2?.pedido.id === datos.pedido.id && ajeno === null;
});

prueba(2, 'La cocina recibe "pedido_actualizado" y el aviso NO trae la clave', async () => {
  const cocina = await abrirCocina();
  const { datos } = await crearPedido(2, [5]);
  await cambiarEstado(datos.pedido.id, 'preparando');
  const m = await cocina.esperar('pedido_actualizado');
  cocina.cerrar();
  return m?.pedido.estado === 'preparando' && !('clave' in m.pedido);
});

prueba(2, 'El alumno se suscribe con su clave y recibe "suscrito" con el estado actual', async () => {
  const { datos } = await crearPedido(1, [1]);
  const alumno = await abrirSocket();
  alumno.mandar({ tipo: 'suscribir', pedidoId: datos.pedido.id, clave: datos.clave });
  const m = await alumno.esperar('suscrito');
  alumno.cerrar();
  return m?.pedido.estado === 'recibido';
});

prueba(2, 'DIRIGIDO: el aviso le llega SOLO al dueño del pedido', async () => {
  const pedidoA = (await crearPedido(1, [1])).datos;
  const pedidoB = (await crearPedido(2, [2])).datos;
  const alumnoA = await abrirSocket();
  const alumnoB = await abrirSocket();
  alumnoA.mandar({ tipo: 'suscribir', pedidoId: pedidoA.pedido.id, clave: pedidoA.clave });
  alumnoB.mandar({ tipo: 'suscribir', pedidoId: pedidoB.pedido.id, clave: pedidoB.clave });
  await alumnoA.esperar('suscrito');
  await alumnoB.esperar('suscrito');

  await cambiarEstado(pedidoA.pedido.id, 'preparando');
  const paraA = await alumnoA.esperar('estado_pedido');
  const paraB = await alumnoB.esperar('estado_pedido', 500); // debe quedarse en null
  alumnoA.cerrar();
  alumnoB.cerrar();
  return paraA?.pedido.estado === 'preparando' && paraB === null;
});

prueba(2, 'Suscribirse con una clave incorrecta da "error" y no recibe avisos', async () => {
  const { datos } = await crearPedido(3, [3]);
  const espia = await abrirSocket();
  espia.mandar({ tipo: 'suscribir', pedidoId: datos.pedido.id, clave: 'adivinada' });
  const error = await espia.esperar('error');
  await cambiarEstado(datos.pedido.id, 'preparando');
  const aviso = await espia.esperar('estado_pedido', 500);
  espia.cerrar();
  return error !== null && error.mensaje.includes('Clave') && aviso === null;
});

prueba(2, 'RECONEXIÓN: tras un corte, "suscrito" trae el estado que cambió mientras no había conexión', async () => {
  const { datos } = await crearPedido(4, [4]);
  const id = datos.pedido.id;
  const alumno = await abrirSocket();
  alumno.mandar({ tipo: 'suscribir', pedidoId: id, clave: datos.clave });
  await alumno.esperar('suscrito');

  const cerrado = new Promise((r) => alumno.socket.on('close', r));
  await pedir('POST', '/api/diagnostico/cortar-conexiones');
  await cerrado;

  // Mientras el alumno está desconectado, la cocina avanza el pedido dos veces.
  await cambiarEstado(id, 'preparando');
  await cambiarEstado(id, 'listo');

  const deNuevo = await abrirSocket();
  deNuevo.mandar({ tipo: 'suscribir', pedidoId: id, clave: datos.clave });
  const m = await deNuevo.esperar('suscrito');
  deNuevo.cerrar();
  return m?.pedido.estado === 'listo';
});

prueba(2, 'REINICIO: tras reiniciar el servidor, el pedido sigue en MySQL y el alumno se vuelve a suscribir', async () => {
  const { datos } = await crearPedido(1, [2]);
  await cambiarEstado(datos.pedido.id, 'preparando');
  await detenerServidor();
  await arrancarServidor();
  const alumno = await abrirSocket();
  alumno.mandar({ tipo: 'suscribir', pedidoId: datos.pedido.id, clave: datos.clave });
  const m = await alumno.esperar('suscrito');
  alumno.cerrar();
  return m?.pedido.estado === 'preparando';
});

// Tu turno (sesión 2, paso 6): escribe esta prueba. Crea un pedido, cancélalo
// y luego intenta pasarlo a "preparando". Debe regresar true solo si la
// cancelación respondió 200 y el segundo cambio respondió 409.
prueba(2, 'Un pedido cancelado ya no puede pasar a "preparando" (409)', async () => {
  return false;
});

// ---------- Ejecución ----------

async function main() {
  try {
    await crearBaseDeDatos(BASE_DATOS);
  } catch (error) {
    console.error(`No se pudo crear la base "${BASE_DATOS}": ${error.message}`);
    console.error('Revisa que MySQL esté encendido y los datos de tu archivo .env');
    process.exit(1);
  }

  if (!(await arrancarServidor())) {
    console.error('El servidor no arrancó. Corre "npm start" para ver el error.');
    await detenerServidor();
    process.exit(1);
  }

  const aCorrer = pruebas.filter((p) => p.sesion <= SESION);
  console.log(`\nPruebas de la sesión ${SESION === 1 ? '1' : '1 y 2'} (${aCorrer.length})\n`);
  let pasaron = 0;
  for (const p of aCorrer) {
    let ok = false;
    let detalle = '';
    try {
      ok = await p.fn();
    } catch (error) {
      detalle = ` -> ${error.message}`;
    }
    if (ok) pasaron += 1;
    console.log(`${ok ? '  ✔' : '  ✘'} [S${p.sesion}] ${p.nombre}${detalle}`);
  }
  console.log(`\n${pasaron} de ${aCorrer.length} pruebas pasaron.\n`);

  await detenerServidor();
  process.exit(pasaron === aCorrer.length ? 0 : 1);
}

main();
