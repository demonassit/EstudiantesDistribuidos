# Práctica complementaria — Packet Tracer: Diseño VLSM

**Basada en:** banco oficial Cisco NetAcad, actividad *"Packet Tracer – Design and Implement a VLSM Addressing Scheme"* (currículum CCNA).

**Objetivo:** aplicar VLSM sobre un bloque de direcciones dado, como verificación práctica (con conectividad real en Packet Tracer) de tus ejercicios de subnetting de esta semana.

## Escenario

Bloque asignado: **192.168.72.0/24**, para 4 laboratorios de cómputo del plantel + 1 enlace WAN entre 2 routers:

| Segmento | Hosts requeridos |
|---|---|
| Lab-A (switch 1) | 58 |
| Lab-B (switch 2) | 29 |
| Lab-C (switch 3) | 15 |
| Lab-D (switch 4) | 7 |
| Enlace WAN (Router1↔Router2) | 2 |

## Cálculo VLSM

Se asigna de mayor a menor para no desperdiciar espacio:

| Segmento | Hosts necesarios | Máscara | Rango | Direcciones útiles | Broadcast |
|---|---|---|---|---|---|
| Lab-A | 58 | /26 (255.255.255.192) | 192.168.72.0 – .63 | .1 – .62 (62 hosts) | .63 |
| Lab-B | 29 | /27 (255.255.255.224) | 192.168.72.64 – .95 | .65 – .94 (30 hosts) | .95 |
| Lab-C | 15 | /27 (255.255.255.224) | 192.168.72.96 – .127 | .97 – .126 (30 hosts) | .127 |
| Lab-D | 7 | /28 (255.255.255.240) | 192.168.72.128 – .143 | .129 – .142 (14 hosts) | .143 |
| WAN | 2 | /30 (255.255.255.252) | 192.168.72.144 – .147 | .145 – .146 (2 hosts) | .147 |

**Ojo:** Lab-C (15 hosts) necesita /27 y no /28 — con /28 solo hay 14 direcciones útiles, insuficientes para 15 equipos. Es un error común en subnetting: antes de fijar la máscara, confirma que `2^(bits de host) - 2 >= hosts requeridos`.

## Topología

```
   [Lab-A LAN] --- [Router1] ===WAN=== [Router2] --- [Lab-C LAN]
                        |                                |
                   [Lab-B LAN]                      [Lab-D LAN]
```

(4 LANs repartidas 2 y 2 entre los dos routers, o las 4 en un solo router con 4 interfaces si no quieres modelar el enlace WAN — en ese caso omite el segmento /30).

## Pasos

1. Armar la topología con 2 routers, 4 switches (uno por laboratorio) y al menos 1 PC por LAN.
2. Asignar a cada interfaz de router la **primera IP útil** de su subred (ej. Lab-A: `192.168.72.1/26` en la interfaz del Router1).
3. Configurar cada PC con una IP dentro del rango útil de su subred y el gateway correspondiente.
4. Configurar el enlace WAN entre routers con el /30 calculado.
5. Verificar con `show ip interface brief` en cada router que las interfaces estén `up/up`.
6. Probar `ping` desde un PC de cada LAN hacia su propio gateway (debe funcionar sin enrutamiento).
7. (Se conecta con la semana 7) Sin rutas estáticas todavía, un `ping` entre PCs de LANs distintas debe **fallar** — es la motivación natural de la práctica de enrutamiento estático de la semana siguiente.

## Verificación esperada

Cada PC hace ping exitoso a su gateway; el `show ip interface brief` no muestra ninguna interfaz en estado `down`; las máscaras configuradas coinciden exactamente con la tabla de arriba.

## Relación con la actividad de esta semana

El entregable es una "hoja de ejercicios de subnetting resuelta". Esta práctica es la verificación *ejecutable* de esos cálculos: si una subred está mal calculada, el ping al gateway falla o Packet Tracer marca la IP como fuera de rango — retroalimentación inmediata que una hoja de papel no da.

## Entregable sugerido

Tabla VLSM completa (con el escenario que te toque) + capturas de `show ip interface brief` y de un ping exitoso PC→gateway por cada LAN.

---
La rúbrica de esta práctica complementaria (si tu docente decide incluirla) la tiene tu docente por separado.

## Fuente

- [11.9.3 Packet Tracer - VLSM Design and Implementation Practice (Answers)](https://itexamanswers.net/11-9-3-packet-tracer-vlsm-design-and-implementation-practice-answers.html) (mirror del banco oficial Cisco NetAcad; escenario numérico recalculado y verificado para esta guía)
