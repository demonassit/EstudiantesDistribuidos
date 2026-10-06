# Práctica complementaria — Packet Tracer: TCP y UDP consolidado (cierre Corte 1)

**Basada en:** banco oficial Cisco NetAcad, actividad *"Packet Tracer – TCP and UDP Communications"* (currículum CCNA).

**Objetivo:** consolidar en una sola topología los protocolos vistos en semanas 3-4 (HTTP, DNS) sumando FTP y correo, y contrastar explícitamente TCP (orientado a conexión) vs. UDP (sin conexión) — como evidencia de apoyo para tu documento integrador de arquitectura + protocolos de este Corte 1.

## Topología

```
                        [Switch]
                       /    |    \
                [HTTP-PC] [FTP-PC] [Mail-PC]
                                |
                          [MultiServer]
                    (HTTP + FTP + DNS + Email)
                       192.168.1.254/24
```

Un único servidor multi-servicio y 2-3 PCs cliente conectados por switch (sin router — todo en la misma subred, foco en los protocolos, no en enrutamiento).

## Pasos

### Parte 1 — Generar tráfico de cada protocolo
1. Configurar IPs de todos los dispositivos en `192.168.1.0/24`.
2. En el MultiServer, activar los servicios: HTTP, FTP, DNS, EMAIL (con al menos 1 cuenta de correo configurada).
3. Desde HTTP-PC: solicitar la página del servidor (navegador).
4. Desde FTP-PC: conectarse por FTP (`ftp 192.168.1.254`, usuario/clave configurados en el servidor) y listar archivos.
5. Desde cualquier PC: `nslookup <nombre-configurado-en-dns>`.
6. Desde Mail-PC: enviar un correo de prueba usando el cliente de email de Packet Tracer.

### Parte 2 — Examinar protocolos en modo Simulación
7. Cambiar a **Simulation Mode**, dejar los filtros TCP y UDP activos (además de HTTP/FTP/DNS/SMTP/POP3 según lo que quieras ver).
8. Repite cada acción de la Parte 1 con la simulación corriendo y, PDU por PDU, anota:
   - Puertos origen/destino de cada conversación.
   - Números de secuencia y ACK cuando aplique (TCP).
   - Banderas TCP observadas: `SYN`, `ACK`, `PSH`, `FIN`.
   - Que las consultas DNS **no** muestran números de secuencia (UDP no establece conexión).

## Preguntas de verificación (respóndelas en tu reporte)

1. ¿Qué se observa cuando varias PDUs de distintos protocolos viajan al mismo tiempo?
2. ¿Cuál es la diferencia principal de comportamiento entre HTTP y FTP a nivel de conexión?
3. ¿Por qué DNS no necesita números de secuencia?
4. Tabla de puertos usados por cada servicio (HTTP, FTP, DNS, SMTP, POP3).

## Relación con la actividad de esta semana

El entregable de esta semana (Corte 1) es el documento de arquitectura + protocolos, coordinado con Web. Esta práctica te da evidencia concreta y visual de "protocolo + puerto + tipo de transporte (TCP/UDP)" para cada servicio, que puedes citar directamente en ese documento como anexo.

## Entregable sugerido

Tabla protocolo → puerto → transporte (TCP/UDP) llenada con lo observado + respuestas a las 4 preguntas de verificación.

---
La rúbrica de esta práctica complementaria (si tu docente decide incluirla) la tiene tu docente por separado.

## Fuente

- [14.8.1 Packet Tracer - TCP and UDP Communications (Answers)](https://itexamanswers.net/14-8-1-packet-tracer-tcp-and-udp-communications-answers.html) (mirror del banco oficial Cisco NetAcad)
