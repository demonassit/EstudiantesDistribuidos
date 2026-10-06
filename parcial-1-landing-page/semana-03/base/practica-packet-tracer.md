# Práctica complementaria — Packet Tracer: Interacción Cliente-Servidor

**Basada en:** banco oficial Cisco NetAcad, actividad *"Packet Tracer – Client-Server Interaction"* (currículum CCNA/ITN).

**Objetivo:** ver, en modo Simulación de Packet Tracer, el mismo ciclo petición-respuesta que `base/cliente.js` demuestra en código — pero ahora observando los paquetes DNS y HTTP viajar entre cliente y servidor, PDU por PDU.

## Topología

```
   [PC1] ----cable recto---- [Server1]
   192.168.0.10/24            192.168.0.1/24
```

Dos dispositivos, conexión directa (o vía switch si se prefiere una topología con más de un cliente).

## Tabla de direccionamiento

| Dispositivo | Interfaz | IP | Máscara | Gateway |
|---|---|---|---|---|
| PC1 | FastEthernet0 | 192.168.0.10 | 255.255.255.0 | 192.168.0.1 |
| Server1 | FastEthernet0 | 192.168.0.1 | 255.255.255.0 | N/A |

## Pasos

1. Armar la topología: 1 PC, 1 Server, cable de cobre recto (o switch + 2 cables si se agregan más clientes).
2. Configurar las IP de la tabla anterior en la pestaña **Desktop → IP Configuration** (PC) y **Config → FastEthernet0** (Server).
3. En el servidor: **Services → DNS**, activar el servicio y agregar un registro tipo A: `www.cecyt9.local` → `192.168.0.1`.
4. En el servidor: **Services → HTTP**, editar `index.html` para que muestre algo identificable (ej. tu nombre o el de tu equipo).
5. Cambiar a **modo Simulation** (esquina inferior derecha).
6. **Edit Filters** → desmarcar todo excepto `DNS` (pestaña IPv4) y `HTTP` (pestaña Misc), para no saturar la vista con ARP/ICMP.
7. En PC1: **Desktop → Web Browser**, escribir `www.cecyt9.local` y dar clic en **Go**.
8. En el panel de Simulación, dar **Play** (o Auto Capture/Play) y observar el orden de eventos en el Event List.
9. Dar clic en cada PDU y usar **Next Layer** en la ventana de información para inspeccionar las capas OSI involucradas en ese paquete.

## Verificación esperada

El orden de eventos debe ser: consulta DNS (PC→Server) → respuesta DNS con la IP resuelta → petición HTTP GET (PC→Server) → respuesta HTTP (Server→PC), entregada en uno o más segmentos TCP que el PC confirma (ACK).

## Relación con la actividad de esta semana

Esta práctica es el equivalente *visual* de lo que `base/cliente.js` hace en código real contra `GET /api/talleres`: en ambos casos hay una petición, un protocolo de transporte (HTTP sobre TCP) y una respuesta. Útil para tu reporte de Práctica 1: compara explícitamente qué ves en Packet Tracer (paquetes, capas OSI) contra qué ves en la consola al correr `cliente.js` (JSON de respuesta, status code).

## Entregable sugerido

Capturas de pantalla del Event List (orden DNS→HTTP) + 3-4 líneas comparando este ciclo con el observado al ejecutar `cliente.js`.

---
La rúbrica de esta práctica complementaria (si tu docente decide incluirla) la tiene tu docente por separado.

## Fuente

- [3.2.3 Packet Tracer - Client-Server Interaction Answers](https://itexamanswers.net/3-2-3-packet-tracer-client-server-interaction-answers.html) (mirror del banco oficial Cisco NetAcad)
