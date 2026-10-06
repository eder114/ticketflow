# -*- coding: utf-8 -*-
"""
Diagrama del modelo relacional de TicketFlow: las tablas con sus columnas
y las flechas de las llaves foraneas.

Genera:
    Diagrama_Relacional_TicketFlow.svg
    Diagrama_Relacional_TicketFlow.png
"""

import os
import subprocess
import tempfile
import shutil

AQUI = os.path.dirname(os.path.abspath(__file__))
W, H = 2180, 1280

TINTA = "#111827"
AZUL = "#493EE5"
AZUL_CAB = "#E3E1FF"
GRIS = "#5A5868"
LINEA = "#CBD5E1"
FLECHA = "#B45309"
FONDO = "#FFFFFF"
FILA = 30
CAB = 42

# tabla -> (x, y, [(columna, tipo)]) · tipo: "pk" | "fk" | "pkfk" | ""
TABLAS = {
    "pais": (60, 60, [("id_pais", "pk"), ("nombre", "")]),
    "departamento": (60, 260, [("id_departamento", "pk"), ("nombre", ""), ("id_pais", "fk")]),
    "ciudad": (60, 490, [("id_ciudad", "pk"), ("nombre", ""), ("id_departamento", "fk")]),
    "persona": (600, 60, [("identificacion", "pk"), ("nombres", ""), ("apellidos", ""),
                          ("correo", ""), ("contrasena", ""), ("direccion", ""),
                          ("id_ciudad", "fk")]),
    "telefono": (600, 350, [("identificacion", "pkfk"), ("numero", "pk")]),
    "cliente": (600, 550, [("identificacion", "pkfk"), ("puntos", ""), ("ve_publicidad", "")]),
    "agente": (600, 770, [("identificacion", "pkfk"), ("comision", ""), ("experiencia", "")]),
    "administrador": (600, 990, [("identificacion", "pkfk"), ("salario", ""), ("horario", "")]),
    "evento": (1400, 60, [("codigo_evento", "pk"), ("nombre", ""), ("descripcion", ""),
                          ("teatro", ""), ("fecha_hora_inicio", ""), ("fecha_hora_fin", ""),
                          ("capacidad_total", ""), ("precio_base", ""), ("observaciones", ""),
                          ("estado", ""), ("causa_cancelacion", ""),
                          ("id_ciudad", "fk"), ("identificacion_agente", "fk")]),
    "reserva": (1400, 620, [("id_reserva", "pk"), ("fecha_hora", ""), ("numero_entradas", ""),
                            ("observaciones", ""), ("estado", ""), ("causa_cancelacion", ""),
                            ("identificacion_cliente", "fk"), ("codigo_evento", "fk")]),
}

# (tabla origen, columna, tabla destino, canal x, lado de salida)
# canal: x por donde baja o sube la linea. None = linea directa al lado.
FK = [
    ("departamento", "id_pais", "pais", 20, "izq"),
    ("ciudad", "id_departamento", "departamento", 20, "izq"),
    ("persona", "id_ciudad", "ciudad", 520, "izq"),
    ("telefono", "identificacion", "persona", 560, "izq"),
    ("cliente", "identificacion", "persona", 540, "izq"),
    ("agente", "identificacion", "persona", 520, "izq"),
    ("administrador", "identificacion", "persona", 500, "izq"),
    ("evento", "id_ciudad", "ciudad", 1340, "izq"),
    ("evento", "identificacion_agente", "agente", 1360, "izq"),
    ("reserva", "identificacion_cliente", "cliente", 1320, "izq"),
    ("reserva", "codigo_evento", "evento", 2140, "der"),
]


def ancho(tabla):
    cols = TABLAS[tabla][2]
    largo = max([len(tabla)] + [len(c) + (5 if t else 0) for c, t in cols])
    return max(280, int(largo * 10.5) + 90)


def alto(tabla):
    return CAB + FILA * len(TABLAS[tabla][2])


def fila_y(tabla, columna):
    x, y, cols = TABLAS[tabla]
    for i, (c, _) in enumerate(cols):
        if c == columna:
            return y + CAB + FILA * i + FILA / 2.0
    raise KeyError(columna)


