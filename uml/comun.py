# -*- coding: utf-8 -*-
"""
Lo que comparten los tres diagramas UML: los colores, el tipo de letra y la
conversion del SVG a PNG con Chrome en segundo plano.
"""

import os
import shutil
import subprocess
import tempfile

TINTA = "#111827"
AZUL = "#493EE5"
AZUL_SUAVE = "#E3E1FF"
GRIS = "#5A5868"
LINEA = "#CBD5E1"
NARANJA = "#B45309"
FONDO = "#FFFFFF"
LETRA = "Segoe UI, Arial, sans-serif"

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def escapar(texto):
    return (texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def texto(x, y, contenido, tam=17, color=TINTA, peso="400", ancla="middle", cursiva=False):
    estilo = ' font-style="italic"' if cursiva else ""
    return ('<text x="%.1f" y="%.1f" font-size="%s" font-weight="%s" fill="%s" '
            'text-anchor="%s"%s>%s</text>'
            % (x, y, tam, peso, color, ancla, estilo, escapar(contenido)))


def multilinea(x, y, lineas, tam=17, color=TINTA, peso="400", ancla="middle", interlinea=None):
    salto = interlinea or tam + 5
    inicio = y - (len(lineas) - 1) * salto / 2.0
    return "\n".join(
        texto(x, inicio + i * salto, l, tam, color, peso, ancla) for i, l in enumerate(lineas)
    )


def pie(ancho, alto, titulo, subtitulo="Proyecto Integrador 2026-2 · Programación en Ambiente Web I"):
    return (texto(60, alto - 58, titulo, 26, TINTA, "700", "start") + "\n" +
            texto(60, alto - 30, subtitulo, 17, GRIS, "400", "start"))


def cabecera(ancho, alto):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" '
            'font-family="%s">\n<rect width="%d" height="%d" fill="%s"/>'
            % (ancho, alto, ancho, alto, LETRA, ancho, alto, FONDO))


def guardar(carpeta, nombre, contenido_svg, ancho, alto):
    """Escribe el .svg y, si hay Chrome, saca tambien el .png."""
    ruta_svg = os.path.join(carpeta, nombre + ".svg")
    open(ruta_svg, "w", encoding="utf-8").write(contenido_svg)

    ruta_png = os.path.join(carpeta, nombre + ".png")
    if os.path.exists(CHROME):
        perfil = tempfile.mkdtemp(prefix="uml-")
        html = os.path.join(perfil, "d.html")
        open(html, "w", encoding="utf-8").write(
            '<!doctype html><meta charset="utf-8"><style>html,body{margin:0}</style>' + contenido_svg
        )
        subprocess.run(
            [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
             "--force-device-scale-factor=1", "--user-data-dir=" + perfil,
             "--virtual-time-budget=3000", "--screenshot=" + ruta_png,
             "--window-size=%d,%d" % (ancho, alto),
             "file:///" + html.replace("\\", "/")],
            capture_output=True, timeout=90)
        shutil.rmtree(perfil, ignore_errors=True)

    for r in (ruta_svg, ruta_png):
        print("   %-44s %s" % (os.path.basename(r),
                               os.path.getsize(r) if os.path.exists(r) else "NO GENERADO"))
