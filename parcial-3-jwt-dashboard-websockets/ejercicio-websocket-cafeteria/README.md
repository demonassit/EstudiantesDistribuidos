# Ejercicio complementario — Cafetería en tiempo real (MySQL + API REST + WebSocket)

**Distribuidos · Parcial 3 · 2 sesiones de laboratorio · individual**

Un sistema de pedidos para la cafetería del plantel. El menú, los usuarios y los pedidos se guardan en **MySQL**, se
manejan con una **API REST**, y las pantallas se avisan entre sí **al instante** con **WebSocket**. No toca el proyecto
CECyT9: complementa la integradora de la semana 13, donde aplicas este mismo patrón al proyecto.

| Sesión | Cuándo | Guía | Qué construyes |
|---|---|---|---|
| 1 | Semana 12 (9-13 nov) | [GUIA-SESION-1.md](GUIA-SESION-1.md) | El **CRUD de productos** con MySQL y la **difusión a todos**: el menú del alumno cambia solo cuando se agrega, edita o agota un producto |
| 2 | Semana 13 (16-20 nov) | [GUIA-SESION-2.md](GUIA-SESION-2.md) | Pedidos en tiempo real: aviso al **grupo** cocina, aviso **dirigido** al dueño del pedido (con clave), **reconexión** con puesta al día y pruebas automáticas |

## Cómo arrancar

Necesitas Node.js 18 o más nuevo y MySQL encendido.

```bash
cd base
npm install
# copia .env.example como .env y pon tu contraseña de MySQL
npm run bd           # crea la base "cafeteria" con datos de ejemplo (borra la anterior)
                     # (o importa bd/cafeteria.sql en MySQL Workbench: es lo mismo)
npm start            # http://localhost:4500
npm run probar:s1    # pruebas de la sesión 1 (11)
npm run probar       # pruebas de las sesiones 1 y 2 (22)
```

Las pruebas usan su propia base, `cafeteria_pruebas`; no tocan tus datos.

## Qué hay en `base/`

Todo el sistema arranca desde el inicio. Los **usuarios** (4 alumnos y la cocina), los **pedidos**, la máquina de
estados y las pantallas ya vienen resueltos. La **base de datos** también te la damos hecha: `bd/cafeteria.sql` (tablas y
datos de ejemplo, para importar en MySQL Workbench) o `npm run bd`. Lo que te toca está marcado con
`Tu turno (sesión N, paso M)`:

| Archivo | Sesión 1 | Sesión 2 |
|---|---|---|
| `modelos/productos.modelo.js` | `crear`, `actualizar` y `eliminar` (SQL) | — |
| `rutas/productos.rutas.js` | `POST`, `PUT` y `DELETE`, y avisar el menú | — |
| `tiempo-real.js` | `difundirATodos` | `soy_cocina`, `avisarCocina`, final de `suscribir` y `avisarAlumno` |
| `rutas/pedidos.rutas.js` | — | Avisar a la cocina y al alumno |
| `public/js/cliente.js` | Pintar el menú cuando llega `menu_actualizado` | Suscribirse a su pedido, pintarlo y reconectar |
| `pruebas/probar.js` | — | Tu propia prueba |

La rúbrica de esta práctica la tiene tu docente por separado.
