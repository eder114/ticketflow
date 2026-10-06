# -*- coding: utf-8 -*-
"""
Diagrama UML de casos de uso de TicketFlow.

Los tres actores del enunciado (Cliente, Agente y Administrador), el limite
del sistema y lo que puede hacer cada uno.

Genera:
    Casos_de_Uso_TicketFlow.svg
    Casos_de_Uso_TicketFlow.png
"""

import os
from comun import (AZUL, AZUL_SUAVE, GRIS, LINEA, NARANJA, TINTA,
                   cabecera, guardar, multilinea, pie, texto)

AQUI = os.path.dirname(os.path.abspath(__file__))
W, H = 1760, 1180

RX, RY = 148, 44          # tamaño de los óvalos
LIMITE = (300, 60, 1150, 980)   # x, y, ancho, alto del límite del sistema

# nombre -> (x, y, lineas del texto)
CASOS = {
    "registrarse":      (470, 150, ["Registrarse en", "la plataforma"]),
    "iniciar-sesion":   (925, 150, ["Iniciar sesión"]),

    "catalogo":         (470, 300, ["Consultar el", "catálogo de eventos"]),
    "detalle":          (470, 430, ["Ver el detalle", "de un evento"]),
    "reservar":         (470, 585, ["Reservar entradas"]),
    "mis-reservas":     (470, 730, ["Consultar mis", "reservas y su estado"]),

    "cupos":            (925, 585, ["Verificar los cupos", "disponibles"]),
    "causa":            (925, 780, ["Registrar la causa", "de la cancelación"]),

    "registrar-evento": (1300, 300, ["Registrar un", "evento"]),
    "estado-evento":    (1300, 430, ["Administrar el", "estado del evento"]),
    "admin-reservas":   (1300, 585, ["Administrar las", "reservas del evento"]),
    "reportes":         (1300, 760, ["Consultar los", "reportes del sistema"]),
    "maestros":         (1300, 890, ["Administrar los", "datos del sistema"]),
}

# actor -> (x, y, nombre, [casos con los que se asocia])
ACTORES = {
    "cliente": (130, 480, "Cliente",
                ["registrarse", "catalogo", "detalle", "reservar", "mis-reservas"]),
    "agente": (1620, 380, "Agente",
               ["registrarse", "registrar-evento", "estado-evento", "admin-reservas"]),
    "administrador": (1620, 830, "Administrador",
                      ["reportes", "maestros"]),
}

# (origen, destino) — el origen incluye siempre al destino
INCLUDE = [
    ("reservar", "iniciar-sesion"),
    ("reservar", "cupos"),
    ("mis-reservas", "iniciar-sesion"),
    ("registrar-evento", "iniciar-sesion"),
    ("admin-reservas", "iniciar-sesion"),
    ("reportes", "iniciar-sesion"),
    ("maestros", "iniciar-sesion"),
]

# (caso que extiende, caso base) — pasa solo en ciertas condiciones
EXTEND = [
    ("causa", "estado-evento"),
    ("causa", "admin-reservas"),
]


def borde(caso, hacia):
    """Punto del óvalo en la dirección del punto 'hacia'."""
    cx, cy = CASOS[caso][0], CASOS[caso][1]
    dx, dy = hacia[0] - cx, hacia[1] - cy
    if dx == 0 and dy == 0:
        return cx, cy
    # Parametrización de la elipse en la dirección del vector.
    k = ((dx / RX) ** 2 + (dy / RY) ** 2) ** 0.5
    return cx + dx / k, cy + dy / k


def monigote(x, y, nombre):
    """El actor: cabeza, cuerpo, brazos, piernas y su nombre debajo."""
    p = []
    p.append('<circle cx="%d" cy="%d" r="19" fill="#fff" stroke="%s" stroke-width="3"/>' % (x, y - 54, TINTA))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="3"/>' % (x, y - 35, x, y + 18, TINTA))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="3"/>' % (x - 30, y - 14, x + 30, y - 14, TINTA))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="3"/>' % (x, y + 18, x - 24, y + 58, TINTA))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="3"/>' % (x, y + 18, x + 24, y + 58, TINTA))
    p.append(texto(x, y + 86, nombre, 20, TINTA, "700"))
    return "\n".join(p)


