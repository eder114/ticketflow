# -*- coding: utf-8 -*-
"""
Diagrama UML de secuencia de TicketFlow: un cliente reserva entradas.

Es el caso de uso mas importante del sistema. Se ve el recorrido completo,
desde la pantalla hasta la base de datos, y los dos finales posibles: que
haya cupos o que ya no queden.

Genera:
    Diagrama_Secuencia_Reserva_TicketFlow.svg
    Diagrama_Secuencia_Reserva_TicketFlow.png
"""

import os
from comun import (AZUL, AZUL_SUAVE, GRIS, LINEA, NARANJA, TINTA,
                   cabecera, guardar, pie, texto)

AQUI = os.path.dirname(os.path.abspath(__file__))
W, H = 2060, 1800

Y_CAJA = 110          # arriba de las cajas de los participantes
ALTO_CAJA = 62
Y_INICIO = 250        # primera flecha
PASO = 58             # distancia entre mensajes
Y_FIN = 1500          # donde terminan las lineas de vida

# nombre mostrado -> x
PARTICIPANTES = [
    ("Cliente", 140, True),
    (":DetalleEventoVista", 450, False),
    (":ReservaControlador", 790, False),
    ("API /api/reservas", 1130, False),
    (":ReservaServicio", 1470, False),
    ("BD PostgreSQL", 1830, False),
]

X = {nombre: x for nombre, x, _ in PARTICIPANTES}

# (desde, hasta, texto, tipo)
# tipo: "llamado" | "respuesta" | "propio"
MENSAJES = [
    ("Cliente", ":DetalleEventoVista", "1. escoge el número de entradas", "llamado"),
    (":DetalleEventoVista", ":DetalleEventoVista", "2. calcula el total a pagar", "propio"),
    ("Cliente", ":DetalleEventoVista", "3. confirmar la reserva", "llamado"),
    (":DetalleEventoVista", ":ReservaControlador", "4. reservar(codigoEvento, numeroEntradas)", "llamado"),
    (":ReservaControlador", "API /api/reservas", "5. POST /api/reservas  (token de sesión)", "llamado"),
    ("API /api/reservas", ":ReservaServicio", "6. crearReserva(cliente, evento, n)", "llamado"),
    (":ReservaServicio", "BD PostgreSQL", "7. SELECT cupos_disponibles FROM vista_evento", "llamado"),
    ("BD PostgreSQL", ":ReservaServicio", "8. cupos disponibles", "respuesta"),
]

# Fragmento alternativo: lo que pasa si hay cupos y lo que pasa si no.
ALT_RAMA_1 = [
    (":ReservaServicio", "BD PostgreSQL", "9. INSERT INTO reserva (estado = 'Reservada')", "llamado"),
    ("BD PostgreSQL", ":ReservaServicio", "10. id_reserva", "respuesta"),
    (":ReservaServicio", "API /api/reservas", "11. reserva creada", "respuesta"),
    ("API /api/reservas", ":ReservaControlador", "12. 201 { id_reserva, valor_total }", "respuesta"),
    (":ReservaControlador", ":DetalleEventoVista", "13. mostrarConfirmacion(reserva)", "llamado"),
    (":DetalleEventoVista", "Cliente", "14. número de la reserva y valor total", "respuesta"),
]

ALT_RAMA_2 = [
    (":ReservaServicio", "API /api/reservas", "15. no alcanzan los cupos", "respuesta"),
    ("API /api/reservas", ":ReservaControlador", "16. 409 { error }", "respuesta"),
    (":ReservaControlador", ":DetalleEventoVista", "17. mostrarError(mensaje)", "llamado"),
    (":DetalleEventoVista", "Cliente", "18. «Ya no quedan cupos suficientes»", "respuesta"),
]


def monigote(x, y):
    p = []
    p.append('<circle cx="%d" cy="%d" r="13" fill="#fff" stroke="%s" stroke-width="2.5"/>' % (x, y - 20, TINTA))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5"/>' % (x, y - 7, x, y + 16, TINTA))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5"/>' % (x - 17, y + 2, x + 17, y + 2, TINTA))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5"/>' % (x, y + 16, x - 13, y + 36, TINTA))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2.5"/>' % (x, y + 16, x + 13, y + 36, TINTA))
    return "\n".join(p)


def flecha(desde, hasta, etiqueta, tipo, y):
    x1, x2 = X[desde], X[hasta]
    p = []

    if tipo == "propio":
        # Mensaje que el objeto se manda a si mismo.
        p.append('<polyline points="%d,%d %d,%d %d,%d %d,%d" fill="none" stroke="%s" '
                 'stroke-width="2" marker-end="url(#cerrada)"/>'
                 % (x1 + 6, y, x1 + 70, y, x1 + 70, y + 26, x1 + 10, y + 26, TINTA))
        p.append(texto(x1 + 82, y + 6, etiqueta, 15, TINTA, "400", "start"))
        return "\n".join(p)

    derecha = x2 > x1
    ox = x1 + (6 if derecha else -6)
    dx = x2 - (10 if derecha else -10)

    if tipo == "respuesta":
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.8" '
                 'stroke-dasharray="8 5" marker-end="url(#abierta)"/>' % (ox, y, dx, y, GRIS))
        color = GRIS
    else:
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2" '
                 'marker-end="url(#cerrada)"/>' % (ox, y, dx, y, TINTA))
        color = TINTA

    p.append(texto((x1 + x2) / 2.0, y - 10, etiqueta, 15, color, "600" if tipo != "respuesta" else "400"))
    return "\n".join(p)


