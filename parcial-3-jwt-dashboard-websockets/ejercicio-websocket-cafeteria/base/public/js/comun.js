// Funciones que usan las dos páginas (cliente y cocina).

const ETIQUETAS = {
  recibido: 'Recibido',
  preparando: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

// Evita que un nombre con < o > se interprete como HTML al usar innerHTML.
function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Dirección del WebSocket: mismo servidor y puerto que la página.
// ws:// en local; wss:// si la página se abrió con https://
function urlTiempoReal() {
  const protocolo = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocolo}//${location.host}/tiempo-real`;
}

// Petición a la API REST. Si la respuesta no es 2xx lanza un Error con el
// mensaje que mandó el servidor y el código HTTP en error.status.
async function api(ruta, opciones = {}) {
  const respuesta = await fetch(`/api${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(cuerpo.error || `Error ${respuesta.status}`);
    error.status = respuesta.status;
    throw error;
  }
  return cuerpo;
}

function mostrarEstadoCanal(elemento, conectado) {
  elemento.textContent = conectado ? 'Tiempo real: conectado' : 'Tiempo real: desconectado';
  elemento.classList.toggle('conectado', conectado);
  elemento.classList.toggle('desconectado', !conectado);
}

let temporizadorAviso = null;
function avisoFlotante(texto) {
  let caja = document.querySelector('.aviso-flotante');
  if (!caja) {
    caja = document.createElement('div');
    caja.className = 'aviso-flotante';
    document.body.appendChild(caja);
  }
  caja.textContent = texto;
  caja.classList.remove('oculto');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => caja.classList.add('oculto'), 4000);
}
