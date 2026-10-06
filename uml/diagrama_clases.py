# -*- coding: utf-8 -*-
"""
Diagrama UML de clases de TicketFlow.

Las clases del dominio con sus atributos, sus metodos y las relaciones entre
ellas, incluida la herencia de Cliente, Agente y Administrador desde Persona.

Genera:
    Diagrama_Clases_TicketFlow.svg
    Diagrama_Clases_TicketFlow.png
"""

import os
from comun import (AZUL, AZUL_SUAVE, GRIS, LINEA, NARANJA, TINTA,
                   cabecera, escapar, guardar, pie, texto)

AQUI = os.path.dirname(os.path.abspath(__file__))
W, H = 2360, 1620

CAB = 40
FILA = 25
SEP = 8

# nombre -> (x, y, [atributos], [metodos], esEnum)
CLASES = {
    "Pais": (60, 90, ["- idPais: int", "- nombre: String"], [], False),
    "Departamento": (60, 280, ["- idDepartamento: int", "- nombre: String"], [], False),
    "Ciudad": (60, 470, ["- idCiudad: int", "- nombre: String"], [], False),

    "Persona": (700, 90,
                ["- identificacion: String", "- nombres: String", "- apellidos: String",
                 "- correo: String", "- contrasena: String", "- direccion: String"],
                ["+ nombreCompleto(): String", "+ verificarContrasena(c: String): boolean"],
                False),
    "Telefono": (1200, 90, ["- numero: String"], [], False),

    "Cliente": (520, 760, ["- puntos: int", "- vePublicidad: boolean"],
                ["+ reservar(e: Evento, n: int): Reserva", "+ misReservas(): List<Reserva>"], False),
    "Agente": (960, 760, ["- comision: decimal", "- experiencia: int"],
               ["+ registrarEvento(): Evento", "+ cambiarEstado(e: Evento)",
                "+ administrarReservas()"], False),
    "Administrador": (140, 760, ["- salario: decimal", "- horario: String"],
                      ["+ consultarReportes(): Reporte"], False),

    "Evento": (1550, 430,
               ["- codigoEvento: int", "- nombre: String", "- descripcion: String",
                "- teatro: String", "- fechaHoraInicio: DateTime", "- fechaHoraFin: DateTime",
                "- capacidadTotal: int", "- precioBase: decimal", "- observaciones: String",
                "- estado: EstadoEvento", "- causaCancelacion: String",
                "/ cuposDisponibles: int"],
               ["+ cuposDisponibles(): int", "+ cambiarEstado(e: EstadoEvento)",
                "+ hayCupo(n: int): boolean"],
               False),

    "Reserva": (1550, 1030,
                ["- idReserva: int", "- fechaHora: DateTime", "- numeroEntradas: int",
                 "- observaciones: String", "- estado: EstadoReserva",
                 "- causaCancelacion: String", "/ valorTotal: decimal"],
                ["+ valorTotal(): decimal", "+ confirmar()", "+ cancelar(causa: String)"],
                False),

    "EstadoEvento": (1990, 430,
                     ["Programado", "En Boleteria", "En Vivo", "Finalizado", "Cancelado"],
                     [], True),
    "EstadoReserva": (1990, 1030, ["Reservada", "Confirmada", "Cancelada"], [], True),
}

# (desde, hasta, tipo, etiqueta, multiplicidad desde, multiplicidad hasta)
# tipo: "asociacion" | "composicion" | "herencia" | "dependencia"
RELACIONES = [
    ("Pais", "Departamento", "asociacion", "tiene", "1", "0..*"),
    ("Departamento", "Ciudad", "asociacion", "tiene", "1", "0..*"),
    ("Ciudad", "Persona", "asociacion", "reside en", "1", "0..*"),
    ("Ciudad", "Evento", "asociacion", "se realiza en", "1", "0..*"),
    ("Persona", "Telefono", "composicion", "posee", "1", "0..*"),
    ("Cliente", "Persona", "herencia", "", "", ""),
    ("Agente", "Persona", "herencia", "", "", ""),
    ("Administrador", "Persona", "herencia", "", "", ""),
    ("Agente", "Evento", "asociacion", "registra", "1", "0..*"),
    ("Cliente", "Reserva", "asociacion", "realiza", "1", "0..*"),
    ("Evento", "Reserva", "asociacion", "genera", "1", "0..*"),
    ("Evento", "EstadoEvento", "dependencia", "", "", ""),
    ("Reserva", "EstadoReserva", "dependencia", "", "", ""),
]


