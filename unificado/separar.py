# -*- coding: utf-8 -*-
"""
Genera las 14 pantallas como archivos HTML independientes y numerados,
listos para importar de una en una a Figma (html.to.design).

Reutiliza las mismas correcciones que unir.py:
  - clases de layout del <body> conservadas
  - curvas SVG cortadas por Stitch reparadas
  - menu del panel de cliente traducido
  - clases font-* completadas con su tamano real
  - tarjeta del buscador reencuadrada
  - imagenes incrustadas en base64

Uso:  python separar.py
Salida: C:\\Users\\ederf\\Downloads\\tikec\\01-inicio.html ... 14-reportes.html
"""
import io, os, json, re

import unir  # reutiliza parseo, correcciones y mapa de imagenes

DESTINO = r"C:\Users\ederf\Downloads\tikec"

# numero -> (slug, nombre de archivo, titulo, rol)
NOMBRES = [
    "inicio", "iniciar-sesion", "registro-cliente", "registro-agente",
    "catalogo", "detalle-evento", "pago-reserva", "confirmacion",
    "mis-reservas", "panel-agente", "crear-evento", "reservas-evento",
    "dashboard-admin", "reportes-admin",
]


def main():
    print("TicketFlow - pantallas separadas\n")
    os.makedirs(DESTINO, exist_ok=True)

    imgs = unir.mapa_imagenes()
    print(f"  {len(imgs)} imagenes disponibles\n")

    # 1a pasada: fusionar el config de todas para que cada archivo comparta
    # el mismo sistema de diseno (colores, tipos, spacing)
    config = {}
    estilos = []
    for slug, _, _ in unir.PANTALLAS:
        ruta = os.path.join(unir.SRC, slug, "code.html")
        if not os.path.exists(ruta):
            continue
        html = unir.leer(slug)
        config = unir.fusionar(config, unir.sacar_config(html))
        for s in unir.sacar_estilos(html):
            if s not in estilos:
                estilos.append(s)

    css_extra = unir.css_tipografia(config)
    cfg_json = json.dumps(config, indent=2, ensure_ascii=False)
    estilos_txt = "\n".join(estilos)

    total = 0
    for idx, (slug, titulo, rol) in enumerate(unir.PANTALLAS, start=1):
        ruta = os.path.join(unir.SRC, slug, "code.html")
        if not os.path.exists(ruta):
            print(f"  ! falta {slug}")
            continue

        html = unir.leer(slug)
        body, clases_body = unir.sacar_body(html)
        body, _ = unir.reparar_svg(body)
        body, _ = unir.traducir(body)
        body, _ = unir.reparar_recortes(body)
        for url, uri in imgs.items():
            body = body.replace(url, uri)
        body = re.sub(r'https://lh3\.googleusercontent\.com/[^"\')\s]*',
                      'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 '
                      'width=%224%22 height=%223%22%3E%3Crect width=%224%22 height=%223%22 '
                      'fill=%22%23E2E8F0%22/%3E%3C/svg%3E', body)

        doc = f"""<!DOCTYPE html>
<html class="light" lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{idx:02d} &middot; {titulo} &mdash; TicketFlow</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<script>
tailwind.config = {cfg_json};
</script>
<style>
{estilos_txt}
{css_extra}
</style>
</head>
<body class="{clases_body}">
{body}
</body>
</html>"""

        nombre = f"{idx:02d}-{NOMBRES[idx-1]}.html"
        salida = os.path.join(DESTINO, nombre)
        io.open(salida, "w", encoding="utf-8").write(doc)
        kb = os.path.getsize(salida) // 1024
        print(f"  {nombre:<28} {kb:>5} KB   [{rol}]")
        total += 1

    print(f"\n  {total} archivos en {DESTINO}")


if __name__ == "__main__":
    main()
