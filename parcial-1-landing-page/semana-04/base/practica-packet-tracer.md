# Práctica complementaria — Packet Tracer: Observar peticiones web (HTTP/TCP/DNS)

**Basada en:** banco oficial Cisco NetAcad, actividades *"Packet Tracer – Observe Web Requests"* y *"Packet Tracer – Investigating the TCP/IP and OSI Models in Action"* (currículum CCNA/ITN).

**Objetivo:** identificar HTTP, TCP y DNS en una traza de Packet Tracer, como contraparte visual de identificarlos con `curl -v` (actividad de esta semana) sobre la API real de CECyT9.

## Topología

```
   [Client] ---- [Switch] ---- [Router] ---- [Switch] ---- [WebServer + DNS]
   192.168.1.10/24                                          192.168.2.1/24
   (nombre configurado en DNS: ciscolearn.cecyt9.local)
```

Puedes simplificarla a `[Client] -- [WebServer]` directo si no quieres introducir un router todavía.

## Pasos

### Parte 1 — Confirmar resolución DNS y conectividad
1. Configurar IP de cliente y servidor.
2. En el servidor: **Services → DNS**, registrar `ciscolearn.cecyt9.local` → IP del servidor.
3. En el servidor: **Services → HTTP**, revisar/editar `index.html`.
4. Desde la CLI del cliente: `ping ciscolearn.cecyt9.local` — debe resolver el nombre y responder.

### Parte 2 — Petición web normal
5. Abrir **Desktop → Web Browser** en el cliente, ir a `ciscolearn.cecyt9.local`.
6. Verificar que la página cargada coincide con el `index.html` del servidor.

### Parte 3 — Modo Simulación
7. Cambiar a **Simulation Mode**. **Edit Filters** → pestaña Misc, dejar solo `TCP` y `HTTP` activos.
8. Repetir la petición del navegador y dar **Play**. Observar en el Event List:
   - El *three-way handshake* TCP (SYN → SYN-ACK → ACK) antes de que aparezca cualquier evento HTTP.
   - El GET HTTP y la respuesta del servidor.
9. (Opcional, para generar más tráfico) Crear un **PDU complejo**: puerto origen 1000, protocolo HTTP, intervalo periódico de 120s, destino el servidor — para ver varias conversaciones TCP superpuestas.

### Parte 4 — Comparar con `curl -v`
10. Correr `curl -v <URL real del backend CECyT9>` en la terminal (actividad de esta semana) y anota las líneas que muestran DNS, conexión TCP y cabeceras HTTP.
11. Pon lado a lado: qué mostró Packet Tracer vs. qué mostró `curl -v` para las mismas 3 capas (DNS, TCP, HTTP).

## Verificación esperada

El handshake TCP siempre ocurre *antes* del primer paquete HTTP; la consulta/respuesta DNS ocurre antes del handshake (si el nombre no estaba ya cacheado). Esto debe coincidir conceptualmente con lo que `curl -v` reporta (resolución de host, `Connected to`, luego cabeceras `>`/`<`).

## Relación con la actividad de esta semana

El entregable es un reporte "Protocolos identificados" con captura de `curl -v` anotada. Esta práctica agrega la vista de paquetes (Packet Tracer) como evidencia adicional de las mismas 3 capas.

## Entregable sugerido

Capturas del Event List (handshake + HTTP) + tabla comparativa Packet Tracer vs. `curl -v` (3 filas: DNS, TCP, HTTP).

---
La rúbrica de esta práctica complementaria (si tu docente decide incluirla) la tiene tu docente por separado.

## Fuente

- [16.4.3 Packet Tracer - Observe Web Requests Answers](https://itexamanswers.net/16-4-3-packet-tracer-observe-web-requests-answers.html) (mirror del banco oficial Cisco NetAcad)
- [3.2.4.6 Packet Tracer - Investigating the TCP/IP and OSI Models in Action](https://www.studocu.com/row/document/jamaa%D8%A9-bnha/computer-networks1/3246-packet-tracer-investigating-the-tcp-ip-and-osi-models-in-action-instructions-ig/45596137)
