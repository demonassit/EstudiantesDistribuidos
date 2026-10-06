# Práctica complementaria — Packet Tracer: Enrutamiento estático básico

**Basada en:** banco oficial Cisco NetAcad, actividad *"Packet Tracer – Basic Static Route Configuration"* (currículum CCNA).

**Objetivo:** configurar rutas estáticas entre 2 subredes (mínimo pedido en el entregable de esta semana) y verificar conectividad de extremo a extremo con `ping`.

## Topología

```
[PC1] --- [Router1] ===Serial=== [Router2] --- [PC2]
192.168.10.0/24                          192.168.20.0/24
```

Continúa directamente de la práctica de VLSM de la semana 6: aquí resuelves el problema que quedó pendiente ahí (PCs de LANs distintas no se hacían ping porque faltaban rutas).

## Tabla de direccionamiento

| Dispositivo | Interfaz | IP | Máscara | Gateway |
|---|---|---|---|---|
| Router1 | Fa0/0 | 192.168.10.1 | 255.255.255.0 | N/A |
| Router1 | S0/0/0 (DCE) | 192.168.1.1 | 255.255.255.252 | N/A |
| Router2 | Fa0/0 | 192.168.20.1 | 255.255.255.0 | N/A |
| Router2 | S0/0/0 | 192.168.1.2 | 255.255.255.252 | N/A |
| PC1 | NIC | 192.168.10.10 | 255.255.255.0 | 192.168.10.1 |
| PC2 | NIC | 192.168.20.10 | 255.255.255.0 | 192.168.20.1 |

## Pasos

1. Armar la topología: 2 routers unidos por cable serial, cada uno con un switch y un PC en su LAN.
2. Configurar las interfaces según la tabla (recuerda `no shutdown` en cada interfaz, y `clock rate 64000` en el extremo DCE del serial).
3. Configurar gateway en ambos PCs.
4. **Antes de configurar rutas:** prueba `ping 192.168.20.10` desde PC1 — debe **fallar** (cada router solo conoce sus redes directamente conectadas).
5. En Router1, agrega la ruta hacia la red remota:
   ```
   ip route 192.168.20.0 255.255.255.0 192.168.1.2
   ```
6. En Router2, agrega la ruta simétrica:
   ```
   ip route 192.168.10.0 255.255.255.0 192.168.1.1
   ```
7. Repite el `ping` de PC1 a PC2 — ahora debe ser exitoso.
8. Verifica con `show ip route` en ambos routers que aparezca la ruta estática (marcada con `S`).

## Verificación esperada

- Antes de las rutas: `ping` entre PC1 y PC2 con 100% de pérdida (`Destination host unreachable` o timeouts).
- Después de las rutas: `ping` exitoso (0% de pérdida) en ambas direcciones.
- `show ip route` en Router1 muestra `S 192.168.20.0/24 [1/0] via 192.168.1.2`, y el espejo en Router2.

## Extensión opcional (para ir más allá del mínimo pedido)

El banco oficial usa una variante con **3 routers** (R1–R2–R3, con R2 en medio conectando dos ramas distintas), útil si quieres practicar rutas estáticas que no son directamente adyacentes (requieren 2 saltos) y la ruta por defecto (`ip route 0.0.0.0 0.0.0.0 <next-hop>`) para simplificar la configuración del router en el extremo. Ver la fuente para el direccionamiento completo de esa variante.

## Relación con la actividad de esta semana

Esta práctica **es** literalmente el entregable de esta semana ("configurar direcciones IP estáticas, crear una ruta entre 2 subredes, verificar conectividad con ping"), llevado a Packet Tracer con comandos IOS reales.

## Entregable sugerido

Capturas de: `ping` fallido antes de las rutas, comandos de configuración de rutas, `ping` exitoso después, y `show ip route` de ambos routers.

---
La rúbrica de esta práctica complementaria (si tu docente decide incluirla) la tiene tu docente por separado.

## Fuente

- [2.8.1 Packet Tracer - Basic Static Route Configuration Answers](https://itexamanswers.net/2-8-1-packet-tracer-basic-static-route-configuration-answers.html) (mirror del banco oficial Cisco NetAcad)