def svg():
    s = []
    a = s.append
    a('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" font-family="Segoe UI, Arial, sans-serif">' % (W, H, W, H))
    a('<rect width="%d" height="%d" fill="%s"/>' % (W, H, FONDO))
    a('<defs><marker id="punta" markerWidth="11" markerHeight="11" refX="9" refY="4" orient="auto">'
      '<path d="M0,0 L9,4 L0,8 z" fill="%s"/></marker></defs>' % FLECHA)

    # --- flechas de llave foranea ----------------------------------------
    for origen, columna, destino, canal, lado in FK:
        ox, oy, _ = TABLAS[origen]
        dx, dy, _ = TABLAS[destino]
        y1 = fila_y(origen, columna)
        x1 = ox if lado == "izq" else ox + ancho(origen)
        y2 = dy + CAB / 2.0                      # entra por el encabezado
        x2 = dx if canal < dx else dx + ancho(destino)
        puntos = "%.1f,%.1f %.1f,%.1f %.1f,%.1f %.1f,%.1f" % (x1, y1, canal, y1, canal, y2, x2, y2)
        a('<polyline points="%s" fill="none" stroke="%s" stroke-width="2.4" marker-end="url(#punta)"/>' % (puntos, FLECHA))
        a('<circle cx="%.1f" cy="%.1f" r="4" fill="%s"/>' % (x1, y1, FLECHA))

    # --- tablas -----------------------------------------------------------
    for nombre, (x, y, cols) in TABLAS.items():
        w, h = ancho(nombre), alto(nombre)
        a('<rect x="%d" y="%d" width="%d" height="%d" rx="10" fill="#fff" stroke="%s" stroke-width="2"/>' % (x, y, w, h, AZUL))
        a('<path d="M%d %d h%d v%d a10,10 0 0 1 -10,10 h-%d a10,10 0 0 1 -10,-10 z" fill="%s"/>'
          % (x, y + CAB, w, 0, w - 20, AZUL_CAB))
        a('<rect x="%d" y="%d" width="%d" height="%d" rx="10" fill="%s"/>' % (x, y, w, CAB, AZUL_CAB))
        a('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (x, y + CAB - 10, w, 10, AZUL_CAB))
        a('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2"/>' % (x, y + CAB, x + w, y + CAB, AZUL))
        a('<text x="%d" y="%d" font-size="21" font-weight="700" fill="%s">%s</text>' % (x + 16, y + 28, TINTA, nombre))

        for i, (col, tipo) in enumerate(cols):
            fy = y + CAB + FILA * i
            if i:
                a('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1"/>' % (x + 8, fy, x + w - 8, fy, LINEA))
            deco = ' text-decoration="underline"' if tipo in ("pk", "pkfk") else ""
            peso = "700" if tipo in ("pk", "pkfk") else "400"
            a('<text x="%d" y="%d" font-size="17" font-weight="%s" fill="%s"%s>%s</text>'
              % (x + 16, fy + 21, peso, TINTA, deco, col))
            etiqueta = {"pk": "PK", "fk": "FK", "pkfk": "PK, FK"}.get(tipo, "")
            if etiqueta:
                color = FLECHA if "FK" in etiqueta else AZUL
                a('<text x="%d" y="%d" font-size="13" font-weight="700" text-anchor="end" fill="%s">%s</text>'
                  % (x + w - 14, fy + 20, color, etiqueta))

    # --- leyenda ----------------------------------------------------------
    lx, ly = 1400, 1120
    a('<rect x="%d" y="%d" width="700" height="120" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>' % (lx, ly))
    a('<text x="%d" y="%d" font-size="19" font-weight="700" fill="%s">Cómo se lee</text>' % (lx + 22, ly + 34, TINTA))
    a('<text x="%d" y="%d" font-size="17" fill="%s">PK = llave primaria (subrayada) · FK = llave foránea</text>' % (lx + 22, ly + 66, GRIS))
    a('<text x="%d" y="%d" font-size="17" fill="%s">La flecha va de la llave foránea a la tabla a la que apunta.</text>' % (lx + 22, ly + 96, GRIS))

    a('<text x="60" y="%d" font-size="26" font-weight="700" fill="%s">TicketFlow · Modelo relacional</text>' % (H - 90, TINTA))
    a('<text x="60" y="%d" font-size="17" fill="%s">Proyecto Integrador 2026-2 · Bases de Datos y Programación en Ambiente Web I</text>' % (H - 60, GRIS))
    a("</svg>")
    return "\n".join(s)


if __name__ == "__main__":
    ruta = os.path.join(AQUI, "Diagrama_Relacional_TicketFlow.svg")
    open(ruta, "w", encoding="utf-8").write(svg())

    chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if os.path.exists(chrome):
        perfil = tempfile.mkdtemp(prefix="rel-")
        html = os.path.join(perfil, "rel.html")
        open(html, "w", encoding="utf-8").write('<!doctype html><meta charset="utf-8"><style>html,body{margin:0}</style>' + svg())
        subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--force-device-scale-factor=1", "--user-data-dir=" + perfil,
                        "--virtual-time-budget=3000",
                        "--screenshot=" + os.path.join(AQUI, "Diagrama_Relacional_TicketFlow.png"),
                        "--window-size=%d,%d" % (W, H), "file:///" + html.replace("\\", "/")],
                       capture_output=True, timeout=90)
        shutil.rmtree(perfil, ignore_errors=True)

    print("tablas:", len(TABLAS), "| llaves foraneas:", len(FK))
    for f in ("Diagrama_Relacional_TicketFlow.svg", "Diagrama_Relacional_TicketFlow.png"):
        r = os.path.join(AQUI, f)
        print("  ", f, os.path.getsize(r) if os.path.exists(r) else "NO GENERADO")