def svg():
    s = [cabecera(W, H)]
    a = s.append

    a('<defs>'
      '<marker id="flecha" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto">'
      '<path d="M0,0 L10,4 L0,8" fill="none" stroke="%s" stroke-width="1.8"/></marker>'
      '</defs>' % NARANJA)

    # --- límite del sistema ------------------------------------------------
    lx, ly, lw, lh = LIMITE
    a('<rect x="%d" y="%d" width="%d" height="%d" rx="18" fill="#FBFBFF" '
      'stroke="%s" stroke-width="2.5"/>' % (lx, ly, lw, lh, AZUL))
    a(texto(lx + lw / 2.0, ly + 36, "TicketFlow", 23, AZUL, "700"))

    # --- asociaciones actor / caso de uso ----------------------------------
    for ax, ay, _, casos in ACTORES.values():
        for caso in casos:
            bx, by = borde(caso, (ax, ay))
            a('<line x1="%d" y1="%d" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.8"/>'
              % (ax, ay, bx, by, GRIS))

    # --- include y extend --------------------------------------------------
    etiquetas = []   # se pintan al final, encima de los óvalos
    for origen, destino in INCLUDE:
        ox, oy = borde(origen, (CASOS[destino][0], CASOS[destino][1]))
        dx, dy = borde(destino, (CASOS[origen][0], CASOS[origen][1]))
        a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.8" '
          'stroke-dasharray="7 5" marker-end="url(#flecha)"/>' % (ox, oy, dx, dy, NARANJA))
        etiquetas.append((ox + (dx - ox) * 0.30, oy + (dy - oy) * 0.30, "«include»", NARANJA))

    for origen, destino in EXTEND:
        ox, oy = borde(origen, (CASOS[destino][0], CASOS[destino][1]))
        dx, dy = borde(destino, (CASOS[origen][0], CASOS[origen][1]))
        a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.8" '
          'stroke-dasharray="7 5" marker-end="url(#flecha)"/>' % (ox, oy, dx, dy, AZUL))
        etiquetas.append(((ox + dx) / 2.0, (oy + dy) / 2.0, "«extend»", AZUL))

    # --- casos de uso ------------------------------------------------------
    for x, y, lineas in CASOS.values():
        a('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="#fff" stroke="%s" stroke-width="2.2"/>'
          % (x, y, RX, RY, AZUL))
        a(multilinea(x, y, lineas, 16, TINTA, "600"))

    # --- etiquetas de include y extend, encima de todo ---------------------
    for ex, ey, et, color in etiquetas:
        ancho_et = len(et) * 7 + 8
        a('<rect x="%.1f" y="%.1f" width="%d" height="18" rx="4" fill="#fff" opacity="0.92"/>'
          % (ex - ancho_et / 2.0, ey - 14, ancho_et))
        a(texto(ex, ey, et, 13, color, "600"))

    # --- actores -----------------------------------------------------------
    for x, y, nombre, _ in ACTORES.values():
        a(monigote(x, y, nombre))

    # --- leyenda -----------------------------------------------------------
    lgx, lgy = 340, 920
    a('<rect x="%d" y="%d" width="700" height="86" rx="12" fill="#F8FAFC" stroke="%s" stroke-width="2"/>'
      % (lgx, lgy, LINEA))
    a(texto(lgx + 22, lgy + 32, "Cómo se lee", 18, TINTA, "700", "start"))
    a(texto(lgx + 22, lgy + 62,
            "«include»: el caso base siempre ejecuta al incluido.", 16, GRIS, "400", "start"))
    a(texto(lgx + 22, lgy + 76, "«extend»: el caso extendido pasa solo en ciertas condiciones.", 16, GRIS, "400", "start"))

    a(pie(W, H, "TicketFlow · Diagrama de casos de uso"))
    a("</svg>")
    return "\n".join(s)


if __name__ == "__main__":
    print("casos de uso:", len(CASOS), "| actores:", len(ACTORES),
          "| include:", len(INCLUDE), "| extend:", len(EXTEND))
    guardar(AQUI, "Casos_de_Uso_TicketFlow", svg(), W, H)
