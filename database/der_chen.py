# -*- coding: utf-8 -*-
"""
Diagrama Entidad-Relación de TicketFlow en notación de Chen.

El modelo sale del enunciado del Proyecto Integrador. Genera tres archivos
en esta misma carpeta:

    DER_Chen_TicketFlow.svg       imagen vectorial
    DER_Chen_TicketFlow.png       imagen para documentos (requiere Chrome)
    DER_Chen_TicketFlow.drawio    editable en draw.io / diagrams.net

Notación:
    rectángulo          entidad
    rectángulo doble    entidad débil
    rombo               relación
    rombo doble         relación identificadora
    elipse              atributo
    elipse doble        atributo multivaluado
    elipse punteada     atributo derivado
    subrayado           clave primaria
    subrayado punteado  clave parcial (entidad débil)
    línea doble         participación total
"""

import os
import subprocess
import tempfile
import shutil

AQUI = os.path.dirname(os.path.abspath(__file__))
W, H = 3320, 1960

# --- colores ---------------------------------------------------------------
TINTA = "#111827"
AZUL = "#635BFF"
AZUL_SUAVE = "#EEEDFF"
VERDE = "#0F766E"
VERDE_SUAVE = "#E7F4F2"
AMBAR = "#B45309"
AMBAR_SUAVE = "#FCF2E5"
LINEA = "#64748B"
FONDO = "#FFFFFF"

# --- entidades: nombre -> (x, y, débil) ------------------------------------
ENTIDADES = {
    "PAIS":          (300, 200, False),
    "DEPARTAMENTO":  (1000, 200, False),
    "CIUDAD":        (1700, 200, False),
    "PERSONA":       (1000, 700, False),
    "TELEFONO":      (1000, 1180, True),
    "CLIENTE":       (1700, 1000, False),
    "AGENTE":        (1700, 1300, False),
    "ADMINISTRADOR": (400, 1050, False),
    "EVENTO":        (2400, 700, False),
    "RESERVA":       (2400, 1400, False),
}

# --- relaciones: nombre -> (x, y, identificadora, etiqueta visible) --------
RELACIONES = {
    "R_TIENE_DPTO":   (650, 200, False, "tiene"),
    "R_TIENE_CIUDAD": (1350, 200, False, "tiene"),
    "R_RESIDE":       (1350, 450, False, "reside en"),
    "R_SE_REALIZA":   (2050, 450, False, "se realiza en"),
    "R_POSEE":        (1000, 950, True, "posee"),
    "R_ES_CLIENTE":   (1350, 850, False, "es"),
    "R_ES_AGENTE":    (1350, 1150, False, "es"),
    "R_ES_ADMIN":     (700, 900, False, "es"),
    "R_REGISTRA":     (2050, 1000, False, "registra"),
    "R_REALIZA":      (2050, 1400, False, "realiza"),
    "R_GENERA":       (2400, 1050, False, "genera"),
}

# --- aristas: (relación, entidad, cardinalidad, total, lado) ---------------
ARISTAS = [
    ("R_TIENE_DPTO", "PAIS", "1", False),
    ("R_TIENE_DPTO", "DEPARTAMENTO", "N", True),
    ("R_TIENE_CIUDAD", "DEPARTAMENTO", "1", False),
    ("R_TIENE_CIUDAD", "CIUDAD", "N", True),
    ("R_RESIDE", "CIUDAD", "1", False),
    ("R_RESIDE", "PERSONA", "N", True),
    ("R_SE_REALIZA", "CIUDAD", "1", False),
    ("R_SE_REALIZA", "EVENTO", "N", True),
    ("R_POSEE", "PERSONA", "1", False),
    ("R_POSEE", "TELEFONO", "N", True),
    ("R_ES_CLIENTE", "PERSONA", "1", False),
    ("R_ES_CLIENTE", "CLIENTE", "1", True),
    ("R_ES_AGENTE", "PERSONA", "1", False),
    ("R_ES_AGENTE", "AGENTE", "1", True),
    ("R_ES_ADMIN", "PERSONA", "1", False),
    ("R_ES_ADMIN", "ADMINISTRADOR", "1", True),
    ("R_REGISTRA", "AGENTE", "1", False),
    ("R_REGISTRA", "EVENTO", "N", True),
    ("R_REALIZA", "CLIENTE", "1", False),
    ("R_REALIZA", "RESERVA", "N", True),
    ("R_GENERA", "EVENTO", "1", False),
    ("R_GENERA", "RESERVA", "N", True),
]