def svg():
    s = [cabecera(W, H)]
    a = s.append

    a('<defs>'
      '<marker id="cerrada" markerWidth="13" markerHeight="13" refX="11" refY="4.5" orient="auto">'
      '<path d="M0,0 L11,4.5 L0,9 z" fill="%s"/></marker>'
      '<marker id="abierta" markerWidth="13" markerHeight="13" refX="11" refY="4.5" orient="auto">'
      '<path d="M0,0 L11,4.5 L0,9" fill="none" stroke="%s" stroke-width="1.8"/></marker>'
      '</defs>' % (TINTA, GRIS))

    # --- líneas de vida ----------------------------------------------------
    for nombre, x, _ in PARTICIPANTES:
        a('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.6" '
          'stroke-dasharray="9 7"/>' % (x, Y_CAJA + ALTO_CAJA, x, Y_FIN, LINEA))

    # --- barras de activación ---------------------------------------------
    activaciones = [
        (":DetalleEventoVista", Y_INICIO - 16, Y_FIN - 40),
        (":ReservaControlador", Y_INICIO + PASO * 3 - 16, Y_FIN - 70),
        ("API /api/reservas", Y_INICIO + PASO * 4 - 16, Y_FIN - 100),
        (":ReservaServicio", Y_INICIO + PASO * 5 - 16, Y_FIN - 130),
        ("BD PostgreSQL", Y_INICIO + PASO * 6 - 16, Y_INICIO + PASO * 7 + 16),
    ]
    for nombre, y1, y2 in activaciones:
        a('<rect x="%d" y="%d" width="12" height="%d" fill="%s" stroke="%s" stroke-width="1.5"/>'
          % (X[nombre] - 6, y1, y2 - y1, AZUL_SUAVE, AZUL))

    # --- mensajes de la parte común ---------------------------------------
    y = Y_INICIO
    for desde, hasta, etiqueta, tipo in MENSAJES:
        a(flecha(desde, hasta, etiqueta, tipo, y))
        y += PASO + (26 if tipo == "propio" else 0)

    # --- fragmento alt -----------------------------------------------------
    alt_y1 = y + 10
    alto_r1 = PASO * len(ALT_RAMA_1) + 30
    alto_r2 = PASO * len(ALT_RAMA_2) + 30
    alt_y2 = alt_y1 + alto_r1 + alto_r2 + 34
    alt_x1, alt_x2 = X["Cliente"] - 70, X["BD PostgreSQL"] + 80

    a('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="%s" stroke-width="2"/>'
      % (alt_x1, alt_y1, alt_x2 - alt_x1, alt_y2 - alt_y1, AZUL))
    a('<path d="M%d %d h86 l16,-16 v-18 h-102 z" fill="%s" stroke="%s" stroke-width="2"/>'
      % (alt_x1, alt_y1 + 34, AZUL_SUAVE, AZUL))
    a(texto(alt_x1 + 18, alt_y1 + 25, "alt", 17, AZUL, "700", "start"))

    y = alt_y1 + 58
    a(texto(alt_x1 + 118, y - 18, "[ el evento tiene cupos suficientes ]", 15, AZUL, "600", "start"))
    for desde, hasta, etiqueta, tipo in ALT_RAMA_1:
        a(flecha(desde, hasta, etiqueta, tipo, y))
        y += PASO

    y_div = alt_y1 + alto_r1 + 34
    a('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2" stroke-dasharray="9 6"/>'
      % (alt_x1, y_div, alt_x2, y_div, AZUL))

    y = y_div + 46
    a(texto(alt_x1 + 118, y - 18, "[ ya no quedan cupos ]", 15, AZUL, "600", "start"))
    for desde, hasta, etiqueta, tipo in ALT_RAMA_2:
        a(flecha(desde, hasta, etiqueta, tipo, y))
        y += PASO

    # --- participantes -----------------------------------------------------
    for nombre, x, es_actor in PARTICIPANTES:
        if es_actor:
            a(monigote(x, Y_CAJA + 6))
            a(texto(x, Y_CAJA + ALTO_CAJA + 8, nombre, 18, TINTA, "700"))
        else:
            ancho_caja = max(220, len(nombre) * 11 + 34)
            a('<rect x="%d" y="%d" width="%d" height="%d" rx="8" fill="%s" stroke="%s" stroke-width="2.2"/>'
              % (x - ancho_caja / 2, Y_CAJA, ancho_caja, ALTO_CAJA, AZUL_SUAVE, AZUL))
            a(texto(x, Y_CAJA + 38, nombre, 17, TINTA, "700"))

    # --- leyenda -----------------------------------------------------------
    lx, ly = 70, H - 232
    a('<rect x="%d" y="%d" width="880" height="96" rx="12" fill="#F8FAFC" stroke="%s" stroke-width="2"/>'
      % (lx, ly, LINEA))
    a(texto(lx + 22, ly + 30, "Cómo se lee", 18, TINTA, "700", "start"))
    a(texto(lx + 22, ly + 58, "Flecha llena: llamado · Flecha punteada: respuesta.", 15, GRIS, "400", "start"))
    a(texto(lx + 22, ly + 80, "El marco alt separa los dos finales posibles del caso de uso.", 15, GRIS, "400", "start"))

    a(pie(W, H, "TicketFlow · Secuencia de la reserva de entradas"))
    a("</svg>")
    return "\n".join(s)


if __name__ == "__main__":
    print("participantes:", len(PARTICIPANTES),
          "| mensajes:", len(MENSAJES) + len(ALT_RAMA_1) + len(ALT_RAMA_2))
    guardar(AQUI, "Diagrama_Secuencia_Reserva_TicketFlow", svg(), W, H)
