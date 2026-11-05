// Pantalla de cocina: ve TODOS los pedidos y los avanza de estado.
// Las acciones van por la API REST (PATCH); los avisos llegan por WebSocket.

const ACCIONES = {
  recibido: [
    { estado: 'preparando', texto: 'Empezar a preparar' },
    { estado: 'cancelado', texto: 'Cancelar', clase: 'peligro' },
  ],
  preparando: [{ estado: 'listo', texto: 'Marcar listo' }],
  listo: [{ estado: 'entregado', texto: 'Entregar' }],
};

const indicadorCanal = document.getElementById('canal');
const pedidos = new Map(); // id -> pedido
const recienLlegados = new Set(); // para resaltar las tarjetas nuevas

function hora(iso) {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function tarjeta(pedido) {
  const botones = (ACCIONES[pedido.estado] || [])
    .map(
      (a) => `<button class="${a.clase || ''}" data-id="${pedido.id}" data-estado="${a.estado}">${a.texto}</button>`,
    )
    .join('');
  return `<article class="pedido ${recienLlegados.has(pedido.id) ? 'nuevo' : ''}">
      <h3><span>${pedido.codigo}</span><span>$${pedido.total}</span></h3>
      <p><strong>${escapar(pedido.alumno)}</strong> · ${hora(pedido.creado)}</p>
      <p>${escapar(pedido.productos.join(', '))}</p>
      <div class="acciones">${botones}</div>
    </article>`;
}

function pintar() {
  const lista = [...pedidos.values()].sort((a, b) => a.id - b.id);
  for (const estado of ['recibido', 'preparando', 'listo']) {
    const deEsteEstado = lista.filter((p) => p.estado === estado);
    document.getElementById(`col-${estado}`).innerHTML = deEsteEstado.map(tarjeta).join('');
    document.getElementById(`n-${estado}`).textContent = deEsteEstado.length;
  }
  document.getElementById('historial').innerHTML = lista
    .filter((p) => p.estado === 'entregado' || p.estado === 'cancelado')
    .reverse()
    .map(
      (p) => `<li>${p.codigo} · ${escapar(p.alumno)} · <span class="etiqueta ${p.estado}">${ETIQUETAS[p.estado]}</span>
              a las ${hora(p.actualizado)}</li>`,
    )
    .join('');
  recienLlegados.clear();
}

// Guarda (o reemplaza) un pedido y vuelve a pintar el tablero.
function actualizar(pedido, esNuevo = false) {
  pedidos.set(pedido.id, pedido);
  if (esNuevo) recienLlegados.add(pedido.id);
  pintar();
}

// Estado completo desde la API REST (al abrir la página y al reconectar).
async function cargarPedidos() {
  const lista = await api('/pedidos');
  pedidos.clear();
  lista.forEach((p) => pedidos.set(p.id, p));
  pintar();
}

// Clic en un botón de acción -> PATCH a la API REST.
document.querySelector('.tablero').addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button[data-estado]');
  if (!boton) return;
  boton.disabled = true;
  try {
    const pedido = await api(`/pedidos/${boton.dataset.id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: boton.dataset.estado }),
    });
    actualizar(pedido);
  } catch (error) {
    // Ej. 409: otra pantalla de cocina ya movió ese pedido.
    avisoFlotante(`${error.status || ''} ${error.message}`);
    boton.disabled = false;
  }
});

// ---------- Tiempo real ----------

function manejarMensaje(mensaje) {
  if (mensaje.tipo === 'pedido_nuevo') {
    actualizar(mensaje.pedido, true);
  } else if (mensaje.tipo === 'pedido_actualizado') {
    actualizar(mensaje.pedido);
  }
}

function conectar() {
  const socket = new WebSocket(urlTiempoReal());

  socket.onopen = () => {
    mostrarEstadoCanal(indicadorCanal, true);
    socket.send(JSON.stringify({ tipo: 'soy_cocina' }));
    // Al (re)conectar se pide el estado completo: lo que haya pasado mientras
    // estábamos desconectados NO nos llegó por el WebSocket.
    cargarPedidos().catch((error) => avisoFlotante(error.message));
  };

  socket.onmessage = (evento) => {
    manejarMensaje(JSON.parse(evento.data));
  };

  socket.onclose = () => {
    mostrarEstadoCanal(indicadorCanal, false);
    setTimeout(conectar, 2000);
  };
}

conectar();