# --- atributos: (entidad, texto, x, y, tipo) -------------------------------
# tipo: "" normal · "pk" clave · "parcial" clave parcial · "der" derivado
#       "multi" multivaluado · "comp" compuesto (tiene hijos)
ATRIBUTOS = [
    ("PAIS", "id_pais", 170, 60, "pk"),
    ("PAIS", "nombre", 430, 60, ""),
    ("DEPARTAMENTO", "id_departamento", 860, 60, "pk"),
    ("DEPARTAMENTO", "nombre", 1140, 60, ""),
    ("CIUDAD", "id_ciudad", 1570, 60, "pk"),
    ("CIUDAD", "nombre", 1830, 60, ""),

    ("PERSONA", "identificacion", 700, 560, "pk"),
    ("PERSONA", "nombre_completo", 420, 660, "comp"),
    ("PERSONA", "correo", 700, 420, ""),
    ("PERSONA", "direccion", 990, 420, ""),

    ("TELEFONO", "numero", 1000, 1380, "parcial"),

    ("CLIENTE", "puntos", 1560, 820, ""),
    ("CLIENTE", "ve_publicidad", 1930, 860, ""),
    ("AGENTE", "comision", 1620, 1520, ""),
    ("AGENTE", "experiencia", 1900, 1480, ""),
    ("ADMINISTRADOR", "salario", 250, 1250, ""),
    ("ADMINISTRADOR", "horario", 560, 1250, ""),

    ("EVENTO", "codigo_evento", 2830, 260, "pk"),
    ("EVENTO", "nombre", 3140, 350, ""),
    ("EVENTO", "descripcion", 2830, 440, ""),
    ("EVENTO", "teatro", 3140, 530, ""),
    ("EVENTO", "fecha_hora_inicio", 2860, 620, ""),
    ("EVENTO", "fecha_hora_fin", 3150, 710, ""),
    ("EVENTO", "capacidad_total", 2860, 800, ""),
    ("EVENTO", "precio_base", 3140, 890, ""),
    ("EVENTO", "observaciones", 2830, 980, ""),
    ("EVENTO", "estado", 3140, 1070, ""),
    ("EVENTO", "cupos_disponibles", 2830, 1160, "der"),

    ("RESERVA", "id_reserva", 2830, 1320, "pk"),
    ("RESERVA", "fecha_hora", 3140, 1410, ""),
    ("RESERVA", "numero_entradas", 2860, 1500, ""),
    ("RESERVA", "valor_total", 3140, 1590, "der"),
    ("RESERVA", "observaciones", 2830, 1680, ""),
    ("RESERVA", "estado", 3140, 1770, ""),
]

# atributos compuestos: (padre, texto, x, y)
HIJOS = [
    ("nombre_completo", "nombres", 180, 560),
    ("nombre_completo", "apellidos", 180, 760),
]

# medidas
EW, EH = 210, 70      # entidad
RW, RH = 190, 96      # relación (rombo)
AH = 52               # alto del atributo (elipse)


def ancho_attr(texto):
    """La elipse se ajusta al largo del nombre del atributo."""
    return max(150, int(len(texto) * 11.2) + 46)


def borde(cx, cy, w, h, hacia):
    """Punto del borde de una caja en dirección a otro punto."""
    dx, dy = hacia[0] - cx, hacia[1] - cy
    if dx == 0 and dy == 0:
        return cx, cy
    ex = w / 2.0 / abs(dx) if dx else float("inf")
    ey = h / 2.0 / abs(dy) if dy else float("inf")
    t = min(ex, ey)
    return cx + dx * t, cy + dy * t


def borde_rombo(cx, cy, w, h, hacia):
    dx, dy = hacia[0] - cx, hacia[1] - cy
    if dx == 0 and dy == 0:
        return cx, cy
    t = 1.0 / (abs(dx) / (w / 2.0) + abs(dy) / (h / 2.0))
    return cx + dx * t, cy + dy * t


