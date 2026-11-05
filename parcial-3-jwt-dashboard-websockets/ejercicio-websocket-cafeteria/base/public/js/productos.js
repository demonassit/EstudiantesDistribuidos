// Página de administración del menú: usa el CRUD de /api/productos.
// Ya viene hecha: sirve para probar el CRUD y la difusión sin Postman.

const indicadorCanal = document.getElementById('canal');
const tabla = document.getElementById('tabla-productos');
const errorForm = document.getElementById('error-form');

function pintar(productos) {
  tabla.innerHTML = productos
    .map(
      (p) => `<tr data-id="${p.id}">
        <td>${p.id}</td>
        <td><input type="text" class="campo-nombre" value="${escapar(p.nombre)}"></td>
        <td><input type="number" class="campo-precio" value="${p.precio}" min="1" max="1000" step="1"></td>
        <td><input type="checkbox" class="campo-disponible" ${p.disponible ? 'checked' : ''}></td>
        <td class="acciones-tabla">
          <button class="guardar">Guardar</button>
          <button class="eliminar peligro">Eliminar</button>
        </td>
      </tr>`,
    )
    .join('');
}

async function cargar() {
  pintar(await api('/productos'));
}

// POST: agregar
document.getElementById('form-nuevo').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  errorForm.textContent = '';
  try {
    await api('/productos', {
      method: 'POST',
      body: JSON.stringify({
        nombre: document.getElementById('nombre').value,
        precio: Number(document.getElementById('precio').value),
      }),
    });
    evento.target.reset();
    await cargar();
  } catch (error) {
    errorForm.textContent = error.message;
  }
});

// PUT (guardar o cambiar disponible) y DELETE (eliminar)
tabla.addEventListener('click', async (evento) => {
  const fila = evento.target.closest('tr');
  if (!fila) return;
  const id = fila.dataset.id;
  const esGuardar = evento.target.classList.contains('guardar');
  const esDisponible = evento.target.classList.contains('campo-disponible');
  const esEliminar = evento.target.classList.contains('eliminar');
  if (!esGuardar && !esDisponible && !esEliminar) return;

  try {
    if (esEliminar) {
      if (!confirm('¿Eliminar este producto?')) return;
      await api(`/productos/${id}`, { method: 'DELETE' });
    } else {
      await api(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: fila.querySelector('.campo-nombre').value,
          precio: Number(fila.querySelector('.campo-precio').value),
          disponible: fila.querySelector('.campo-disponible').checked,
        }),
      });
    }
    await cargar();
  } catch (error) {
    avisoFlotante(`${error.status || ''} ${error.message}`);
    await cargar();
  }
});

// Tiempo real: si OTRA pantalla cambia el menú, esta tabla se actualiza sola.
function conectar() {
  const socket = new WebSocket(urlTiempoReal());
  socket.onopen = () => {
    mostrarEstadoCanal(indicadorCanal, true);
    cargar().catch((error) => avisoFlotante(error.message));
  };
  socket.onmessage = (evento) => {
    const mensaje = JSON.parse(evento.data);
    if (mensaje.tipo === 'menu_actualizado') pintar(mensaje.productos);
  };
  socket.onclose = () => {
    mostrarEstadoCanal(indicadorCanal, false);
    setTimeout(conectar, 2000);
  };
}

conectar();