def ancho(nombre):
    x, y, attrs, mets, es_enum = CLASES[nombre]
    largo = max([len(nombre) + 4] + [len(t) for t in attrs + mets])
    return max(230, int(largo * 8.4) + 36)


def alto(nombre):
    _, _, attrs, mets, es_enum = CLASES[nombre]
    h = CAB + SEP * 2 + FILA * len(attrs)
    if mets:
        h += SEP * 2 + FILA * len(mets)
    return h


def caja(nombre):
    x, y, _, _, _ = CLASES[nombre]
    return x, y, ancho(nombre), alto(nombre)


def borde(nombre, hacia):
    """Punto del rectangulo mas cercano a 'hacia'."""
    x, y, w, h = caja(nombre)
    cx, cy = x + w / 2.0, y + h / 2.0
    dx, dy = hacia[0] - cx, hacia[1] - cy
    if dx == 0 and dy == 0:
        return cx, cy
    # Se escoge el lado por el que sale la recta del centro al destino.
    if abs(dx) / (w / 2.0) > abs(dy) / (h / 2.0):
        px = cx + (w / 2.0) * (1 if dx > 0 else -1)
        py = cy + dy * ((w / 2.0) / abs(dx))
    else:
        py = cy + (h / 2.0) * (1 if dy > 0 else -1)
        px = cx + dx * ((h / 2.0) / abs(dy))
    return px, py


def centro(nombre):
    x, y, w, h = caja(nombre)
    return x + w / 2.0, y + h / 2.0


def pintar_clase(nombre):
    x, y, attrs, mets, es_enum = CLASES[nombre]
    w, h = ancho(nombre), alto(nombre)
    p = []
    p.append('<rect x="%d" y="%d" width="%d" height="%d" rx="8" fill="#fff" stroke="%s" stroke-width="2.2"/>'
             % (x, y, w, h, AZUL))
    p.append('<path d="M%d %d h%d v-%d a8,8 0 0 0 -8,-8 h-%d a8,8 0 0 0 -8,8 z" fill="%s"/>'
             % (x, y + CAB, w, CAB - 8, w - 16, AZUL_SUAVE))
    p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2"/>'
             % (x, y + CAB, x + w, y + CAB, AZUL))

    titulo_y = y + 20 if es_enum else y + 27
    if es_enum:
        p.append(texto(x + w / 2.0, y + 17, "«enumeration»", 12, GRIS, "600"))
        p.append(texto(x + w / 2.0, y + 34, nombre, 19, TINTA, "700"))
    else:
        p.append(texto(x + w / 2.0, titulo_y, nombre, 20, TINTA, "700"))

    fy = y + CAB + SEP + 17
    for t in attrs:
        p.append(texto(x + 14, fy, t, 15, TINTA, "400", "start"))
        fy += FILA

    if mets:
        linea_y = y + CAB + SEP * 2 + FILA * len(attrs)
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1.5"/>'
                 % (x, linea_y, x + w, linea_y, LINEA))
        fy = linea_y + SEP + 17
        for t in mets:
            p.append(texto(x + 14, fy, t, 15, AZUL, "400", "start"))
            fy += FILA
    return "\n".join(p)