def borde_elipse(cx, cy, w, h, hacia):
    dx, dy = hacia[0] - cx, hacia[1] - cy
    if dx == 0 and dy == 0:
        return cx, cy
    t = 1.0 / ((dx * dx) / (w * w / 4.0) + (dy * dy) / (h * h / 4.0)) ** 0.5
    return cx + dx * t, cy + dy * t


# ===========================================================================
# SVG
# ===========================================================================
def svg():
    p = []
    a = p.append
    a('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" font-family="Segoe UI, Arial, sans-serif">' % (W, H, W, H))
    a('<rect width="%d" height="%d" fill="%s"/>' % (W, H, FONDO))

    # --- líneas de atributos (primero, para que queden debajo) -------------
    for ent, txt, x, y, tipo in ATRIBUTOS:
        ex, ey, _ = ENTIDADES[ent]
        p1 = borde(ex, ey, EW, EH, (x, y))
        p2 = borde_elipse(x, y, ancho_attr(txt), AH, (ex, ey))
        a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2"/>' % (p1[0], p1[1], p2[0], p2[1], LINEA))
    for padre, txt, x, y in HIJOS:
        px, py = [(ax, ay) for _, t, ax, ay, _ in ATRIBUTOS if t == padre][0]
        p1 = borde_elipse(px, py, ancho_attr(padre), AH, (x, y))
        p2 = borde_elipse(x, y, ancho_attr(txt), AH, (px, py))
        a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2"/>' % (p1[0], p1[1], p2[0], p2[1], LINEA))

    # --- líneas entidad-relación -----------------------------------------
    for rel, ent, card, total in ARISTAS:
        rx, ry, _, _ = RELACIONES[rel]
        ex, ey, _ = ENTIDADES[ent]
        p1 = borde_rombo(rx, ry, RW, RH, (ex, ey))
        p2 = borde(ex, ey, EW, EH, (rx, ry))
        dx, dy = p2[0] - p1[0], p2[1] - p1[1]
        largo = (dx * dx + dy * dy) ** 0.5 or 1
        nx, ny = -dy / largo * 4, dx / largo * 4
        if total:
            for s in (1, -1):
                a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2"/>'
                  % (p1[0] + nx * s, p1[1] + ny * s, p2[0] + nx * s, p2[1] + ny * s, LINEA))
        else:
            a('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2"/>' % (p1[0], p1[1], p2[0], p2[1], LINEA))
        # cardinalidad cerca del rombo
        cx = p1[0] + dx * 0.26 + nx * 3.2
        cy = p1[1] + dy * 0.26 + ny * 3.2
        a('<circle cx="%.1f" cy="%.1f" r="17" fill="%s" stroke="%s" stroke-width="1.5"/>' % (cx, cy, FONDO, AZUL))
        a('<text x="%.1f" y="%.1f" text-anchor="middle" font-size="19" font-weight="700" fill="%s">%s</text>' % (cx, cy + 7, AZUL, card))

    # --- atributos --------------------------------------------------------
    for ent, txt, x, y, tipo in ATRIBUTOS + [(None, t, x, y, "") for _, t, x, y in HIJOS]:
        punteado = ' stroke-dasharray="7 5"' if tipo == "der" else ""
        rx = ancho_attr(txt) // 2
        a('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="%s" stroke="%s" stroke-width="2"%s/>'
          % (x, y, rx, AH // 2, VERDE_SUAVE, VERDE, punteado))
        if tipo == "multi":
            a('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="none" stroke="%s" stroke-width="2"/>' % (x, y, rx - 6, AH // 2 - 6, VERDE))
        deco = ""
        if tipo == "pk":
            deco = ' text-decoration="underline"'
        elif tipo == "parcial":
            deco = ' style="text-decoration:underline;text-decoration-style:dashed"'
        a('<text x="%d" y="%d" text-anchor="middle" font-size="19" fill="%s"%s>%s</text>' % (x, y + 7, TINTA, deco, txt))

    # --- entidades --------------------------------------------------------
    for nombre, (x, y, debil) in ENTIDADES.items():
        a('<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="%s" stroke="%s" stroke-width="2.5"/>'
          % (x - EW // 2, y - EH // 2, EW, EH, AZUL_SUAVE, AZUL))
        if debil:
            a('<rect x="%d" y="%d" width="%d" height="%d" rx="2" fill="none" stroke="%s" stroke-width="2"/>'
              % (x - EW // 2 + 8, y - EH // 2 + 8, EW - 16, EH - 16, AZUL))
        a('<text x="%d" y="%d" text-anchor="middle" font-size="22" font-weight="700" fill="%s">%s</text>' % (x, y + 8, TINTA, nombre))

    # --- relaciones -------------------------------------------------------
    for nombre, (x, y, ident, etiqueta) in RELACIONES.items():
        def rombo(w, h):
            return "%d,%d %d,%d %d,%d %d,%d" % (x, y - h // 2, x + w // 2, y, x, y + h // 2, x - w // 2, y)
        a('<polygon points="%s" fill="%s" stroke="%s" stroke-width="2.5"/>' % (rombo(RW, RH), AMBAR_SUAVE, AMBAR))
        if ident:
            a('<polygon points="%s" fill="none" stroke="%s" stroke-width="2"/>' % (rombo(RW - 22, RH - 22), AMBAR))
        a('<text x="%d" y="%d" text-anchor="middle" font-size="19" font-weight="600" fill="%s">%s</text>' % (x, y + 7, TINTA, etiqueta))

    # --- leyenda ----------------------------------------------------------
    lx, ly = 90, 1560
    a('<rect x="%d" y="%d" width="760" height="330" rx="14" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>' % (lx, ly))
    a('<text x="%d" y="%d" font-size="24" font-weight="700" fill="%s">Convenciones (notación de Chen)</text>' % (lx + 26, ly + 44, TINTA))
    filas = [
        ("Entidad", "rect", AZUL, AZUL_SUAVE, False),
        ("Entidad débil", "rect", AZUL, AZUL_SUAVE, True),
        ("Relación", "rombo", AMBAR, AMBAR_SUAVE, False),
        ("Relación identificadora", "rombo", AMBAR, AMBAR_SUAVE, True),
        ("Atributo · clave subrayada", "elipse", VERDE, VERDE_SUAVE, False),
        ("Atributo derivado (punteado)", "elipse", VERDE, VERDE_SUAVE, True),
    ]
    for i, (texto, forma, col, relleno, doble) in enumerate(filas):
        fy = ly + 86 + i * 40
        if forma == "rect":
            a('<rect x="%d" y="%d" width="64" height="28" fill="%s" stroke="%s" stroke-width="2"/>' % (lx + 30, fy - 14, relleno, col))
            if doble:
                a('<rect x="%d" y="%d" width="52" height="16" fill="none" stroke="%s" stroke-width="1.5"/>' % (lx + 36, fy - 8, col))
        elif forma == "rombo":
            cx2, cy2 = lx + 62, fy
            a('<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="%s" stroke="%s" stroke-width="2"/>'
              % (cx2, cy2 - 16, cx2 + 34, cy2, cx2, cy2 + 16, cx2 - 34, cy2, relleno, col))
            if doble:
                a('<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="none" stroke="%s" stroke-width="1.5"/>'
                  % (cx2, cy2 - 9, cx2 + 20, cy2, cx2, cy2 + 9, cx2 - 20, cy2, col))
        else:
            a('<ellipse cx="%d" cy="%d" rx="34" ry="15" fill="%s" stroke="%s" stroke-width="2"%s/>'
              % (lx + 62, fy, relleno, col, ' stroke-dasharray="6 4"' if doble else ""))
        a('<text x="%d" y="%d" font-size="19" fill="%s">%s</text>' % (lx + 118, fy + 7, TINTA, texto))
    a('<text x="%d" y="%d" font-size="17" fill="#5A5868">La línea doble marca participación total.</text>' % (lx + 30, ly + 316))

    a('<text x="%d" y="60" text-anchor="end" font-size="30" font-weight="700" fill="%s">TicketFlow · Diagrama Entidad-Relación (Chen)</text>' % (W - 60, TINTA))
    a('<text x="%d" y="94" text-anchor="end" font-size="19" fill="#5A5868">Proyecto Integrador 2026-2 · Bases de Datos y Programación en Ambiente Web I</text>' % (W - 60))
    a("</svg>")
    return "\n".join(p)


# ===========================================================================
# draw.io (mxGraph)
# ===========================================================================
def drawio():
    c = []
    ident = [2]

    def celda(valor, estilo, x, y, w, h):
        ident[0] += 1
        c.append('<mxCell id="n%d" value="%s" style="%s" vertex="1" parent="1"><mxGeometry x="%d" y="%d" width="%d" height="%d" as="geometry"/></mxCell>'
                 % (ident[0], valor, estilo, x - w // 2, y - h // 2, w, h))
        return "n%d" % ident[0]

    ids = {}
    for nombre, (x, y, debil) in ENTIDADES.items():
        estilo = "rounded=0;whiteSpace=wrap;html=1;fillColor=%s;strokeColor=%s;fontSize=16;fontStyle=1;%s" % (
            AZUL_SUAVE, AZUL, "shape=ext;double=1;" if debil else "")
        ids[nombre] = celda(nombre, estilo, x, y, EW, EH)
    for nombre, (x, y, ident_rel, etiqueta) in RELACIONES.items():
        estilo = "rhombus;whiteSpace=wrap;html=1;fillColor=%s;strokeColor=%s;fontSize=15;%s" % (
            AMBAR_SUAVE, AMBAR, "double=1;" if ident_rel else "")
        ids[nombre] = celda(etiqueta, estilo, x, y, RW, RH)
    for ent, txt, x, y, tipo in ATRIBUTOS + [(None, t, x, y, "") for _, t, x, y in HIJOS]:
        estilo = "ellipse;whiteSpace=wrap;html=1;fillColor=%s;strokeColor=%s;fontSize=14;" % (VERDE_SUAVE, VERDE)
        if tipo == "der":
            estilo += "dashed=1;"
        if tipo in ("pk", "parcial"):
            estilo += "fontStyle=4;"
        clave = txt + ("@" if ent is None else "")
        ids[clave] = celda(txt, estilo, x, y, ancho_attr(txt), AH)

    def arista(a, b, etiqueta=""):
        ident[0] += 1
        c.append('<mxCell id="e%d" value="%s" style="endArrow=none;html=1;strokeColor=%s;fontSize=14;fontStyle=1;" edge="1" parent="1" source="%s" target="%s"><mxGeometry relative="1" as="geometry"/></mxCell>'
                 % (ident[0], etiqueta, LINEA, a, b))

    for rel, ent, card, total in ARISTAS:
        arista(ids[rel], ids[ent], card)
    for ent, txt, x, y, tipo in ATRIBUTOS:
        arista(ids[ent], ids[txt])
    for padre, txt, x, y in HIJOS:
        arista(ids[padre], ids[txt + "@"])

    return ('<mxfile host="app.diagrams.net"><diagram name="DER Chen · TicketFlow">'
            '<mxGraphModel dx="1400" dy="900" grid="0" page="1" pageWidth="%d" pageHeight="%d" math="0" shadow="0">'
            '<root><mxCell id="0"/><mxCell id="1" parent="0"/>%s</root></mxGraphModel></diagram></mxfile>'
            % (W, H, "".join(c)))


# ===========================================================================
if __name__ == "__main__":
    ruta_svg = os.path.join(AQUI, "DER_Chen_TicketFlow.svg")
    open(ruta_svg, "w", encoding="utf-8").write(svg())
    open(os.path.join(AQUI, "DER_Chen_TicketFlow.drawio"), "w", encoding="utf-8").write(drawio())

    chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if os.path.exists(chrome):
        perfil = tempfile.mkdtemp(prefix="der-")
        html = os.path.join(perfil, "der.html")
        open(html, "w", encoding="utf-8").write(
            '<!doctype html><meta charset="utf-8"><style>html,body{margin:0}</style>' + svg())
        subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--force-device-scale-factor=1", "--user-data-dir=" + perfil,
                        "--virtual-time-budget=3000",
                        "--screenshot=" + os.path.join(AQUI, "DER_Chen_TicketFlow.png"),
                        "--window-size=%d,%d" % (W, H), "file:///" + html.replace("\\", "/")],
                       capture_output=True, timeout=90)
        shutil.rmtree(perfil, ignore_errors=True)

    print("entidades:", len(ENTIDADES), "| relaciones:", len(RELACIONES),
          "| atributos:", len(ATRIBUTOS) + len(HIJOS))
    for f in ("DER_Chen_TicketFlow.svg", "DER_Chen_TicketFlow.drawio", "DER_Chen_TicketFlow.png"):
        r = os.path.join(AQUI, f)
        print("  ", f, os.path.getsize(r) if os.path.exists(r) else "NO GENERADO")
