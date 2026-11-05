// Página del alumno: ve el menú en vivo, hace su pedido (REST) y lo sigue (WebSocket).

const ORDEN = ['recibido', 'preparando', 'listo', 'entregado'];

const formPedido = document.getElementById('form-pedido');
const selectAlumno = document.getElementById('alumno');
const listaMenu = document.getElementById('menu');
const spanTotal = document.getElementById('total');
const errorForm = document.getElementById('error-form');
const seccionFormulario = document.getElementById('formulario');
const seccionSeguimiento = document.getElementById('seguimiento');
const indicadorCanal = document.getElementById('canal');
const contWs = document.getElementById('cont-ws');

let menu = [];
let pedidoActual = null; // { id, codigo, estado, ... }
let clave = null; // secreto que devolvió el POST
let mensajesWs = 0;

// ---------- Alumnos y menú ----------

async function cargarAlumnos() {
  const alumnos = await api('/usuarios?rol=alumno');
  selectAlumno.innerHTML = alumnos.map((a) => `<option value="${a.id}">${escapar(a.nombre)}</option>`).join('');
}

async function cargarMenu() {
  pintarMenu(await api('/productos'));
}

// Dibuja el menú conservando lo que el alumno ya había marcado.
// Si un producto marcado se agota, se desmarca y se avisa.
function pintarMenu(productos) {
  const marcados = productosElegidos();
  menu = productos;
  listaMenu.innerHTML = menu
    .map((p) => {
      const marcado = marcados.includes(p.id) && p.disponible ? 'checked' : '';
      const agotado = p.disponible ? '' : 'disabled';
      return `<li><label class="${p.disponible ? '' : 'agotado'}">
                <span><input type="checkbox" value="${p.id}" ${marcado} ${agotado}>${escapar(p.nombre)}</span>
                <span>${p.disponible ? `$${p.precio}` : 'Agotado'}</span></label></li>`;
    })
    .join('');
  const perdidos = marcados.filter((id) => !menu.some((p) => p.id === id && p.disponible));
  if (perdidos.length > 0) avisoFlotante('Uno de tus productos se acaba de agotar');
  actualizarTotal();
}

function productosElegidos() {
  return [...listaMenu.querySelectorAll('input:checked')].map((c) => Number(c.value));
}

function actualizarTotal() {
  spanTotal.textContent = productosElegidos()
    .map((id) => menu.find((p) => p.id === id).precio)
    .reduce((a, b) => a + b, 0);
}

listaMenu.addEventListener('change', actualizarTotal);

formPedido.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  errorForm.textContent = '';
  try {
    const respuesta = await api('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ usuarioId: Number(selectAlumno.value), productos: productosElegidos() }),
    });
    pedidoActual = respuesta.pedido;
    clave = respuesta.clave;
    mostrarSeguimiento();
  } catch (error) {
    errorForm.textContent = error.message;
  }
});

// ---------- Seguimiento ----------

function mostrarSeguimiento() {
  seccionFormulario.classList.add('oculto');
  seccionSeguimiento.classList.remove('oculto');
  document.getElementById('codigo').textContent = pedidoActual.codigo;
  document.getElementById('detalle').textContent =
    `${pedidoActual.alumno} · ${pedidoActual.productos.join(', ')} · $${pedidoActual.total}`;
  pintarPedido(pedidoActual);
  suscribirme();
}

function pintarPedido(pedido) {
  pedidoActual = pedido;
  const posicion = ORDEN.indexOf(pedido.estado);
  for (const li of document.querySelectorAll('#pasos li')) {
    const i = ORDEN.indexOf(li.dataset.estado);
    li.classList.toggle('hecho', posicion >= 0 && i < posicion);
    li.classList.toggle('actual', i === posicion);
  }
  document.getElementById('aviso-listo').classList.toggle('oculto', pedido.estado !== 'listo');
  document.getElementById('aviso-cancelado').classList.toggle('oculto', pedido.estado !== 'cancelado');
  document.title = pedido.estado === 'listo' ? '¡LISTO! · Mi pedido' : 'Cafetería · Mi pedido';
}

// ---------- Tiempo real ----------
// La página abre UN solo WebSocket al cargar. Por ahí le llegan los cambios del
// menú (sesión 1) y, cuando ya hizo un pedido, los avisos de SU pedido (sesión 2).

let socket = null;

// Sesión 2: "avísame SOLO de mi pedido". La clave prueba que es mío.
function suscribirme() {
  if (pedidoActual && socket && socket.readyState === WebSocket.OPEN) {
    // Tu turno (sesión 2, paso 4): manda el mensaje "suscribir" con el id del
    // pedido y la clave. Recuerda que socket.send() solo acepta texto.
  }
}

function manejarMensaje(mensaje) {
  // Tu turno (sesión 1, paso 5): si es "menu_actualizado", vuelve a dibujar el menú.

  // Tu turno (sesión 2, paso 4): si es "suscrito" o "estado_pedido" y es de MI
  // pedido actual (mismo id), pinta el pedido.

  if (mensaje.tipo === 'error') {
    avisoFlotante(mensaje.mensaje);
  }
}

function conectar() {
  socket = new WebSocket(urlTiempoReal());

  socket.onopen = () => {
    mostrarEstadoCanal(indicadorCanal, true);
    // Al (re)conectar pedimos el estado completo: lo que pasó mientras
    // estábamos desconectados NO nos llegó por el WebSocket.
    cargarMenu().catch((error) => avisoFlotante(error.message));
    suscribirme();
  };

  socket.onmessage = (evento) => {
    mensajesWs += 1;
    contWs.textContent = mensajesWs;
    manejarMensaje(JSON.parse(evento.data));
  };

  socket.onclose = () => {
    mostrarEstadoCanal(indicadorCanal, false);
    // Tu turno (sesión 2, paso 5): vuelve a llamar a conectar() dentro de 2 segundos.
  };
}

// ---------- Botones ----------

document.getElementById('otro').addEventListener('click', () => {
  // El socket sigue abierto (lo necesitamos para el menú); el servidor seguirá
  // mandando avisos del pedido anterior, pero ya no los pintamos.
  pedidoActual = null;
  clave = null;
  formPedido.reset();
  spanTotal.textContent = '0';
  seccionSeguimiento.classList.add('oculto');
  seccionFormulario.classList.remove('oculto');
});

document.getElementById('cortar').addEventListener('click', async () => {
  const { cortadas } = await api('/diagnostico/cortar-conexiones', { method: 'POST' });
  avisoFlotante(`Se ${cortadas === 1 ? 'cortó 1 conexión' : `cortaron ${cortadas} conexiones`} WebSocket`);
});

cargarAlumnos().catch((error) => {
  errorForm.textContent = `No se pudo cargar la lista de alumnos: ${error.message}`;
});
conectar();