def svg():
    s = [cabecera(W, H)]
    a = s.append

    a('<defs>'
      '<marker id="triangulo" markerWidth="16" markerHeight="16" refX="14" refY="6" orient="auto">'
      '<path d="M0,0 L14,6 L0,12 z" fill="#fff" stroke="%s" stroke-width="1.8"/></marker>'
      '<marker id="rombo" markerWidth="18" markerHeight="12" refX="1" refY="6" orient="auto">'
      '<path d="M0,6 L8,1 L16,6 L8,11 z" fill="%s" stroke="%s" stroke-width="1.5"/></marker>'
      '<marker id="punta" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto">'
      '<path d="M0,0 L10,4 L0,8" fill="none" stroke="%s" stroke-width="1.8"/></marker>'
      '</defs>' % (TINTA, TINTA, TINTA, GRIS))

    # La herencia se dibuja con un solo tronco y un solo triángulo, que es la
    # forma en que se representa cuando varias clases heredan de la misma.
    hijas = [d for d, h, t, _, _, _ in RELACIONES if t == "herencia"]
    if hijas:
        padre = [h for d, h, t, _, _, _ in RELACIONES if t == "herencia"][0]
        px, py, pw, ph = caja(padre)
        tronco_x = px + pw / 2.0
        bus_y = min(CLASES[c][1] for c in hijas) - 80
        for hija in hijas:
            hx, hy, hw, _ = caja(hija)
            cx = hx + hw / 2.0
            a('<polyline points="%.1f,%.1f %.1f,%.1f" fill="none" stroke="%s" stroke-width="2"/>'
              % (cx, hy, cx, bus_y, TINTA))
        a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2"/>'
          % (min(caja(h)[0] + caja(h)[2] / 2.0 for h in hijas), bus_y,
             max(caja(h)[0] + caja(h)[2] / 2.0 for h in hijas), bus_y, TINTA))
        a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2" '
          'marker-end="url(#triangulo)"/>' % (tronco_x, bus_y, tronco_x, py + ph + 2, TINTA))

    etiquetas = []
    for desde, hasta, tipo, nombre, m1, m2 in RELACIONES:
        if tipo == "herencia":
            continue
        c1, c2 = centro(desde), centro(hasta)
        x1, y1 = borde(desde, c2)
        x2, y2 = borde(hasta, c1)

        if tipo == "composicion":
            a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2" '
              'marker-start="url(#rombo)"/>' % (x1, y1, x2, y2, TINTA))
        elif tipo == "dependencia":
            a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.8" '
              'stroke-dasharray="7 5" marker-end="url(#punta)"/>' % (x1, y1, x2, y2, GRIS))
        else:
            a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2"/>'
              % (x1, y1, x2, y2, TINTA))

        if nombre:
            etiquetas.append(((x1 + x2) / 2.0, (y1 + y2) / 2.0, nombre, NARANJA, 14))
        if m1:
            etiquetas.append((x1 + (x2 - x1) * 0.13, y1 + (y2 - y1) * 0.13 - 4, m1, TINTA, 14))
        if m2:
            etiquetas.append((x1 + (x2 - x1) * 0.87, y1 + (y2 - y1) * 0.87 - 4, m2, TINTA, 14))

    for nombre in CLASES:
        a(pintar_clase(nombre))

    for ex, ey, et, color, tam in etiquetas:
        w_et = len(et) * (tam * 0.56) + 10
        a('<rect x="%.1f" y="%.1f" width="%.1f" height="%d" rx="4" fill="#fff" opacity="0.94"/>'
          % (ex - w_et / 2.0, ey - tam, w_et, tam + 6))
        a(texto(ex, ey, et, tam, color, "600"))

    # --- leyenda -----------------------------------------------------------
    lx, ly = 700, 1340
    a('<rect x="%d" y="%d" width="560" height="170" rx="12" fill="#F8FAFC" stroke="%s" stroke-width="2"/>'
      % (lx, ly, LINEA))
    a(texto(lx + 22, ly + 32, "Cómo se lee", 18, TINTA, "700", "start"))
    for i, linea in enumerate([
        "Triángulo hueco: herencia (Cliente es una Persona).",
        "Rombo lleno: composición (el teléfono no existe sin su persona).",
        "Línea simple: asociación, con su multiplicidad en cada extremo.",
        "Línea punteada: dependencia de una enumeración.",
        "La barra / marca un atributo derivado: se calcula, no se guarda."
    ]):
        a(texto(lx + 22, ly + 60 + i * 23, linea, 14, GRIS, "400", "start"))

    a(pie(W, H, "TicketFlow · Diagrama de clases"))
    a("</svg>")
    return "\n".join(s)


if __name__ == "__main__":
    print("clases:", len(CLASES), "| relaciones:", len(RELACIONES))
    guardar(AQUI, "Diagrama_Clases_TicketFlow", svg(), W, H)
